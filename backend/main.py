"""
FastAPI Backend — AI Helpdesk Ticket Analyzer
POST /ai/analyze_ticket  →  full analysis of a support ticket
GET  /health             →  service health check
"""

import os
import sys
import uuid
import json
import datetime
import traceback
import warnings
import logging
import hashlib
from contextlib import asynccontextmanager

# Suppress harmless PyTorch CPU pin_memory warning
warnings.filterwarnings("ignore", message="'pin_memory'")

# HF Rebuild Trigger: 2026-03-08-2030
from fastapi import FastAPI, Depends, Header, HTTPException, Request, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse, FileResponse
from fastapi.encoders import jsonable_encoder
import asyncio
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from backend/.env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Apply database encryption for PII fields
try:
    from backend.auth.crypto import apply_db_encryption_patch
    apply_db_encryption_patch()
except Exception as e:
    print(f"[WARNING] Database encryption patch initialization failed: {e}")


# Initialize Supabase Client (Service Role for backend bypass)
try:
    from supabase import create_client, Client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
        supabase = None
    else:
        supabase = create_client(url, key)
except (ImportError, Exception) as e:
    print(f"[WARNING] Supabase initialization failed: {e}")
    supabase = None
    Client = None

# Ensure project root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.classifier_service import ClassifierService
from backend.services.classifier_v2 import classifier_v2
from backend.services.classifier_v3 import classifier_v3 # V3 Power Model
from backend.services.ner_service import NERService
from backend.services.duplicate_service import DuplicateService
from backend.services.rag_service import RagService
from backend.services.sla_service import (
    calculate_sla_breach_at,
    calculate_sla_response_at,
    classify_sla_status,
    load as load_sla_service,
    run_sla_escalation_loop,
)
from backend.services.spam_detector_service import analyze_spam_phishing


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
def get_system_settings(company_id: str) -> dict:
    defaults = {
        "ai_confidence_threshold": 0.80,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False
    }
    if not supabase or not company_id:
        return defaults
    try:
        res = supabase.table("system_settings").select(
            "ai_confidence_threshold, duplicate_sensitivity, enable_auto_resolve"
        ).eq("company_id", company_id).single().execute()
        if res.data:
            return {**defaults, **res.data}
    except Exception as e:
        print(f"[WARNING] Could not fetch system_settings for company_id={company_id}: {e}")
    return defaults


def get_duplicate_threshold(company_id: str | None, fallback: float = 0.85) -> float:
    if not company_id:
        return fallback
    settings = get_system_settings(company_id)
    try:
        return float(settings.get("duplicate_sensitivity", fallback))
    except (TypeError, ValueError):
        return fallback


def detect_semantic_duplicate(text: str, *, company_id: str | None, threshold: float) -> dict:
    try:
        return duplicate_service.find_semantic_duplicate(
            text,
            threshold=threshold,
            company_id=company_id,
            supabase_client=supabase,
        )
    except Exception as error:
        print(f"[WARNING] Duplicate detection fallback activated: {error}")
        duplicate_result = duplicate_service.check_duplicate(text, threshold=threshold)
        duplicate_result["parent_ticket_id"] = duplicate_result.get("duplicate_ticket_id")
        duplicate_result["is_potential_duplicate"] = duplicate_result.get("is_duplicate", False)
        return duplicate_result
class TicketRequest(BaseModel):
    text: str
    image_base64: str = ""
    image_text: str = "" # Keep for backward compatibility
    user_id: str | None = None
    company: str | None = None
    company_id: str | None = None
    image_url: str | None = None
    confidence_threshold: float = 0.20
    duplicate_sensitivity: float = 0.85

class TicketSaveRequest(BaseModel):
    user_id: str
    subject: str
    description: str
    category: str
    subcategory: str
    priority: str
    assigned_team: str
    status: str
    auto_resolve: bool
    is_duplicate: bool
    confidence: float
    image_url: str | None = None
    company: str | None = None
    company_id: str | None = None
    description_vector: list[float] | None = None
    is_potential_duplicate: bool = False
    parent_ticket_id: str | None = None
    sla_response_due_at: str | None = None
    sla_breach_at: str
    sla_status: str | None = None
    escalation_level: int = 0
    metadata: dict = {}
    entities: list = []
    solution_steps: list = []
    ocr_text: str = ""
    needs_review: bool = False
    routing_confidence: float = 0.0



class DuplicateInfo(BaseModel):
    is_duplicate: bool
    duplicate_ticket_id: str | None = None
    parent_ticket_id: str | None = None
    is_potential_duplicate: bool = False
    similarity: float = 0.0


class EntityInfo(BaseModel):
    text: str
    label: str
    confidence: float


class TicketResponse(BaseModel):
    id: str | int | None = None
    ticket_id: str | None = None
    summary: str
    category: str
    subcategory: str
    priority: str
    auto_resolve: bool
    assigned_team: str
    entities: list[EntityInfo]
    duplicate_ticket: DuplicateInfo
    confidence: float
    is_potential_duplicate: bool = False
    parent_ticket_id: str | None = None
    needs_review: bool = False
    reasoning: str = ""
    decision_factors: list[str] = []
    image_description: str = ""
    ocr_text: str = ""
    image_url: str | None = None
    highlights: list[str] = []
    timeline: dict = {} # Map of step_name: timestamp
    env_metadata: dict = {} # IP, Hostname, Browser/OS
    sla_breach_at: str | None = None
    spam_analysis: dict | None = None
    version: str = "2.1.0-Neural-Diagnostic"


# --- Persistence Models ---
class Message(BaseModel):
    sender: str
    message: str
    timestamp: str


class TicketRecord(BaseModel):
    ticket_id: str
    owner_id: str
    summary: str
    category: str
    subcategory: str
    priority: str
    status: str
    assigned_team: str
    created_at: str
    updated_at: str | None = None
    last_user_viewed_at: str | None = None
    messages: list[Message] = []
    metadata: dict = {}
    timeline: dict = {} # Milestones: created, analyzed, triaged, routed, in_progress, resolved


# --- In-Memory Database (to be replaced with SQL later) ---
TICKETS_DB: list[TicketRecord] = []


class HealthResponse(BaseModel):
    status: str
    classifier_loaded: bool
    ner_loaded: bool


class ReadinessResponse(BaseModel):
    status: str
    checks: dict[str, bool]


# ---------------------------------------------------------------------------
# Service singletons
# ---------------------------------------------------------------------------
classifier_service = ClassifierService()
ner_service = NERService()
duplicate_service = DuplicateService()
rag_service = RagService()

try:
    from backend.services.gemini_service import GeminiService
    gemini_service = GeminiService()
except ImportError:
    gemini_service = None

try:
    from backend.services.ocr_service import OCRService
    ocr_service = OCRService()
