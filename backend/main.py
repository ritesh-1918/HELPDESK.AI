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
from fastapi import FastAPI, Depends, HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.encoders import jsonable_encoder
import asyncio
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from backend/.env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

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
from backend.services.audit_service import AuditLogService, AuditLogAccessError
from backend.services.onnx_service import onnx_classifier
from backend.services.ner_service import NERService
from backend.services.duplicate_service import DuplicateService
from backend.services.rag_service import RagService
from backend.services.sla_engine import SLAEngine, compute_sla_breach_at, get_sla_policy
from backend.services.semantic_duplicate_service import SemanticDuplicateService


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


def classify_ticket_text(text: str) -> dict:
    """Run the local classifier cascade with ONNX as the offline fallback path."""
    try:
        classification_v3_res = classifier_v3.predict(text)
        if "error" not in classification_v3_res:
            cat = classification_v3_res.get("Category", {}).get("prediction", "Unknown")
            sub = classification_v3_res.get("Subcategory", {}).get("prediction", "Unknown")
            pri = classification_v3_res.get("priority", {}).get("prediction", "Medium")
            conf = classification_v3_res.get("Category", {}).get("confidence", 0.0)

            from backend.services.classifier_service import TEAM_MAP, AUTO_RESOLVE_SUBS
            return {
                "category": cat,
                "subcategory": sub,
                "priority": pri,
                "auto_resolve": sub in AUTO_RESOLVE_SUBS,
                "assigned_team": TEAM_MAP.get(cat, "General Support"),
                "confidence": float(conf),
            }
    except Exception:
        traceback.print_exc()

    try:
        onnx_result = onnx_classifier.predict(text)
        if onnx_result:
            return onnx_result
    except Exception as error:
        print(f"[ONNX] Fallback classification skipped: {error}")

    try:
        return classifier_service.predict(text)
    except Exception:
        traceback.print_exc()
        return {
            "category": "Unknown", "subcategory": "Unknown", "priority": "Medium",
            "auto_resolve": False, "assigned_team": "General Support", "confidence": 0.0,
        }

class TicketRequest(BaseModel):
    text: str
    image_base64: str = ""
    image_text: str = "" # Keep for backward compatibility
    user_id: str | None = None
    company: str | None = None
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
    needs_review: bool = False
    reasoning: str = ""
    decision_factors: list[str] = []
    image_description: str = ""
    ocr_text: str = ""
    highlights: list[str] = []
    timeline: dict = {} # Map of step_name: timestamp
    env_metadata: dict = {} # IP, Hostname, Browser/OS
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


class AuditLogProfile(BaseModel):
    full_name: str | None = None
    email: str | None = None
    profile_picture: str | None = None