except ImportError:
    ocr_service = None


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all models at startup."""
    print("[Startup] Loading AI models ...")
    try:
        classifier_service.load()
    except Exception as e:
        print(f"[WARNING] Classifier not loaded: {e}")
    try:
        ner_service.load()
    except Exception as e:
        print(f"[WARNING] NER not loaded: {e}")
    try:
        duplicate_service.load()
    except Exception as e:
        print(f"[WARNING] Duplicate service not loaded: {e}")
    try:
        rag_service.load()
    except Exception as e:
        print(f"[WARNING] RAG service not loaded: {e}")
    
    if gemini_service:
        print(f"[Startup] Gemini Service: {'Initialized' if gemini_service._initialized else 'FAILED (Key missing or SDK error)'}")
    else:
        print("[Startup] Gemini Service: NOT LOADED (Import failed)")

    print("[Startup] Classifier V2 Shadow: Ready.")
    print("[Startup] Ready.")
    # Strict health checks: fail loudly when core model assets are unavailable.
    # Set ALLOW_DEGRADED_STARTUP=1 to permit degraded startup for local/dev convenience.
    try:
        strict_mode = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") != "1"
    except Exception:
        strict_mode = True

    classifier_loaded_flag = getattr(classifier_service, "_loaded", False)
    ner_loaded_flag = getattr(ner_service, "_loaded", False)

    if strict_mode and not classifier_loaded_flag:
        raise RuntimeError("[Startup-FATAL] Classifier assets not loaded. Set ALLOW_DEGRADED_STARTUP=1 to bypass.")

    sla_task = None
    try:
        if supabase and os.environ.get("SLA_ESCALATION_ENABLED", "true").lower() == "true":
            notification_router = None
            try:
                from backend.services.notification_routing import load as load_notification_router
                notification_router = load_notification_router()
            except Exception as e:
                print(f"[WARNING] Notification router not loaded for SLA service: {e}")
            sla_service = load_sla_service(supabase, notification_router)
            interval = int(os.environ.get("SLA_ESCALATION_INTERVAL_SECONDS", "300"))
            sla_task = asyncio.create_task(run_sla_escalation_loop(sla_service, interval_seconds=interval))
            print(f"[Startup] SLA escalation loop enabled ({interval}s interval).")

        yield
    finally:
        if sla_task:
            sla_task.cancel()
            try:
                await sla_task
            except asyncio.CancelledError:
                pass
        print("[Shutdown] Cleaning up ...")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AI Helpdesk Backend",
    description="Ticket classification, entity extraction, and duplicate detection",
    version="1.0.0",
    lifespan=lifespan,
)

# Rate limiter — 10 AI requests per minute per IP (free tier protection)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — locked to production + local dev only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://helpdeskaiv1.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Root & Health check
# ---------------------------------------------------------------------------
@app.get("/", response_class=FileResponse)
async def root():
    return FileResponse(Path(__file__).parent / "templates" / "index.html")


async def verify_metrics_token(x_metrics_token: str | None = Header(default=None)):
    expected_token = os.environ.get("METRICS_TOKEN")
    if expected_token and x_metrics_token != expected_token:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/metrics", dependencies=[Depends(verify_metrics_token)])
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        classifier_loaded=classifier_service._loaded,
        ner_loaded=ner_service._loaded,
    )


@app.get("/ready", response_model=ReadinessResponse)
async def readiness_check():
    require_supabase = os.environ.get("REQUIRE_SUPABASE", "false").lower() == "true"
    allow_degraded = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"
    
    checks = {
        "api": True,
        "classifier_loaded": classifier_service._loaded,
        "ner_loaded": ner_service._loaded,
        "duplicate_index_loaded": duplicate_service.is_available(),
        "rag_loaded": rag_service.is_available(),
    }
    if require_supabase:
        checks["supabase_configured"] = supabase is not None

    # In degraded mode, duplicate and RAG services are optional
    if allow_degraded:
        required_checks = {k: v for k, v in checks.items() if k not in ["duplicate_index_loaded", "rag_loaded"]}
        all_required_pass = all(required_checks.values())
        
        if all_required_pass:
            return ReadinessResponse(status="ready", checks=checks)
    else:
        # Strict mode: all checks must pass
        if all(checks.values()):
            return ReadinessResponse(status="ready", checks=checks)

    return JSONResponse(
        status_code=503,
        content=jsonable_encoder(ReadinessResponse(status="not_ready", checks=checks)),
    )


class TroubleshootRequest(BaseModel):
    text: str
    category: str
    history: list[dict] = []

class TroubleshootResponse(BaseModel):
    step_text: str
    options: list[str]
    is_final: bool

@app.post("/ai/troubleshoot", response_model=TroubleshootResponse)
async def troubleshoot(request: TroubleshootRequest):
    """Get dynamic troubleshooting steps from Gemini."""
    if not gemini_service or not gemini_service._initialized:
        return TroubleshootResponse(
            step_text="AI Troubleshooting is currently unavailable.",
            options=["Continue to tracking"],
            is_final=True
        )
    
    result = gemini_service.get_troubleshooting_step(
        request.text,
        request.history,
        request.category
    )
    return TroubleshootResponse(**result)


class BugReportAnalysisRequest(BaseModel):
    bug_title: str
    description: str
    steps_to_reproduce: str = ""
    console_errors: list[str] = []

class BugReportAnalysisResponse(BaseModel):
    probable_cause: str

@app.post("/ai/analyze_bug", response_model=BugReportAnalysisResponse)
async def analyze_bug(request: BugReportAnalysisRequest):
    """Analyze a bug report using Gemini to generate a Probable Cause."""
    if not gemini_service or not gemini_service._initialized:
        return BugReportAnalysisResponse(
            probable_cause="AI Diagnostics are currently unavailable."
        )
    
    cause = gemini_service.analyze_bug_report(
        request.bug_title,
        request.description,
        request.steps_to_reproduce,
        request.console_errors
    )
    return BugReportAnalysisResponse(probable_cause=cause)


# ---------------------------------------------------------------------------
# Admin Correction Logging endpoint
# ---------------------------------------------------------------------------
CORRECTIONS_LOG_PATH = Path(__file__).parent / "data" / "corrections_log.json"

@app.post("/ai/log_correction")
async def log_correction(raw_request: Request):
    """Log an admin correction when the AI prediction differs from the human decision."""
    try:
        body = await raw_request.json()
    except Exception as e:
        print(f"[CORRECTION ERROR] Could not parse request body: {e}")
        return {"status": "error", "message": "Invalid JSON body"}

    print(f"[CORRECTION RECEIVED] Payload keys: {list(body.keys())}")

    ticket_id = str(body.get("ticket_id", "unknown"))
    original_text = str(body.get("original_text", ""))
    ocr_text = str(body.get("ocr_text", ""))
    confidence = float(body.get("confidence") or 0.0)
    original_prediction = body.get("original_prediction") or {}
    corrected_prediction = body.get("corrected_prediction") or {}

    # Only log if something actually changed
    changed_fields = [
        field for field in ["category", "subcategory", "priority", "assigned_team"]
        if original_prediction.get(field) != corrected_prediction.get(field)
    ]

    if not changed_fields:
        return {"status": "no_change", "message": "Prediction matches correction, nothing logged."}

    entry = {
        "ticket_id": ticket_id,
        "original_text": original_text,
        "ocr_text": ocr_text,
        "original_prediction": original_prediction,
        "corrected_prediction": corrected_prediction,
        "changed_fields": changed_fields,
        "confidence": confidence,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

    try:
        if CORRECTIONS_LOG_PATH.exists() and CORRECTIONS_LOG_PATH.stat().st_size > 2:
            with open(CORRECTIONS_LOG_PATH, "r", encoding="utf-8") as f:
                logs = json.load(f)
        else:
            logs = []

        logs.append(entry)

        with open(CORRECTIONS_LOG_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2)

        print(f"[CORRECTION SAVED] Ticket ID: {ticket_id} | Changed: {changed_fields}")
        return {"status": "saved", "changed_fields": changed_fields}

    except Exception as e:
        print(f"[CORRECTION ERROR] Could not save: {e}")
        return {"status": "error", "message": str(e)}


# ---------------------------------------------------------------------------
# Ticket operations (Now via Supabase)
# ---------------------------------------------------------------------------
@app.get("/tickets")
async def get_tickets(company_id: str | None = None):
    """Fetch persistent tickets from Supabase."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    
    query = supabase.table("tickets").select("*").order("created_at", desc=True)
    if company_id:
        query = query.eq("company_id", company_id)
        
    res = query.execute()
    return res.data

@app.get("/tickets/search")
async def search_tickets(q: str | None = None, company_id: str | None = None, limit: int = 50, offset: int = 0):
    """Search tickets using tenant-safe full-text search."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    if not q:
        raise HTTPException(status_code=400, detail="Search query is required")
    if not company_id:
        raise HTTPException(status_code=400, detail="company_id is required for tenant-safe search")

    try:
        result = supabase.rpc(
            "search_tickets",
            {
                "query_text": q,
                "company_id": company_id,
                "limit_rows": limit,
                "offset_rows": offset,
            },
        ).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {e}")

@app.post("/tickets/save")
async def save_ticket(request_body: TicketSaveRequest):
    """
    OFFICIAL PERSISTENCE: Saves the analyzed ticket to Supabase.
    This is called AFTER the user confirms the analysis results.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection not initialized.")

    logger = logging.getLogger(__name__)
    try:
        final_data = request_body.dict()

        # Resolve tenant linkage from user profile with authorization validation.
        profile = {}
        if request_body.user_id:
            try:
                profile_res = (
                    supabase.table("profiles")
                    .select("company_id, company")
                    .eq("id", request_body.user_id)
                    .single()
                    .execute()
                )
                profile = profile_res.data or {}
                if not profile:
                    raise HTTPException(status_code=404, detail="User profile not found")
                
                # SELF-HEALING: If company_id is null in database but company name exists, resolve it!
                if not profile.get("company_id") and profile.get("company"):
                    try:
                        comp_name = profile.get("company").strip()
                        comp_res = (
                            supabase.table("companies")
                            .select("id")
                            .ilike("name", comp_name)
                            .execute()
                        )
                        if comp_res.data:
                            resolved_company_id = comp_res.data[0]["id"]
                            # Backfill the profile table in real-time
                            supabase.table("profiles").update({"company_id": resolved_company_id}).eq("id", request_body.user_id).execute()
                            profile["company_id"] = resolved_company_id
                            logger.info(f"[SELF-HEALING] Backfilled company_id={resolved_company_id} for user={request_body.user_id}")
                    except Exception as healing_err:
                        logger.warning(f"[SELF-HEALING WARNING] Failed to backfill company_id: {healing_err}")
            except HTTPException:
                raise
            except Exception as profile_error:
                user_hash = hashlib.sha256(str(request_body.user_id).encode()).hexdigest()[:8]
                logger.error(f"Tenant resolution error for user {user_hash}: {profile_error}")
                raise HTTPException(status_code=503, detail="Failed to resolve tenant linkage") from profile_error

        # Validate tenant consistency and authorization.
        profile_company_id = profile.get("company_id")
        if final_data.get("company_id"):
            # User provided company_id: verify it matches their profile.
            if profile_company_id and final_data["company_id"] != profile_company_id:
                user_hash = hashlib.sha256(str(request_body.user_id).encode()).hexdigest()[:8]
                logger.warning(f"Tenant mismatch: user {user_hash} attempted {final_data['company_id']}, assigned to {profile_company_id}")
                raise HTTPException(status_code=403, detail="User not authorized for this tenant")
        elif profile_company_id:
            # Backfill company_id from profile.
            final_data["company_id"] = profile_company_id
        elif request_body.user_id:
            # User has no tenant assignment.
            raise HTTPException(status_code=400, detail="User has no tenant assignment")

        # Backfill company name if missing.
        if not final_data.get("company") and profile.get("company"):
            final_data["company"] = profile["company"]

        priority = final_data.get("priority")
        if not final_data.get("sla_response_due_at"):
            final_data["sla_response_due_at"] = calculate_sla_response_at(priority).isoformat().replace("+00:00", "Z")
        if not final_data.get("sla_breach_at"):
            final_data["sla_breach_at"] = calculate_sla_breach_at(priority).isoformat().replace("+00:00", "Z")
        final_data["sla_status"] = final_data.get("sla_status") or classify_sla_status(final_data.get("sla_breach_at"))
        final_data["escalation_level"] = int(final_data.get("escalation_level") or 0)

        import hashlib
        user_hash = hashlib.sha256(str(request_body.user_id).encode()).hexdigest()[:8]
        logger.info(f"Tenant linkage: user_hash={user_hash}, company_id={final_data.get('company_id')}")

        duplicate_text = (request_body.description or "").strip() or (request_body.subject or "").strip()
        duplicate_threshold = get_duplicate_threshold(final_data.get("company_id"), 0.85)
        duplicate_result = {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "parent_ticket_id": None,
            "is_potential_duplicate": False,
            "similarity": 0.0,
        }

        if duplicate_text:
            duplicate_result = detect_semantic_duplicate(
                duplicate_text,
                company_id=final_data.get("company_id"),
                threshold=duplicate_threshold,
            )
            final_data["description_vector"] = duplicate_service.generate_embedding(duplicate_text)
        else:
            final_data["description_vector"] = None

        final_data["is_potential_duplicate"] = duplicate_result.get("is_potential_duplicate", False)
        final_data["parent_ticket_id"] = duplicate_result.get("parent_ticket_id")

        # --- Sanitize payload to only include valid Supabase DB columns ---
        # Extra AI telemetry and non-existent schema fields are merged into the metadata JSONB column
        # to avoid 400/500 errors from unknown column names in the insert call.
        VALID_TICKET_COLUMNS = {
            "user_id", "subject", "description", "category", "subcategory",
            "priority", "assigned_team", "status", "auto_resolve", "is_duplicate",
            "confidence", "image_url", "company", "company_id", "sla_breach_at", "metadata",
        }
        # Merge any extra telemetry and SLA/duplicate fields into metadata before filtering
        existing_metadata = final_data.get("metadata") or {}
        extra_keys = (
            "entities", "solution_steps", "ocr_text", "needs_review", "routing_confidence",
            "is_potential_duplicate", "parent_ticket_id", "sla_response_due_at", "sla_status", "escalation_level",
            "spam_analysis"
        )
        for extra_key in extra_keys:
            if extra_key in final_data and final_data[extra_key] not in (None, "", [], {}):
                existing_metadata[extra_key] = final_data[extra_key]
        final_data["metadata"] = existing_metadata

        # Strip keys not accepted by the DB schema
        insert_data = {k: v for k, v in final_data.items() if k in VALID_TICKET_COLUMNS}

        res = supabase.table("tickets").insert(insert_data).execute()
        
        if not res.data:
            raise Exception("Failed to insert ticket into database.")
            
        ticket_id = res.data[0]["id"]

        duplicate_indexed = True
        duplicate_index_warning = None
        if duplicate_text:
            try:
                duplicate_service.add_ticket(str(ticket_id), duplicate_text)
            except Exception as index_error:
                duplicate_indexed = False
                duplicate_index_warning = "Duplicate index update failed."
                print(f"[WARNING] {duplicate_index_warning} ticket_id={ticket_id} error={index_error}")
        else:
            duplicate_indexed = False
            duplicate_index_warning = "Duplicate index update skipped: no description or subject text was provided."
            print(f"[WARNING] {duplicate_index_warning}")
        
        # Add initial system diagnostic message
        msg = "Our Neural Engine has successfully triaged your issue and routed it to the designated team."
        if final_data["auto_resolve"]:
            msg = "AI Auto-Resolution active: A verified solution has been identified. Please review the attached resolution steps."

        supabase.table("ticket_messages").insert({
            "ticket_id": ticket_id,
            "sender_id": "00000000-0000-0000-0000-000000000000", # System ID
            "sender_name": "AI Assistant",
            "sender_role": "admin",
            "message": msg
        }).execute()
        
        response = {
            "status": "success",
            "ticket_id": ticket_id,
            "duplicate_indexed": duplicate_indexed,
            "is_potential_duplicate": final_data["is_potential_duplicate"],
            "parent_ticket_id": final_data["parent_ticket_id"],
        }
        if duplicate_index_warning:
            response["duplicate_index_warning"] = duplicate_index_warning
        return response

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tickets/{ticket_id}")
async def get_ticket_by_id(ticket_id: str):
    """Fetch single persistent ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    
    res = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return res.data


@app.post("/tickets", response_model=TicketRecord)
async def create_ticket(ticket: TicketRecord):
    """Save a new ticket into the system."""
    # Check for duplicates before adding
    existing = next((t for t in TICKETS_DB if t.ticket_id == ticket.ticket_id), None)
    if existing:
        return existing
        
    TICKETS_DB.append(ticket)
    print(f"[DB] Ticket #{ticket.ticket_id} created for user {ticket.owner_id}")
    return ticket


@app.patch("/tickets/{ticket_id}", response_model=TicketRecord)
async def update_ticket(ticket_id: str, updates: dict):
    """Partially update a ticket's fields (e.g., status, viewed_at)."""
    for i, ticket in enumerate(TICKETS_DB):
        if str(ticket.ticket_id) == str(ticket_id):
            # Convert to dict, update, then back to model
            ticket_dict = ticket.dict()
            ticket_dict.update(updates)
            updated_ticket = TicketRecord(**ticket_dict)
            TICKETS_DB[i] = updated_ticket
            return updated_ticket
    
    raise HTTPException(status_code=404, detail="Ticket not found")