class AuditLogRecord(BaseModel):
    id: str
    ticket_id: str
    company_id: str
    performed_by: str | None = None
    action: str
    old_value: dict | list | str | None = None
    new_value: dict | list | str | None = None
    created_at: str
    performed_by_profile: AuditLogProfile | None = None


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
sla_engine = SLAEngine(supabase_client=None)  # Will be reassigned after supabase init
semantic_dupe_service = SemanticDuplicateService(supabase_client=None)  # wired in lifespan

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
    except FileNotFoundError as e:
        print(f"[WARNING] Classifier not loaded: {e}")
    try:
        ner_service.load()
    except FileNotFoundError as e:
        print(f"[WARNING] NER not loaded: {e}")
    try:
        duplicate_service.load()
    except Exception as e:
        print(f"[WARNING] Duplicate service not loaded: {e}")
    try:
        rag_service.load()
    except Exception as e:
        print(f"[WARNING] RAG service not loaded: {e}")
    try:
        onnx_classifier.load()
    except Exception as e:
        print(f"[WARNING] ONNX classifier fallback not loaded: {e}")
    
    if gemini_service:
        print(f"[Startup] Gemini Service: {'Initialized' if gemini_service._initialized else 'FAILED (Key missing or SDK error)'}")
    else:
        print("[Startup] Gemini Service: NOT LOADED (Import failed)")

    # Wire services with supabase client
    sla_engine.supabase = supabase
    semantic_dupe_service.supabase = supabase

    # Pre-load embedding model so first ticket save is fast
    try:
        semantic_dupe_service.load()
        print(f"[Startup] Semantic Duplicate Detection: {'Loaded' if semantic_dupe_service._loaded else 'Failed (model missing)'}")
    except Exception as e:
        print(f"[Startup] Semantic Duplicate Detection load error: {e}")
    print(f"[Startup] SLA Engine: {'Initialized' if supabase else 'Offline (no DB)'}")

    # Start background SLA checker as an async task (every 5 minutes)
    if supabase:
        from backend.sla_checker import sla_checker_loop_async
        asyncio.create_task(sla_checker_loop_async(supabase, interval_seconds=300))
        print("[Startup] SLA background checker started (interval=300s)")

    print("[Startup] Classifier V2 Shadow: Ready.")
    print(f"[Startup] ONNX MiniLM Fallback: {'READY' if getattr(onnx_classifier, '_loaded', False) else 'DEGRADED (artifacts missing)'}")
    print("[Startup] Ready.")
    yield
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
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HELPDESK.AI - API Engine</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
            .glass-card {
                background: rgba(30, 41, 59, 0.7);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            .gradient-text {
                background: linear-gradient(to right, #10b981, #3b82f6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .btn-hover { transition: all 0.2s ease-in-out; }
            .btn-hover:hover { transform: translateY(-2px); text-decoration: none; }
        </style>
    </head>
    <body class="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <!-- Abstract Background Orbs -->
        <div class="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>

        <div class="glass-card rounded-2xl p-10 max-w-2xl w-full text-center relative z-10">
            <div class="mb-6 flex justify-center">
                <div class="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/30">
                    <svg class="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
            </div>
            
            <h1 class="text-4xl md:text-5xl font-bold mb-4">HELPDESK<span class="gradient-text">.AI</span></h1>
            <p class="text-slate-400 text-lg mb-8">Next-Generation IT Ticket Inference Engine</p>
            <div class="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 mb-10 text-sm font-semibold tracking-wide">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>System Online • v1.0.0</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <!-- API Docs Button -->
                <a href="/docs" class="btn-hover block w-full bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-700/80 rounded-xl p-5 group">
                    <h3 class="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Interactive API Docs</h3>
                    <p class="text-slate-400 text-sm text-center md:text-left">Test endpoints natively via Swagger UI</p>
                </a>
                
                <!-- Frontend Button -->
                <a href="https://helpdeskaiv1.vercel.app/" target="_blank" class="btn-hover block w-full bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/80 rounded-xl p-5 group">
                    <h3 class="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Client Web Portal</h3>
                    <p class="text-slate-400 text-sm text-center md:text-left">Access the React/Vite dashboard</p>
                </a>

                <!-- System Health Button -->
                <a href="/health" class="btn-hover block w-full bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-700/80 rounded-xl p-5 group md:col-span-2">
                        <div class="flex items-center justify-between">
                        <div>
                            <h3 class="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">System Health Check</h3>
                            <p class="text-slate-400 text-sm text-center md:text-left">Verify AI model loading statuses</p>
                        </div>
                        <svg class="w-6 h-6 text-slate-500 group-hover:text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </a>
            </div>
            
            <div class="mt-10 pt-6 border-t border-slate-800 text-sm text-slate-500">
                Powered by FastAPI & Hugging Face Transformers
            </div>
        </div>
    </body>
    </html>
    """


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
    checks = {
        "api": True,
        "classifier_loaded": classifier_service._loaded,
        "ner_loaded": ner_service._loaded,
        "duplicate_index_loaded": duplicate_service._loaded,
        "rag_loaded": rag_service._loaded,
    }
    if require_supabase:
        checks["supabase_configured"] = supabase is not None

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

@app.post("/tickets/save")
async def save_ticket(request_body: TicketSaveRequest):
    """
    OFFICIAL PERSISTENCE: Saves the analyzed ticket to Supabase.
    This is called AFTER the user confirms the analysis results.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection not initialized.")

    logger = logging.getLogger(__name__)
    final_data = request_body.model_dump()

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
        except HTTPException:
            raise
        except Exception as profile_error:
            logger.error(f"Tenant resolution error for user {request_body.user_id}: {profile_error}")
            raise HTTPException(status_code=503, detail="Failed to resolve tenant linkage") from profile_error

    # Validate tenant consistency and authorization.
    profile_company_id = profile.get("company_id")
    if final_data.get("company_id"):
        # User provided company_id: verify it matches their profile.
        if profile_company_id and final_data["company_id"] != profile_company_id:
            logger.warning(f"Tenant mismatch: user {request_body.user_id} attempted {final_data['company_id']}, assigned to {profile_company_id}")
            raise HTTPException(status_code=403, detail="User not authorized for this tenant")
    elif profile_company_id:
        # Backfill company_id from profile.
        final_data["company_id"] = profile_company_id
    elif request_body.user_id:
        # User has no tenant assignment.
        raise HTTPException(status_code=400, detail="User has no tenant assignment")

    try:
        # Backfill company name if missing.
        if not final_data.get("company") and profile.get("company"):
            final_data["company"] = profile["company"]

        user_hash = hashlib.sha256(str(request_body.user_id).encode()).hexdigest()[:8]
        logger.info(f"Tenant linkage: user_hash={user_hash}, company_id={final_data.get('company_id')}")


        # Semantic duplicate check BEFORE inserting the ticket
        # This allows us to warn the user before confirming
        duplicate_check_result = None
        try:
            dupe_text = (request_body.description or request_body.subject or "").strip()
            if dupe_text:
                duplicate_check_result = await semantic_dupe_service.check_duplicate(
                    text=dupe_text,
                    company_id=final_data.get("company_id"),
                )
                if duplicate_check_result["is_duplicate"]:
                    logger.info(
                        f"[DUPLICATE] Ticket flagged as potential duplicate of "
                        f"{duplicate_check_result['duplicate_ticket_id']} "
                        f"(similarity: {duplicate_check_result['similarity']})"
                    )
        except Exception as e:
            logger.warning(f"[DUPLICATE] Semantic check error (non-fatal): {e}")

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
            "is_potential_duplicate", "parent_ticket_id", "sla_response_due_at", "sla_status", "escalation_level"
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

        # If duplicate detected, link parent ticket
        if duplicate_check_result and duplicate_check_result["is_duplicate"]:
            try:
                supabase.table("tickets").update({
                    "is_potential_duplicate": True,
                    "parent_ticket_id": duplicate_check_result["duplicate_ticket_id"],
                }).eq("id", ticket_id).execute()
            except Exception as e:
                logger.warning(f"[DUPLICATE] Failed to link parent ticket: {e}")

        # Index the new ticket's embedding for future duplicate checks
        embedding_indexed = False
        description_text = (request_body.description or "").strip()
        subject_text = (request_body.subject or "").strip()
        duplicate_text = description_text or subject_text
        if duplicate_text:
            try:
                # Both: old in-memory index (for backward compat) and new pgvector index
                duplicate_service.add_ticket(str(ticket_id), duplicate_text)
                asyncio.create_task(semantic_dupe_service.index_ticket(ticket_id, duplicate_text))
                embedding_indexed = True
            except Exception as index_error:
                logger.warning(f"[INDEX] Failed to index ticket {ticket_id}: {index_error}")
        
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
            "duplicate_indexed": embedding_indexed,
        }
        if duplicate_check_result and duplicate_check_result["is_duplicate"]:
            response["duplicate_warning"] = True
            response["parent_ticket_id"] = duplicate_check_result["duplicate_ticket_id"]
            response["parent_subject"] = duplicate_check_result.get("parent_subject")
            response["similarity"] = duplicate_check_result["similarity"]
            response["candidates"] = duplicate_check_result.get("candidates", [])
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


@app.get("/tickets/{ticket_id}/audit_logs", response_model=list[AuditLogRecord])
async def get_ticket_audit_logs(ticket_id: str, company_id: str):
    """Return a company-scoped chronological audit trail for a ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    try:
        service = AuditLogService(supabase)
        return service.get_ticket_audit_logs(ticket_id, company_id)
    except AuditLogAccessError as err:
        raise HTTPException(status_code=err.status_code, detail=err.detail)


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

    # --- Classification ---
    classification = classify_ticket_text(text)

    timeline["ai_analyzed"] = get_now_ist()
    timeline["triaged"] = get_now_ist()

    # --- NER ---
    try:
        entities = ner_service.extract_entities(text)
    except Exception:
        entities = []
    
    timeline["metadata_harvested"] = get_now_ist()

    # --- Duplicate detection ---
    try:
        dup_result = duplicate_service.check_duplicate(text, threshold=request_body.duplicate_sensitivity)
    except Exception:
        dup_result = {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0}

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
    if classification["confidence"] > request_body.confidence_threshold:
        decision_factors.append(f"High confidence match for '{classification['subcategory']}'")
    if entities:
        decision_factors.append(f"Detected entities: {', '.join([e['text'] for e in entities[:2]])}")
    if dup_result["is_duplicate"]:
        decision_factors.append(f"Found similar incident ({int(dup_result['similarity']*100)}%)")
    if rag_match:
        decision_factors.append(f"Found solution article: '{rag_match['title']}'")

    reasoning = f"Categorized as '{classification['category']}' - {classification['subcategory']}."
    if classification["auto_resolve"]:
        reasoning += " Flagged for AI auto-resolution via Knowledge Base." if rag_match else " Flagged for auto-resolution."
    
    timeline["routed"] = get_now_ist()
    
    # --- Gemini Summary ---
    if gemini_service and gemini_service._initialized:
        summary = gemini_service.get_summary(text)
    
    # Convert priority to SLA breached timestamp (for preview)
    hours_map = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}
    sla_hours = hours_map.get(classification["priority"], 72)
    sla_breach_dt = datetime.datetime.utcnow() + datetime.timedelta(hours=sla_hours)

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
        needs_review=classification["confidence"] < 0.20,
        reasoning=reasoning,
        decision_factors=decision_factors,
        image_description=gemini_analysis["image_description"],
        ocr_text=gemini_analysis["ocr_text"],
        highlights=[e.get("text", "") for e in entities], # Use entity texts as highlights for now
        timeline=timeline,
        env_metadata=env_metadata,
        sla_breach_at=sla_breach_dt.isoformat() + "Z"
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
        classification = classify_ticket_text(text)
        timeline["ai_analyzed"] = get_now_ist()
        timeline["triaged"] = get_now_ist()

        # 4. Duplicates
        yield f"data: {json.dumps({'step': 'Checking duplicate issues', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        try:
            dup_result = duplicate_service.check_duplicate(text, threshold=request_body.duplicate_sensitivity)
        except Exception:
            dup_result = {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0}

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
        if classification["confidence"] > request_body.confidence_threshold:
            decision_factors.append(f"High confidence match for '{classification['subcategory']}'")
        if entities:
            decision_factors.append(f"Detected entities: {', '.join([e['text'] for e in entities[:2]])}")
        if dup_result["is_duplicate"]:
            decision_factors.append(f"Found similar incident ({int(dup_result['similarity']*100)}%)")
        if rag_match:
            decision_factors.append(f"Found solution article: '{rag_match['title']}'")

        reasoning = f"Categorized as '{classification['category']}' - {classification['subcategory']}."
        if classification["auto_resolve"]:
            reasoning += " Flagged for AI auto-resolution via Knowledge Base." if rag_match else " Flagged for auto-resolution."
        
        timeline["routed"] = get_now_ist()

        if gemini_service and gemini_service._initialized:
            summary = gemini_service.get_summary(text)
        
        hours_map = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}
        sla_hours = hours_map.get(classification["priority"], 72)
        sla_breach_dt = datetime.datetime.utcnow() + datetime.timedelta(hours=sla_hours)

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
            "needs_review": classification["confidence"] < 0.20,
            "reasoning": reasoning,
            "decision_factors": decision_factors,
            "image_description": gemini_analysis["image_description"],
            "ocr_text": gemini_analysis["ocr_text"],
            "highlights": [e.get("text", "") for e in entities],
            "timeline": timeline,
            "env_metadata": env_metadata,
            "sla_breach_at": sla_breach_dt.isoformat() + "Z"
        }

        # 6. Final Result
        yield f"data: {json.dumps({'step': 'done', 'result': jsonable_encoder(ticket_response_dict)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/ai/analyze_ticket")
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
# SLA Engine Endpoints
# ---------------------------------------------------------------------------

class SLAStatsResponse(BaseModel):
    total: int = 0
    active: int = 0
    breached: int = 0
    warning: int = 0
    met: int = 0
    breach_rate: float = 0.0
    by_priority: dict = {}


@app.get("/sla/stats", response_model=SLAStatsResponse)
async def sla_stats():
    """Get aggregated SLA dashboard statistics across all tickets."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    stats = await sla_engine.get_dashboard_stats()
    if "error" in stats:
        raise HTTPException(status_code=500, detail=stats["error"])
    return stats


class SLATicketInfo(BaseModel):
    id: str
    ticket_id: str | None = None
    subject: str | None = None
    summary: str | None = None
    priority: str = "medium"
    status: str | None = None
    assigned_team: str | None = None
    sla_status: str = "active"
    escalation_level: int = 0
    remaining_seconds: int = 0
    created_at: str | None = None
    sla_breach_at: str | None = None
    sla_warning_at: str | None = None
    last_escalated_at: str | None = None


@app.get("/sla/tickets")
async def sla_tickets(
    status: str | None = None,
    priority: str | None = None,
    limit: int = 100,
    offset: int = 0,
):
    """
    List tickets with SLA status. Filter by sla_status and/or priority.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    query = (
        supabase.table("tickets")
        .select("id, ticket_id, subject, summary, priority, status, assigned_team, sla_status, escalation_level, remaining_seconds, created_at, sla_breach_at, sla_warning_at, last_escalated_at")
        .order("created_at", desc=True)
    )

    if status and status != "all":
        query = query.eq("sla_status", status)
    if priority and priority != "all":
        query = query.eq("priority", priority.capitalize())

    query = query.range(offset, offset + limit - 1)
    res = query.execute()
    return {"tickets": res.data or [], "total": len(res.data or [])}


class EscalationLogEntry(BaseModel):
    id: str
    ticket_id: str | None = None
    ticket_subject: str = ""
    priority: str = "medium"
    sla_status: str = ""
    escalation_level: int = 0
    remaining_seconds: int = 0
    assigned_team: str = ""
    notification_channels: list = []
    triggered_at: str | None = None
    resolved_at: str | None = None
    notes: str = ""


@app.get("/sla/escalations")
async def sla_escalations(limit: int = 50, offset: int = 0):
    """Fetch escalation log history."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    try:
        res = (
            supabase.table("escalation_logs")
            .select("*")
            .order("triggered_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return {"escalations": res.data or [], "total": len(res.data or [])}
    except Exception as e:
        # Table might not exist yet
        print(f"[SLA] Escalation logs query failed: {e}")
        return {"escalations": [], "total": 0}


class SLAPolicyInfo(BaseModel):
    id: str
    priority: str
    max_hours: int
    warning_pct: float
    auto_escalate: bool
    l2_after_minutes: int
    l3_after_minutes: int


@app.get("/sla/policies")
async def sla_policies():
    """Get configured SLA policies."""
    if not supabase:
        # Return defaults from code
        policies = []
        for pri, cfg in sla_engine.SLA_POLICIES.items() if hasattr(sla_engine, 'SLA_POLICIES') else SLA_POLICIES.items():
            policies.append({
                "priority": pri,
                "max_hours": cfg["max_hours"],
                "warning_pct": cfg["warning_pct"],
                "auto_escalate": cfg["auto_escalate_on_breach"],
                "l2_after_minutes": cfg["l2_escalation_mins"],
                "l3_after_minutes": cfg["l3_escalation_mins"],
            })
        return {"policies": policies}

    try:
        res = supabase.table("sla_policies").select("*").execute()
        return {"policies": res.data or []}
    except Exception as e:
        print(f"[SLA] Policies query failed: {e}")
        return {"policies": []}


@app.post("/sla/check")
async def trigger_sla_check():
    """Manually trigger an SLA evaluation cycle (admin)."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    asyncio.create_task(sla_engine.check_all_active_tickets())
    return {"status": "triggered", "message": "SLA check cycle started in background"}


# ---------------------------------------------------------------------------
# Semantic Duplicate Detection Endpoints
# ---------------------------------------------------------------------------

@app.post("/ai/check_duplicate")
async def check_duplicate_endpoint(
    body: TicketRequest,
    company_id: str | None = None,
):
    """
    Check a ticket text for potential duplicates using semantic vector search.
    Returns top candidates with similarity scores.
    """
    text = (body.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    threshold = body.duplicate_sensitivity if hasattr(body, 'duplicate_sensitivity') else None
    result = await semantic_dupe_service.check_duplicate(
        text=text,
        company_id=company_id or body.company,
        threshold=threshold,
    )
    return result


@app.post("/ai/reindex_embeddings")
async def reindex_embeddings():
    """Re-generate vector embeddings for all tickets."""
    result = await semantic_dupe_service.reindex_all()
    return result


@app.get("/system/settings")
async def get_system_settings():
    """Fetch all system settings."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    try:
        res = supabase.table("system_settings").select("*").execute()
        settings = {}
        for row in res.data or []:
            settings[row["key"]] = row["value"]
        return settings
    except Exception as e:
        logger.warning(f"[SETTINGS] Query failed: {e}")
        return {}


@app.patch("/system/settings")
async def update_system_settings(body: dict):
    """Update a specific system setting."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    key = body.get("key")
    value = body.get("value")
    if not key or value is None:
        raise HTTPException(status_code=400, detail="key and value required")
    try:
        supabase.table("system_settings").upsert({
            "key": key,
            "value": value,
            "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
        }).execute()
        return {"status": "updated", "key": key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sla/tickets/{ticket_id}")
async def sla_ticket_detail(ticket_id: str):
    """Get detailed SLA info for a specific ticket."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    # Fetch ticket
    res = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data
    result = sla_engine.evaluate_ticket(ticket)

    # Fetch escalation history for this ticket
    try:
        esc_res = (
            supabase.table("escalation_logs")
            .select("*")
            .eq("ticket_id", ticket_id)
            .order("triggered_at", desc=True)
            .execute()
        )
        escalations = esc_res.data or []
    except Exception:
        escalations = []

    return {
        "ticket": ticket,
        "sla_evaluation": result,
        "escalations": escalations,
    }