# ---------------------------------------------------------------------------
# Main AI Analyzer endpoint
# ---------------------------------------------------------------------------
@app.post("/ai/analyze_ticket", response_model=TicketResponse)
@limiter.limit("10/minute")
async def analyze_ticket(request_body: TicketRequest, request: Request):
    """
    Main endpoint for analyzing a new ticket using the cascade of local AI models.
    """
    text = request_body.text

    settings = get_system_settings(request_body.company_id)
    confidence_threshold = settings["ai_confidence_threshold"]
    duplicate_sensitivity = settings["duplicate_sensitivity"]
    enable_auto_resolve = settings["enable_auto_resolve"]
    
    # Grab client metadata
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    origin_host = request.headers.get("origin", "unknown")
    
    env_metadata = {
        "ip": client_ip,
        "user_agent": user_agent,
        "origin": origin_host
    }

    # --- Layer 1: Local OCR (CPU, no API required) ---
    local_ocr_text = ""
    if request_body.image_base64 and ocr_service:
        print("[AI] Extracting text via local OCR...")
        local_ocr_text = ocr_service.extract_text(request_body.image_base64)
        if local_ocr_text:
            text = f"{text} {local_ocr_text}".strip()
            print(f"[AI] OCR added {len(local_ocr_text)} chars to context.")

    # Initalize Timeline
    return await analyze_only(request_body)

@app.post("/ai/analyze")
async def analyze_only(request_body: TicketRequest):
    """
    PERFORMANCE UPGRADE: AI Analysis phase only. 
    Does NOT persist to DB. This allows the user to review the analysis 
    and duplicate check before committing to a ticket creation.
    """
    text = request_body.text
    print(f"[AI] Starting Analysis (READ-ONLY) for: {text[:50]}...") 
    settings = get_system_settings(request_body.company)
    confidence_threshold = settings["ai_confidence_threshold"]
    duplicate_sensitivity = settings["duplicate_sensitivity"]
    enable_auto_resolve = settings["enable_auto_resolve"]

    # --- Vague Input Guard ---
    # If the text is extremely short or a generic term, skip AI classification and
    # return a safe low-priority "General Inquiry" to prevent hallucinated critical categories.
    import re as _re
    VAGUE_KEYWORDS = {
        "demo", "test", "hi", "hello", "check", "try", "ping", "ok", "okay",
        "issue", "problem", "error", "bug", "help", "hey", "asdf", "xyz",
        "foo", "bar", "nothing", "something", "stuff",
    }
    _stripped = text.strip().lower()
    _word_count = len(_stripped.split())
    _is_vague = (len(_stripped) < 15) or (_word_count == 1 and _stripped in VAGUE_KEYWORDS)
    if _is_vague:
        import datetime as _dt, uuid as _uuid
        _sla_breach = calculate_sla_breach_at("Low")
        print(f"[AI] Vague input detected: '{text}'. Returning safe General Inquiry classification.")
        return TicketResponse(
            ticket_id=str(_uuid.uuid4()),
            summary=f"General inquiry: {text}",
            category="General",
            subcategory="General Inquiry",
            priority="Low",
            auto_resolve=False,
            assigned_team="IT Support",
            entities=[],
            duplicate_ticket=DuplicateInfo(is_duplicate=False),
            confidence=0.1,
            needs_review=True,
            reasoning="Input was too brief for accurate classification. Please provide more context.",
            decision_factors=["Input is too short or generic for AI classification."],
            image_description="",
            ocr_text="",
            highlights=[],
            timeline={"received": _dt.datetime.utcnow().isoformat() + "Z"},
            env_metadata={},
            is_potential_duplicate=False,
            parent_ticket_id=None,
            sla_breach_at=_sla_breach.isoformat().replace("+00:00", "Z"),
        )
    
    # --- Context & Environment ---
    import datetime
    def get_now_ist():
        return datetime.datetime.utcnow().isoformat() + "Z"

    env_metadata = {
        "timestamp": get_now_ist(),
        "model_version": "3.0.0-PRO",
        "api_endpoint": "/ai/analyze"
    }
    
    timeline = {"received": get_now_ist()}

    # --- Vision Logic (OCR Awareness) ---
    gemini_analysis = {
        "ocr_text": request_body.image_text or "",
        "image_description": ""
    }
    
    if request_body.image_base64 and not gemini_analysis["ocr_text"]:
        try:
            print("[AI] Detecting visual context via Gemini...")
            vision_result = gemini_service.analyze_image(request_body.image_base64, text)
            gemini_analysis.update(vision_result)
        except Exception as e:
            print(f"[VISION ERROR] {e}")

    summary = text[:100] + ("…" if len(text) > 100 else "") 

    # --- Spam & Phishing Detection Layer ---
    spam_result = analyze_spam_phishing(text, gemini_analysis.get("ocr_text", ""))

    # --- Classification ---
    try:
        classification_v3_res = classifier_v3.predict(text)
        if "error" in classification_v3_res:
            # Fallback to V1
            classification = classifier_service.predict(text)
        else:
            # Parse V3 output
            cat = classification_v3_res.get("Category", {}).get("prediction", "Unknown")
            sub = classification_v3_res.get("Subcategory", {}).get("prediction", "Unknown")
            pri = classification_v3_res.get("priority", {}).get("prediction", "Medium")
            conf = classification_v3_res.get("Category", {}).get("confidence", 0.0)
            
            from backend.services.classifier_service import TEAM_MAP, AUTO_RESOLVE_SUBS
            assigned_team = TEAM_MAP.get(cat, "General Support")
            auto_resolve = sub in AUTO_RESOLVE_SUBS
            
            classification = {
                "category": cat,
                "subcategory": sub,
                "priority": pri,
                "auto_resolve": auto_resolve,
                "assigned_team": assigned_team,
                "confidence": float(conf)
            }
    except Exception as e:
        traceback.print_exc()
        classification = {
            "category": "Unknown", "subcategory": "Unknown", "priority": "Medium",
            "auto_resolve": False, "assigned_team": "General Support", "confidence": 0.0,
        }

    # Apply Spam overrides if spam/phishing is detected
    if spam_result["is_spam"]:
        classification["category"] = "Spam"
        if spam_result["risk_level"] == "high":
            classification["subcategory"] = "Suspicious Phishing"
        elif spam_result["risk_level"] == "medium":
            classification["subcategory"] = "Spam Inquiry"
        else:
            classification["subcategory"] = "Low-Risk Spam"
        classification["priority"] = "Low"
        classification["assigned_team"] = "Security Unit"
        classification["auto_resolve"] = False
        classification["confidence"] = max(classification["confidence"], 0.95)

    timeline["ai_analyzed"] = get_now_ist()
    timeline["triaged"] = get_now_ist()

    # --- NER ---
    try:
        entities = ner_service.extract_entities(text)
    except Exception:
        entities = []
    
    timeline["metadata_harvested"] = get_now_ist()

    # --- Duplicate detection ---
    duplicate_threshold = get_duplicate_threshold(request_body.company_id, duplicate_sensitivity)
    try:
        dup_result = detect_semantic_duplicate(
            text,
            company_id=request_body.company_id,
            threshold=duplicate_threshold,
        )
    except Exception:
        dup_result = {
            "is_duplicate": False,
            "duplicate_ticket_id": None,
            "parent_ticket_id": None,
            "is_potential_duplicate": False,
            "similarity": 0.0,
        }

    # --- RAG Knowledge Base Check ---
    rag_match = None
    try:
        rag_match = rag_service.search_knowledge_base(text, threshold=0.85)
        if rag_match:
            classification["auto_resolve"] = True
            classification["assigned_team"] = "Auto-Resolve AI"
            classification["confidence"] = max(classification["confidence"], float(rag_match["similarity"]))
            print(f"[RAG SUCCESS] Found solution for: '{rag_match['title']}'")
    except Exception as e:
        print(f"[RAG ERROR] {e}")

    # --- Reasoning ---
    decision_factors = []
    if spam_result["is_spam"]:
        decision_factors.append(f"Spam/Phishing detected (Risk: {spam_result['risk_level'].upper()})")
        reasoning = f"Flagged as potential spam/phishing. Reasons: {', '.join(spam_result['reasons'])}"
    else:
        if classification["confidence"] > confidence_threshold:
            decision_factors.append(f"High confidence match for '{classification['subcategory']}'")
        if entities:
            decision_factors.append(f"Detected entities: {', '.join([e['text'] for e in entities[:2]])}")
        if dup_result["is_duplicate"]:
            decision_factors.append(f"Found similar incident ({int(dup_result['similarity']*100)}%)")
        if rag_match:
            decision_factors.append(f"Found solution article: '{rag_match['title']}'")

        reasoning = f"Categorized as '{classification['category']}' - {classification['subcategory']}."
        if (
            enable_auto_resolve
            and classification["confidence"] >= confidence_threshold
            and classification["auto_resolve"]
        ):
            classification["auto_resolve"] = True
        else:
            classification["auto_resolve"] = False
        if classification["auto_resolve"]:
            reasoning += " Flagged for AI auto-resolution via Knowledge Base." if rag_match else " Flagged for auto-resolution."
    
    timeline["routed"] = get_now_ist()
    
    # --- Gemini Summary ---
    if gemini_service and gemini_service._initialized:
        summary = gemini_service.get_summary(text)
    
    # Convert priority to the SLA resolution target timestamp for preview.
    sla_breach_dt = calculate_sla_breach_at(classification["priority"])

    return TicketResponse(
        ticket_id=str(uuid.uuid4()), # Temporary ID
        summary=summary,
        category=classification["category"],
        subcategory=classification["subcategory"],
        priority=classification["priority"],
        auto_resolve=classification["auto_resolve"],
        assigned_team=classification["assigned_team"],
        entities=[EntityInfo(**e) for e in entities],
        duplicate_ticket=DuplicateInfo(**dup_result),
        confidence=classification["confidence"],
        needs_review=classification["confidence"] < confidence_threshold,
        reasoning=reasoning,
        decision_factors=decision_factors,
        image_description=gemini_analysis["image_description"],
        ocr_text=gemini_analysis["ocr_text"],
        image_url=request_body.image_url,
        highlights=entities, # Use entities as highlights for now
        timeline=timeline,
        env_metadata=env_metadata,
        spam_analysis=spam_result,
        is_potential_duplicate=dup_result.get("is_potential_duplicate", False),
        parent_ticket_id=dup_result.get("parent_ticket_id"),
        sla_breach_at=sla_breach_dt.isoformat().replace("+00:00", "Z")
    )

@app.post("/ai/analyze_stream")
async def analyze_stream(request_body: TicketRequest):
    """
    REAL-TIME SSE ENDPOINT: Streams the AI progress to the frontend dynamically.
    """
    import datetime
    def get_now_ist():
        return datetime.datetime.utcnow().isoformat() + "Z"

    async def event_generator():
        text = request_body.text
        env_metadata = {
            "timestamp": get_now_ist(),
            "model_version": "3.0.0-PRO",
            "api_endpoint": "/ai/analyze_stream"
        }
        timeline = {"received": get_now_ist()} 
        settings = get_system_settings(request_body.company_id)
        confidence_threshold = settings["ai_confidence_threshold"]
        duplicate_sensitivity = settings["duplicate_sensitivity"]
        enable_auto_resolve = settings["enable_auto_resolve"]

        # 1. Reading
        yield f"data: {json.dumps({'step': 'Reading your message', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.5)

        gemini_analysis = {"ocr_text": request_body.image_text or "", "image_description": ""}
        if request_body.image_base64 and not gemini_analysis["ocr_text"]:
            try:
                vision_result = gemini_service.analyze_image(request_body.image_base64, text)
                gemini_analysis.update(vision_result)
            except Exception as e:
                pass

        summary = text[:100] + ("…" if len(text) > 100 else "") 

        # 2. NER
        yield f"data: {json.dumps({'step': 'Extracting technical entities', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        try:
            entities = ner_service.extract_entities(text)
        except Exception:
            entities = []
        timeline["metadata_harvested"] = get_now_ist()

        # 3. Classification
        yield f"data: {json.dumps({'step': 'Detecting category and priority', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        try:
            classification_v3_res = classifier_v3.predict(text)
            if "error" in classification_v3_res:
                classification = classifier_service.predict(text)
            else:
                cat = classification_v3_res.get("Category", {}).get("prediction", "Unknown")
                sub = classification_v3_res.get("Subcategory", {}).get("prediction", "Unknown")
                pri = classification_v3_res.get("priority", {}).get("prediction", "Medium")
                conf = classification_v3_res.get("Category", {}).get("confidence", 0.0)
                
                from backend.services.classifier_service import TEAM_MAP, AUTO_RESOLVE_SUBS
                assigned_team = TEAM_MAP.get(cat, "General Support")
                auto_resolve = sub in AUTO_RESOLVE_SUBS
                
                classification = {
                    "category": cat,
                    "subcategory": sub,
                    "priority": pri,
                    "auto_resolve": auto_resolve,
                    "assigned_team": assigned_team,
                    "confidence": float(conf)
                }
        except Exception as e:
            classification = {
                "category": "Unknown", "subcategory": "Unknown", "priority": "Medium",
                "auto_resolve": False, "assigned_team": "General Support", "confidence": 0.0,
            }
        timeline["ai_analyzed"] = get_now_ist()
        timeline["triaged"] = get_now_ist()

        # 4. Duplicates
        yield f"data: {json.dumps({'step': 'Checking duplicate issues', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        try:
            duplicate_threshold = get_duplicate_threshold(request_body.company_id, duplicate_sensitivity)
            dup_result = detect_semantic_duplicate(
                text,
                company_id=request_body.company_id,
                threshold=duplicate_threshold,
            )
        except Exception:
            dup_result = {
                "is_duplicate": False,
                "duplicate_ticket_id": None,
                "parent_ticket_id": None,
                "is_potential_duplicate": False,
                "similarity": 0.0,
            }

        # 5. RAG / Solutions
        yield f"data: {json.dumps({'step': 'Finding possible solutions', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        rag_match = None
        try:
            rag_match = rag_service.search_knowledge_base(text, threshold=0.85)
            if rag_match:
                classification["auto_resolve"] = True
                classification["assigned_team"] = "Auto-Resolve AI"
                classification["confidence"] = max(classification["confidence"], float(rag_match["similarity"]))
        except Exception as e:
            pass

        decision_factors = []
        if classification["confidence"] > confidence_threshold:
            decision_factors.append(f"High confidence match for '{classification['subcategory']}'")
        if entities:
            decision_factors.append(f"Detected entities: {', '.join([e['text'] for e in entities[:2]])}")
        if dup_result["is_duplicate"]:
            decision_factors.append(f"Found similar incident ({int(dup_result['similarity']*100)}%)")
        if rag_match:
            decision_factors.append(f"Found solution article: '{rag_match['title']}'")

        if not enable_auto_resolve:
            classification["auto_resolve"] = False
        reasoning = f"Categorized as '{classification['category']}' - {classification['subcategory']}."
        if classification["auto_resolve"]:
            reasoning += " Flagged for AI auto-resolution via Knowledge Base." if rag_match else " Flagged for auto-resolution."
        
        timeline["routed"] = get_now_ist()

        if gemini_service and gemini_service._initialized:
            summary = gemini_service.get_summary(text)
        
        sla_breach_dt = calculate_sla_breach_at(classification["priority"])

        ticket_response_dict = {
            "ticket_id": str(uuid.uuid4()),
            "summary": summary,
            "category": classification["category"],
            "subcategory": classification["subcategory"],
            "priority": classification["priority"],
            "auto_resolve": classification["auto_resolve"],
            "assigned_team": classification["assigned_team"],
            "entities": [e for e in entities],
            "duplicate_ticket": dup_result,
            "confidence": classification["confidence"],
            "needs_review": classification["confidence"] < confidence_threshold,
            "reasoning": reasoning,
            "decision_factors": decision_factors,
            "image_description": gemini_analysis["image_description"],
            "ocr_text": gemini_analysis["ocr_text"],
            "image_url": request_body.image_url,
            "highlights": entities,
            "timeline": timeline,
            "env_metadata": env_metadata,
            "is_potential_duplicate": dup_result.get("is_potential_duplicate", False),
            "parent_ticket_id": dup_result.get("parent_ticket_id"),
            "sla_breach_at": sla_breach_dt.isoformat().replace("+00:00", "Z")
        }

        # 6. Final Result
        yield f"data: {json.dumps({'step': 'done', 'result': jsonable_encoder(ticket_response_dict)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/ai/analyze_ticket/legacy")
async def legacy_analyze_and_save(request_body: TicketRequest):
    """
    BACKWARD COMPATIBILITY: Strictly performs analysis only. 
    Does NOT persist to DB to avoid foreign key violations.
    """
    return await analyze_only(request_body)

@app.post("/ai/analyze-v2")
async def analyze_ticket_v2(request: TicketRequest):
    text = request.text
    try:
        prediction = classifier_v2.predict(text)
        return {
            "status": "success",
            "category": prediction["category"]["prediction"],
            "subcategory": prediction["sub_category"]["prediction"],
            "priority": prediction["priority"]["prediction"],
            "auto_resolve": prediction["auto_resolve"]["prediction"].lower() == "true",
            "assigned_team": prediction["assigned_team"]["prediction"],
            "confidence": prediction["category"]["confidence"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------------
# Clean cookie-based Supabase Auth endpoints for /auth/me backward-compatibility
# ---------------------------------------------------------------------------
ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
ACCESS_MAX_AGE = 60 * 60
REFRESH_MAX_AGE = 60 * 60 * 24 * 7

def _cookie_kwargs() -> dict:
    secure = os.getenv("ENV", "production").lower() != "development"
    return {
        "httponly": True,
        "secure": secure,
        "samesite": "strict",
        "path": "/",
    }

def extract_token(request: Request) -> str | None:
    cookie_token = request.cookies.get(ACCESS_COOKIE)
    if cookie_token:
        return cookie_token
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip() or None
    return None

def _set_session_cookies(response: Response, session) -> None:
    if not session or not getattr(session, "access_token", None):
        return
    response.set_cookie(
        ACCESS_COOKIE,
        session.access_token,
        max_age=ACCESS_MAX_AGE,
        **_cookie_kwargs(),
    )
    refresh = getattr(session, "refresh_token", None)
    if refresh:
        response.set_cookie(
            REFRESH_COOKIE,
            refresh,
            max_age=REFRESH_MAX_AGE,
            **_cookie_kwargs(),
        )

def _clear_session_cookies(response: Response) -> None:
    kwargs = _cookie_kwargs()
    response.delete_cookie(ACCESS_COOKIE, path=kwargs["path"])
    response.delete_cookie(REFRESH_COOKIE, path=kwargs["path"])

async def get_current_user(request: Request) -> dict:
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection offline")
    try:
        result = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid session: {exc}",
        ) from exc
    user = getattr(result, "user", None) or (result.get("user") if isinstance(result, dict) else None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    if hasattr(user, "model_dump"):
        return user.model_dump()
    if hasattr(user, "dict"):
        return user.dict()
    return dict(user)

class LoginBody(BaseModel):
    email: str
    password: str

class SignupBody(BaseModel):
    email: str
    password: str
    full_name: str | None = None
    role: str | None = "user"
    company: str | None = None

@app.post("/auth/login")
async def auth_login(body: LoginBody, response: Response):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection offline")
    try:
        result = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if not session or not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _set_session_cookies(response, session)
    user_payload = user.model_dump() if hasattr(user, "model_dump") else dict(user)
    return {"user": user_payload, "message": "Session cookies set"}

@app.post("/auth/signup")
async def auth_signup(body: SignupBody, response: Response):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection offline")
    metadata = {}
    if body.full_name:
        metadata["full_name"] = body.full_name
    if body.role:
        metadata["role"] = body.role
    if body.company:
        metadata["company"] = body.company

    try:
        result = supabase.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
                "options": {"data": metadata} if metadata else {},
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if session:
        _set_session_cookies(response, session)
    user_payload = user.model_dump() if user and hasattr(user, "model_dump") else None
    return {"user": user_payload, "message": "Signup complete"}

# ---------------------------------------------------------------------------
# Admin Analytics endpoints
# ---------------------------------------------------------------------------

# SLA resolution hour targets per priority level (matches sla_service.py)
SLA_RESOLUTION_HOURS: dict[str, int] = {
    "critical": 4,
    "high": 12,
    "medium": 24,
    "low": 72,
}


def _analytics_query(company_id: str | None, period_days: int | None = None):
    """Build a base tickets query scoped to company and optional date window."""
    q = supabase.table("tickets").select(
        "id, created_at, status, priority, category, assigned_team, "
        "sla_breach_at, sla_status, escalation_level, closed_at, company_id"
    )
    if company_id:
        q = q.eq("company_id", company_id)
    if period_days:
        import datetime as _dt
        cutoff = (_dt.datetime.utcnow() - _dt.timedelta(days=period_days)).isoformat() + "Z"
        q = q.gte("created_at", cutoff)
    return q


@app.get("/admin/analytics/overview")
async def analytics_overview(company_id: str | None = None):
    """
    Aggregated KPI counts: total, open, resolved, SLA breach rate, avg resolution time.
    Used by the Overview Cards section of the analytics dashboard.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    try:
        res = _analytics_query(company_id).execute()
        tickets = res.data or []

        total = len(tickets)
        resolved_statuses = {"resolved", "closed", "auto-resolved", "auto resolved"}
        open_tickets = [t for t in tickets if (t.get("status") or "").lower() not in resolved_statuses]
        resolved_tickets = [t for t in tickets if (t.get("status") or "").lower() in resolved_statuses]

        # SLA breach rate
        breached = [t for t in tickets if (t.get("sla_status") or "").upper() == "BREACHED"]
        sla_breach_rate = round((len(breached) / total * 100), 1) if total else 0.0

        # Average resolution time in hours (uses closed_at - created_at)
        import datetime as _dt
        resolution_times_hours: list[float] = []
        for t in resolved_tickets:
            ca = t.get("closed_at") or t.get("created_at")
            cr = t.get("created_at")
            if ca and cr:
                try:
                    end = _dt.datetime.fromisoformat(str(ca).replace("Z", "+00:00"))
                    start = _dt.datetime.fromisoformat(str(cr).replace("Z", "+00:00"))
                    hours = (end - start).total_seconds() / 3600
                    if 0 < hours < 8760:  # ignore outliers > 1 year
                        resolution_times_hours.append(round(hours, 2))
                except (ValueError, TypeError):
                    pass
        avg_resolution_hours = (
            round(sum(resolution_times_hours) / len(resolution_times_hours), 1)
            if resolution_times_hours
            else None
        )

        # Tickets per assigned_team (agent workload proxy)
        team_counts: dict[str, int] = {}
        for t in open_tickets:
            team = t.get("assigned_team") or "Unassigned"
            team_counts[team] = team_counts.get(team, 0) + 1
        busiest_team = max(team_counts, key=lambda k: team_counts[k]) if team_counts else None

        return {
            "total": total,
            "open": len(open_tickets),
            "resolved": len(resolved_tickets),
            "sla_breach_rate": sla_breach_rate,
            "avg_resolution_hours": avg_resolution_hours,
            "busiest_team": busiest_team,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/admin/analytics/volume")
async def analytics_volume(company_id: str | None = None, period: str = "30d"):
    """
    Daily ticket creation + resolution counts for the given period.
    period values: '7d', '30d', '90d'
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    try:
        period_days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
        res = _analytics_query(company_id, period_days).execute()
        tickets = res.data or []

        import datetime as _dt
        resolved_statuses = {"resolved", "closed", "auto-resolved", "auto resolved"}
        created_map: dict[str, int] = {}
        resolved_map: dict[str, int] = {}

        for t in tickets:
            ca = t.get("created_at")
            if ca:
                try:
                    day = _dt.datetime.fromisoformat(str(ca).replace("Z", "+00:00")).strftime("%Y-%m-%d")
                    created_map[day] = created_map.get(day, 0) + 1
                except (ValueError, TypeError):
                    pass
            if (t.get("status") or "").lower() in resolved_statuses:
                close_ts = t.get("closed_at") or ca
                if close_ts:
                    try:
                        day = _dt.datetime.fromisoformat(str(close_ts).replace("Z", "+00:00")).strftime("%Y-%m-%d")
                        resolved_map[day] = resolved_map.get(day, 0) + 1
                    except (ValueError, TypeError):
                        pass

        all_days = sorted(set(list(created_map.keys()) + list(resolved_map.keys())))
        series = [
            {"date": d, "created": created_map.get(d, 0), "resolved": resolved_map.get(d, 0)}
            for d in all_days
        ]
        return {"period": period, "series": series}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/admin/analytics/sla")
async def analytics_sla(company_id: str | None = None):
    """
    SLA compliance percentage by priority level.
    Returns [{ priority, within_sla, breached, compliance_rate }]
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    try:
        res = _analytics_query(company_id).execute()
        tickets = res.data or []

        from collections import defaultdict
        priority_totals: dict[str, int] = defaultdict(int)
        priority_breached: dict[str, int] = defaultdict(int)

        for t in tickets:
            pri = (t.get("priority") or "low").lower()
            priority_totals[pri] += 1
            if (t.get("sla_status") or "").upper() == "BREACHED" or t.get("escalation_level", 0) > 0:
                priority_breached[pri] += 1

        result = []
        for pri in ["critical", "high", "medium", "low"]:
            total = priority_totals.get(pri, 0)
            breached = priority_breached.get(pri, 0)
            within = total - breached
            compliance = round((within / total * 100), 1) if total else 100.0
            result.append({
                "priority": pri.capitalize(),
                "total": total,
                "within_sla": within,
                "breached": breached,
                "compliance_rate": compliance,
                "sla_target_hours": SLA_RESOLUTION_HOURS.get(pri, 72),
            })
        return {"sla_by_priority": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/admin/analytics/categories")
async def analytics_categories(company_id: str | None = None):
    """
    Ticket count per category and subcategory for donut/bar charts.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    try:
        res = _analytics_query(company_id).execute()
        tickets = res.data or []

        from collections import Counter
        cat_counts: Counter = Counter()
        for t in tickets:
            cat = t.get("category") or "Uncategorized"
            cat_counts[cat] += 1

        categories = [
            {"name": cat, "count": cnt}
            for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1])
        ]
        return {"total": len(tickets), "categories": categories}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/admin/analytics/agents")
async def analytics_agents(company_id: str | None = None):
    """
    Open ticket count per assigned team (agent workload distribution).
    Returns horizontal bar chart data sorted by workload descending.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    try:
        res = _analytics_query(company_id).execute()
        tickets = res.data or []

        resolved_statuses = {"resolved", "closed", "auto-resolved", "auto resolved"}
        from collections import defaultdict
        team_open: dict[str, int] = defaultdict(int)
        team_total: dict[str, int] = defaultdict(int)

        for t in tickets:
            team = t.get("assigned_team") or "Unassigned"
            team_total[team] += 1
            if (t.get("status") or "").lower() not in resolved_statuses:
                team_open[team] += 1

        teams = sorted(
            [
                {"team": team, "open_tickets": team_open.get(team, 0), "total_tickets": team_total[team]}
                for team in team_total
            ],
            key=lambda x: -x["open_tickets"],
        )
        return {"teams": teams}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/admin/analytics/resolution-time")
async def analytics_resolution_time(company_id: str | None = None):
    """
    Distribution of resolution times (in hours) for a histogram.
    Buckets: 0-4h, 4-12h, 12-24h, 24-48h, 48-72h, 72h+
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    try:
        res = _analytics_query(company_id).execute()
        tickets = res.data or []

        import datetime as _dt
        resolved_statuses = {"resolved", "closed", "auto-resolved", "auto resolved"}
        buckets = [
            {"label": "0–4h", "min": 0, "max": 4, "count": 0},
            {"label": "4–12h", "min": 4, "max": 12, "count": 0},
            {"label": "12–24h", "min": 12, "max": 24, "count": 0},
            {"label": "24–48h", "min": 24, "max": 48, "count": 0},
            {"label": "48–72h", "min": 48, "max": 72, "count": 0},
            {"label": "72h+", "min": 72, "max": float("inf"), "count": 0},
        ]

        hours_list: list[float] = []
        for t in tickets:
            if (t.get("status") or "").lower() not in resolved_statuses:
                continue
            close_ts = t.get("closed_at") or None
            create_ts = t.get("created_at")
            if not close_ts or not create_ts:
                continue
            try:
                end = _dt.datetime.fromisoformat(str(close_ts).replace("Z", "+00:00"))
                start = _dt.datetime.fromisoformat(str(create_ts).replace("Z", "+00:00"))
                hours = (end - start).total_seconds() / 3600
                if 0 < hours < 8760:
                    hours_list.append(hours)
                    for bucket in buckets:
                        if bucket["min"] <= hours < bucket["max"]:
                            bucket["count"] += 1
                            break
            except (ValueError, TypeError):
                pass

        avg = round(sum(hours_list) / len(hours_list), 1) if hours_list else None
        median = None
        if hours_list:
            sorted_h = sorted(hours_list)
            n = len(sorted_h)
            median = round(sorted_h[n // 2] if n % 2 else (sorted_h[n // 2 - 1] + sorted_h[n // 2]) / 2, 1)

        return {
            "buckets": [{"label": b["label"], "count": b["count"]} for b in buckets],
            "avg_hours": avg,
            "median_hours": median,
            "sample_size": len(hours_list),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/auth/logout")
async def auth_logout(response: Response):
    _clear_session_cookies(response)
    return {"ok": True}

@app.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return {"user": user}


# ---------------------------------------------------------------------------
# Issue #2807 — Duplicate Cluster & Threshold Management Endpoints
# ---------------------------------------------------------------------------

class ThresholdUpdateRequest(BaseModel):
    company_id: str
    threshold: float


class FeedbackRequest(BaseModel):
    company_id: str
    feedback_type: str  # "false_positive" | "missed_duplicate"
    ticket_id: str | None = None


class PrimaryTicketRequest(BaseModel):
    cluster_id: str
    ticket_id: str


@app.get("/ai/duplicate-clusters")
async def get_duplicate_clusters(company_id: str | None = None):
    """
    Return all duplicate clusters for a tenant.
    Supports real-time visibility into ticket groupings.
    """
    try:
        clusters = duplicate_service.get_clusters(company_id)
        return {"clusters": clusters, "total": len(clusters)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/duplicate-analytics")
async def get_duplicate_analytics(company_id: str | None = None):
    """
    Return analytics summary: top duplicate categories, cluster sizes, confidence scores.
    """
    try:
        analytics = duplicate_service.get_cluster_analytics(company_id)
        # Enrich with Supabase data if available
        if supabase and company_id:
            try:
                res = supabase.table("tickets").select(
                    "category, is_potential_duplicate"
                ).eq("company_id", company_id).eq("is_potential_duplicate", True).execute()
                rows = res.data or []
                db_by_cat: dict = {}
                for row in rows:
                    cat = row.get("category", "Unknown")
                    db_by_cat[cat] = db_by_cat.get(cat, 0) + 1
                analytics["db_duplicate_by_category"] = [
                    {"category": k, "count": v}
                    for k, v in sorted(db_by_cat.items(), key=lambda x: x[1], reverse=True)
                ]
                analytics["db_total_duplicates"] = len(rows)
            except Exception as db_err:
                print(f"[Analytics] DB enrichment error: {db_err}")
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/duplicate-threshold")
async def get_duplicate_threshold_endpoint(company_id: str):
    """Get the current duplicate detection threshold for a tenant."""
    threshold = duplicate_service.get_threshold(company_id)
    # Also try Supabase system_settings
    if supabase:
        try:
            res = supabase.table("system_settings").select(
                "duplicate_sensitivity"
            ).eq("company_id", company_id).single().execute()
            if res.data and res.data.get("duplicate_sensitivity"):
                threshold = float(res.data["duplicate_sensitivity"])
        except Exception:
            pass
    return {
        "company_id": company_id,
        "threshold":  threshold,
        "min":        0.70,
        "max":        0.95,
        "default":    0.85,
    }


@app.put("/ai/duplicate-threshold")
async def update_duplicate_threshold_endpoint(body: ThresholdUpdateRequest):
    """
    Update the duplicate detection threshold for a tenant (range 0.70–0.95).
    Persists to Supabase system_settings and updates the in-process cache.
    """
    new_threshold = duplicate_service.update_threshold(body.company_id, body.threshold)
    # Persist to Supabase
    if supabase:
        try:
            supabase.table("system_settings").upsert({
                "company_id":           body.company_id,
                "duplicate_sensitivity": new_threshold,
            }, on_conflict="company_id").execute()
        except Exception as db_err:
            print(f"[ThresholdUpdate] Supabase persist error: {db_err}")
    return {
        "status":      "updated",
        "company_id":  body.company_id,
        "threshold":   new_threshold,
    }


@app.post("/ai/duplicate-feedback")
async def process_duplicate_feedback(body: FeedbackRequest):
    """
    Process admin feedback to auto-tune the duplicate threshold.
    feedback_type: "false_positive" | "missed_duplicate"
    """
    valid_types = {"false_positive", "missed_duplicate"}
    if body.feedback_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"feedback_type must be one of {valid_types}",
        )
    result = duplicate_service.process_feedback(body.company_id, body.feedback_type)
    # Persist updated threshold to Supabase
    if supabase:
        try:
            supabase.table("system_settings").upsert({
                "company_id":           body.company_id,
                "duplicate_sensitivity": result["new_threshold"],
            }, on_conflict="company_id").execute()
            # Log feedback to duplicate_feedback table
            supabase.table("duplicate_feedback").insert({
                "company_id":    body.company_id,
                "feedback_type": body.feedback_type,
                "ticket_id":     body.ticket_id,
                "old_threshold": result["previous_threshold"],
                "new_threshold": result["new_threshold"],
            }).execute()
        except Exception as db_err:
            print(f"[Feedback] Supabase persist error: {db_err}")
    return result


@app.post("/ai/duplicate-clusters/set-primary")
async def set_primary_ticket(body: PrimaryTicketRequest):
    """Designate a ticket as the primary/canonical record for a duplicate cluster."""
    result = duplicate_service.set_primary_ticket(body.cluster_id, body.ticket_id)
    if not result:
        raise HTTPException(status_code=404, detail="Cluster not found")
    # Persist to Supabase duplicate_groups table
    if supabase:
        try:
            supabase.table("duplicate_groups").upsert({
                "cluster_id":     body.cluster_id,
                "primary_ticket": body.ticket_id,
            }, on_conflict="cluster_id").execute()
        except Exception as db_err:
            print(f"[SetPrimary] Supabase persist error: {db_err}")
    return result

