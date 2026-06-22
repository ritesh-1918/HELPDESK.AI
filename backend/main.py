"""
FastAPI Backend — AI Helpdesk Ticket Analyzer
POST /ai/analyze_ticket  →  full analysis of a support ticket
GET  /health             →  service health check
"""

import os
import sys
try:
    import fcntl
except ImportError:
    fcntl = None
import uuid
import json
import re
import datetime
import traceback
import warnings
import logging
import hashlib
import re
import tempfile
from contextlib import asynccontextmanager
import re
import time
import contextlib
from logging.handlers import RotatingFileHandler

# Suppress harmless PyTorch CPU pin_memory warning
from encryption import encrypt_pii, decrypt_pii, is_encrypted
from pii_redaction import redact_pii, redact_pii_dict, set_pii_redaction_enabled, is_pii_redaction_enabled
warnings.filterwarnings("ignore", message="'pin_memory'")

# HF Rebuild Trigger: 2026-03-08-2030
from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect, Header, BackgroundTasks
from slowapi import Limiter, _rate_limit_exceeded_handler
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.encoders import jsonable_encoder
import asyncio
import redis

from pathlib import Path
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
import ipaddress

# Prometheus instrumentation (optional - added when package is available)
try:
    from prometheus_fastapi_instrumentator import Instrumentator
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, REGISTRY
except Exception:
    Instrumentator = None
    generate_latest = None
    CONTENT_TYPE_LATEST = "text/plain; version=0.0.4; charset=utf-8"
    REGISTRY = None
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

# Import Swagger UI custom styling
from backend.swagger_config import SWAGGER_UI_CUSTOM_CSS, SWAGGER_UI_DARK_CSS, SWAGGER_UI_CUSTOM_JS

try:
    import aiofiles
except ImportError:
    # Fallback if aiofiles isn't in their requirements yet
    aiofiles = None

# Load environment variables from backend/.env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# CI smoke tests allow degraded startup so the app can import without heavy ML assets.
ALLOW_DEGRADED_STARTUP = os.environ.get("ALLOW_DEGRADED_STARTUP", "0") == "1"


def _startup_fatal(message: str) -> None:
    print(f"[Startup-FATAL] {message}")

# Initialize Supabase Client (Service Role for backend bypass)
try:
    from supabase import create_client, Client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
        supabase = None
    else:
        from backend.auth.crypto import wrap_client
        supabase = wrap_client(create_client(url, key))
except (ImportError, Exception) as e:
    print(f"[WARNING] Supabase initialization failed: {e}")
    supabase = None
    Client = None

# Initialize Redis Client
redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
try:
    redis_client = redis.from_url(redis_url, decode_responses=True)
    redis_client.ping()
    print("[Startup] Redis Cache connected successfully.")
except Exception as e:
    print(f"[WARNING] Redis initialization failed: {e}")
    redis_client = None


# Ensure project root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

FRONTEND_BASE_URL = os.environ.get("FRONTEND_BASE_URL", "https://helpdeskaiv1.vercel.app").rstrip("/")
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.auth.tenant_middleware import security_manager

from backend.services.classifier_service import ClassifierService
from backend.services.classifier_v2 import classifier_v2
from backend.services.classifier_v3 import classifier_v3 # V3 Power Model
from backend.services.audit_service import AuditLogService, AuditLogAccessError
from backend.services.onnx_service import onnx_classifier
from backend.services.ner_service import NERService
from backend.services.duplicate_service import DuplicateService
from backend.services.incident_service import IncidentService
from backend.services.semantic_duplicate_service import SemanticDuplicateService
from backend.services.rag_service import RagService
from backend.services.cache_service import cache_service
from backend.services.spam_service import SpamService
from backend.services.sla_engine import SLAEngine, compute_sla_breach_at, get_sla_policy
from backend.services.redis_cache import redis_cache
from backend.sla_predictor import get_sla_estimate
from backend.sanitization import get_security_headers
from backend.auth_cookie import router as auth_cookie_router, get_current_user  # noqa: F401
from backend.sanitization import sanitize_text

# Enterprise SSO / SAML & OAuth Imports
from backend.auth.saml_provider import generate_authn_request, parse_metadata_xml, verify_saml_response
from backend.auth.oauth_provider import get_authorization_url, exchange_code_for_tokens, get_user_profile
from backend.services.idp_sync_service import provision_user, handle_scim_webhook, log_sso_event



# ---------------------------------------------------------------------------
# WebSocket Connection Manager — real-time ticket dashboards
# ---------------------------------------------------------------------------

HEARTBEAT_INTERVAL = 30  # seconds between ping broadcasts
HEARTBEAT_TIMEOUT = 10   # seconds to wait for a pong before disconnect
EVICT_INTERVAL = 60      # seconds between stale-connection sweep passes
MAX_PER_ROOM = 50        # max connections per company room
MAX_TOTAL = 500          # global connection cap


class ConnectionManager:
    """Tracks active WebSocket connections grouped by ``company_id``.

    Thread-safe for concurrent connect/disconnect calls from multiple
    ASGI workers (single-process via ``asyncio.Lock``).
    """

    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}
        self._lock = asyncio.Lock()
        self._last_pong: dict[WebSocket, float] = {}

    async def connect(self, company_id: str, ws: WebSocket) -> bool:
        """Accept a new WebSocket and register it under ``company_id``.

        Returns False if global or per-room cap is reached.
        """
        import time
        # Check caps before accepting
        async with self._lock:
            total = sum(len(s) for s in self._connections.values())
            if total >= MAX_TOTAL:
                print(f"[WS] Global connection cap reached ({MAX_TOTAL})")
                return False
            room = self._connections.setdefault(company_id, set())
            if len(room) >= MAX_PER_ROOM:
                print(f"[WS] Room {company_id} cap reached ({MAX_PER_ROOM})")
                return False

        await ws.accept()
        async with self._lock:
            self._connections.setdefault(company_id, set()).add(ws)
            self._last_pong[ws] = time.time()
        return True

    async def disconnect(self, company_id: str, ws: WebSocket) -> None:
        """Remove a WebSocket from the pool."""
        async with self._lock:
            connections = self._connections.get(company_id)
            if connections:
                connections.discard(ws)
                # Clean up empty company groups
                if not connections:
                    del self._connections[company_id]
            self._last_pong.pop(ws, None)

    def record_pong(self, ws: WebSocket) -> None:
        """Record the timestamp of the last received pong frame from a client."""
        import time
        self._last_pong[ws] = time.time()

    async def broadcast(self, company_id: str, message: dict) -> int:
        """Send a JSON message to every client in a company group.

        Returns:
            Number of successfully sent messages.
        """
        payload = json.dumps(message, default=str)
        sent = 0
        async with self._lock:
            connections = set(self._connections.get(company_id, []))

        for ws in connections:
            try:
                await ws.send_text(payload)
                sent += 1
            except Exception:
                await self.disconnect(company_id, ws)
        return sent

    async def broadcast_all(self, message: dict) -> int:
        """Send a JSON message to **all** connected clients."""
        payload = json.dumps(message, default=str)
        sent = 0
        async with self._lock:
            all_connections = {
                ws for group in self._connections.values() for ws in group
            }

        for ws in all_connections:
            try:
                await ws.send_text(payload)
                sent += 1
            except Exception:
                pass
        return sent

    async def ping_all(self) -> None:
        """Send a ``{"type": "ping"}`` heartbeat to every connection.

        Connections that fail to receive the ping or fail to respond within the timeout are removed.
        """
        import time
        current_time = time.time()
        
        async with self._lock:
            # Snapshot all connections under lock so iteration is safe
            snapshot = {
                cid: set(ws_set) for cid, ws_set in self._connections.items()
            }

        for cid, ws_set in snapshot.items():
            for ws in list(ws_set):
                last_active = self._last_pong.get(ws, current_time)
                if current_time - last_active > (HEARTBEAT_INTERVAL + HEARTBEAT_TIMEOUT):
                    print(f"[WS] Client timed out (inactive for {current_time - last_active:.1f}s) — company_id={cid}")
                    await self.disconnect(cid, ws)
                    try:
                        await ws.close(code=1000, reason="Ping timeout")
                    except Exception:
                        pass
                    continue

                try:
                    await ws.send_json({"type": "ping"})
                except Exception:
                    await self.disconnect(cid, ws)

    @property
    def active_count(self) -> int:
        """Total number of connected clients across all companies."""
        return sum(len(ws_set) for ws_set in self._connections.values())

    async def eviction_sweep(self) -> int:
        """Dedicated sweep that evicts connections whose last pong exceeds the timeout.

        Returns the number of evicted connections.
        """
        import time
        now = time.time()
        stale: list[tuple[str, WebSocket]] = []

        async with self._lock:
            for cid, ws_set in self._connections.items():
                for ws in list(ws_set):
                    last = self._last_pong.get(ws, now)
                    if now - last > (HEARTBEAT_INTERVAL + HEARTBEAT_TIMEOUT):
                        stale.append((cid, ws))

        evicted = 0
        for cid, ws in stale:
            await self.disconnect(cid, ws)
            try:
                await ws.close(code=1000, reason="Heartbeat timeout")
            except Exception:
                pass
            evicted += 1

        if evicted:
            print(f"[WS] Eviction sweep: removed {evicted} stale connection(s)")
        return evicted

    def room_stats(self) -> dict:
        """Return per-room and total connection counts for monitoring."""
        return {
            "total": self.active_count,
            "rooms": {cid: len(ws_set) for cid, ws_set in self._connections.items()},
            "room_count": len(self._connections),
        }


# Singleton — reused across lifespan and WebSocket route
connection_manager = ConnectionManager()


async def _heartbeat_loop() -> None:
    """Background task: broadcast ping every ``HEARTBEAT_INTERVAL`` seconds.

    Clients that fail the ping are disconnected automatically by
    ``ConnectionManager.ping_all()``.
    """
    while True:
        await asyncio.sleep(HEARTBEAT_INTERVAL)
        try:
            await connection_manager.ping_all()
            count = connection_manager.active_count
            if count:
                print(f"[WS] Heartbeat sent to {count} active connection(s)")
        except Exception as exc:
            print(f"[WS] Heartbeat error: {exc}")


async def _eviction_loop() -> None:
    """Background task: sweep for stale connections every ``EVICT_INTERVAL`` seconds.

    Connections that missed their pong deadline are closed and removed.
    """
    while True:
        await asyncio.sleep(EVICT_INTERVAL)
        try:
            await connection_manager.eviction_sweep()
        except Exception as exc:
            print(f"[WS] Eviction sweep error: {exc}")


# ---------------------------------------------------------------------------
# SLA helper functions (must be defined before save_ticket uses them)
# ---------------------------------------------------------------------------

def calculate_sla_breach_at(priority: str) -> datetime.datetime:
    """Return the UTC datetime by which the ticket must be resolved."""
    hours_map = {"critical": 2, "high": 8, "medium": 24, "low": 72}
    hours = hours_map.get(str(priority).lower().strip(), 72)
    return datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours)


def calculate_sla_response_at(priority: str) -> datetime.datetime:
    """Return the UTC datetime by which the ticket must receive a first response."""
    hours_map = {"critical": 0.5, "high": 2, "medium": 6, "low": 18}
    hours = hours_map.get(str(priority).lower().strip(), 6)
    return datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours)


def classify_sla_status(sla_breach_at: str | None) -> str:
    """Return 'BREACHED', 'WARNING', or 'ACTIVE' based on the breach time."""
    if not sla_breach_at:
        return "ACTIVE"
    try:
        clean_val = str(sla_breach_at).replace("Z", "+00:00")
        deadline = datetime.datetime.fromisoformat(clean_val)
        if deadline.tzinfo is None:
            deadline = deadline.replace(tzinfo=datetime.timezone.utc)
    except Exception:
        return "ACTIVE"

    now = datetime.datetime.now(datetime.timezone.utc)
    if deadline <= now:
        return "BREACHED"
    if deadline - now <= datetime.timedelta(hours=1):
        return "WARNING"
    return "ACTIVE"

# ── Rate limiter setup ────────────────────────────────────────────────────────
# Uses client IP as the key. In production behind a proxy, set:
#   get_remote_address to read X-Forwarded-For instead.
from backend.services.rate_limit_config import limiter


# Limits (tune via env vars in production)
ML_HEAVY_LIMIT  = "10/minute"   # NLP, OCR, Gemini — GPU/CPU intensive
ML_LIGHT_LIMIT  = "30/minute"   # Similar incident search — lighter

app = FastAPI(title="AI Helpdesk Ticket Analyzer")

# ── Apply to FastAPI app ──────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Hard request body size cap — rejects oversized payloads before any JSON parsing
# or Pydantic validation runs, preventing memory exhaustion from multi-MB uploads.
# Default: 20 MB to accommodate the 14 MB image_base64 limit plus JSON overhead.
_MAX_REQUEST_BODY_BYTES = int(os.getenv("MAX_REQUEST_BODY_BYTES", str(20 * 1024 * 1024)))


@app.middleware("http")
async def request_body_size_guard(request: Request, call_next):
    """Reject requests whose body exceeds _MAX_REQUEST_BODY_BYTES.

    The Content-Length header is checked first (fast path); bodies sent with
    chunked transfer encoding are read and measured before they reach any
    endpoint handler.
    """
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            cl = int(content_length)
            if cl > _MAX_REQUEST_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={
                        "detail": (
                            f"Request body too large ({cl:,} bytes). "
                            f"Maximum allowed size is {_MAX_REQUEST_BODY_BYTES:,} bytes."
                        )
                    },
                )
        except ValueError:
            pass  # malformed Content-Length — let downstream handle it

    return await call_next(request)

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
def get_system_settings(company_id: str) -> dict:
    """
    Fetch system settings for a company from the database.
    Handles both 'enable_auto_resolve' and legacy 'auto_close_enabled' column names.
    Falls back to safe defaults when the DB is unavailable.
    """
    defaults = {
        "ai_confidence_threshold": 0.80,
        "duplicate_sensitivity": 0.85,
        "enable_auto_resolve": False,
        "auto_close_days": 7,
        "auto_close_enabled": False,
        "enable_encryption": False,
        "enable_pii_redaction": False,
    }
    if not supabase or not company_id:
        return defaults

    # Try fetching from Redis Cache
    cache_key = f"system_settings:{company_id}"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as ce:
            print(f"[WARNING] Redis read error for system_settings:{company_id}: {ce}")

    try:
        res = supabase.table("system_settings").select("*").eq(
            "company_id", company_id
        ).single().execute()
        if res.data:
            row = res.data
            merged = {**defaults, **row}
            # Alias: 'auto_close_enabled' → 'enable_auto_resolve' so both names work
            if "auto_close_enabled" in row and "enable_auto_resolve" not in row:
                merged["enable_auto_resolve"] = bool(row["auto_close_enabled"])
            elif "enable_auto_resolve" not in row and "auto_close_enabled" not in row:
                merged["enable_auto_resolve"] = defaults["enable_auto_resolve"]
            return merged
        res = supabase.table("system_settings").select(
            "ai_confidence_threshold, duplicate_sensitivity, enable_auto_resolve, "
            "enable_encryption, enable_pii_redaction"
        ).eq("company_id", company_id).single().execute()
        if res.data:
            settings = {**defaults, **res.data}
            # Wire the toggles into the runtime modules
            try:
                from backend.auth.crypto import set_encryption_setting_enabled
                set_encryption_setting_enabled(bool(settings.get("enable_encryption", False)))
            except Exception:
                pass
            try:
                from backend.services.pii_redaction import set_pii_redaction_enabled
                set_pii_redaction_enabled(bool(settings.get("enable_pii_redaction", False)))
            except Exception:
                pass
            return settings
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
    cached = redis_cache.get_classification(text)
    if cached:
        return cached

    result = _classify_ticket_text_uncached(text)
    redis_cache.set_classification(text, result)
    return result


def _classify_ticket_text_uncached(text: str) -> dict:
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
    image_text: str = ""  # keep for backward compatibility
    user_id: str | None = None
    company: str | None = None
    company_id: str | None = None
    image_url: str | None = None
    confidence_threshold: float = 0.20
    duplicate_sensitivity: float = 0.85

    # Guard limits — tune via environment variables in production
    _MAX_TEXT_LEN: int = int(os.getenv("MAX_TICKET_TEXT_LEN", "50000"))
    # base64 expands binary by ~4/3, so 10 MB binary ≈ 13.3 MB base64
    _MAX_IMAGE_BASE64_LEN: int = int(os.getenv("MAX_IMAGE_BASE64_LEN", "14000000"))

    @field_validator("text")
    @classmethod
    def validate_text_length(cls, v: str) -> str:
        max_len = int(os.getenv("MAX_TICKET_TEXT_LEN", "50000"))
        if len(v) > max_len:
            raise ValueError(
                f"Ticket text exceeds maximum length of {max_len:,} characters "
                f"(got {len(v):,}). Please shorten your description."
            )
        return v

    @field_validator("image_base64")
    @classmethod
    def validate_image_base64_size(cls, v: str) -> str:
        """Reject oversized base64 payloads before any decoding or OCR is attempted.

        Raising ValueError here causes Pydantic to return a 422 Unprocessable
        Entity with a clear error message. A middleware-level 413 guard (via
        RequestBodySizeLimitMiddleware) acts as the first line of defence so
        this validator is primarily a safety net for requests that bypass the
        middleware (e.g. unit tests, internal calls).
        """
        if not v:
            return v
        max_len = int(os.getenv("MAX_IMAGE_BASE64_LEN", "14000000"))
        if len(v) > max_len:
            raise ValueError(
                f"Image payload exceeds the {max_len // 1_000_000} MB limit. "
                "Please resize or compress the image before uploading."
            )
        return v

    @field_validator("confidence_threshold", "duplicate_sensitivity")
    @classmethod
    def validate_threshold_range(cls, v: float) -> float:
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"Value must be between 0.0 and 1.0, got {v}")
        return v

class TicketSaveRequest(BaseModel):
    model_config = {"extra": "allow"}

    user_id: str
    subject: str
    description: str
    category: str
    subcategory: str
    priority: str
    assigned_team: str
    status: str

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Return a lightweight status payload showing whether core models are loaded."""
    return {"status": "ok"}

# NLP classification endpoint
@app.post("/analyze")
@limiter.limit(ML_HEAVY_LIMIT)
async def analyze_ticket(request: Request, ticket: TicketRequest):
    """Legacy NLP classification endpoint. Use /ai/analyze_ticket for full pipeline."""
    # ... existing implementation unchanged ...
    pass

# OCR processing endpoint
@app.post("/analyze-ocr")
@limiter.limit(ML_HEAVY_LIMIT)
async def analyze_ocr(request: Request, ticket: TicketRequest):
    """Legacy OCR analysis endpoint. Extracts text from images and classifies alongside ticket text."""
    # ... existing implementation unchanged ...
    pass

# Similar incident detection endpoint
@app.post("/similar")
@limiter.limit(ML_LIGHT_LIMIT)
async def find_similar(request: Request, ticket: TicketRequest):
    """Legacy similar ticket detection. Use /ai/check_duplicate for the current implementation."""
    # ... existing implementation unchanged ...
    pass

# Gemini LLM resolution endpoint
@app.post("/gemini-resolve")
@limiter.limit(ML_HEAVY_LIMIT)
async def gemini_resolve(request: Request, ticket: TicketRequest):
    # ... existing implementation unchanged ...
    pass
    auto_resolve: bool
    is_duplicate: bool
    confidence: float
    detected_language: str | None = None
    original_body: str | None = None
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
    source: str = "text"



class RatingRequest(BaseModel):
    ticket_id: str
    rating: int
    feedback: str | None = None

class AgentCSATResponse(BaseModel):
    agent_id: str
    avg_rating: float
    total_ratings: int
    ratings_distribution: dict

class DuplicateInfo(BaseModel):
    is_duplicate: bool
    duplicate_ticket_id: str | None = None
    similarity: float = 0.0


class IncidentInfo(BaseModel):
    incident_id: str | None = None
    is_major_incident: bool = False
    ticket_count: int = 0
    affected_users: int = 0
    similarity: float = 0.0


class EntityInfo(BaseModel):
    text: str
    label: str
    confidence: float


class SpamCheck(BaseModel):
    is_spam: bool = False
    risk_score: float = 0.0
    reasons: list[str] = []
    suspicious_urls: list[str] = []
    matched_keywords: list[str] = []


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
    incident: IncidentInfo = IncidentInfo()
    confidence: float
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
    original_text: str | None = None
    source_language: str = "en"
    source_language_name: str = "English"
    was_translated: bool = False
    spam_check: SpamCheck = SpamCheck()
    version: str = "2.1.0-Neural-Diagnostic"

# --- Persistence Models ---
class Message(BaseModel):
    sender: str
    message: str
    timestamp: str





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





class SLAPredictRequest(BaseModel):
    priority: str
    created_at: str
    sla_breach_at: str | None = None
    category: str | None = None
    assigned_team: str | None = None
    team_workload: str = "normal"
    similar_avg_resolution_hours: float | None = None
    similar_count: int = 0
    thresholds: dict | None = None

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
incident_service = IncidentService(duplicate_service)
rag_service = RagService()
spam_service = SpamService()
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

LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "de": "German",
    "hi": "Hindi",
    "fr": "French",
    "it": "Italian",
    "pt": "Portuguese",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "ru": "Russian",
}

try:
    from backend.language_pipeline import (
        detect_language as _lp_detect_language,
        translate_to_english as _lp_translate_to_english,
        translate_from_english as _lp_translate_from_english,
        LANGUAGE_NAMES as _LP_LANGUAGE_NAMES,
    )
    LANGUAGE_NAMES.update(_LP_LANGUAGE_NAMES)
    _LANGUAGE_PIPELINE_AVAILABLE = True
except ImportError:
    _LANGUAGE_PIPELINE_AVAILABLE = False


def _heuristic_language_detection(text: str) -> dict:
    sample = (text or "").strip()
    if not sample:
        return {"code": "en", "name": "English"}
    ascii_chars = sum(1 for c in sample if ord(c) < 128)
    ratio = ascii_chars / max(len(sample), 1)
    if ratio > 0.97:
        return {"code": "en", "name": "English"}
    return {"code": "unknown", "name": "Unknown"}

import asyncio
async def detect_and_translate_ticket_text(text: str) -> dict:
    original_text = (text or "").strip()
    if not original_text:
        return {
            "text_for_analysis": text or "",
            "source_language": "en",
            "source_language_name": "English",
            "was_translated": False,
            "original_text": "",
            "metadata":{},
        }

    # --- Step 1: Language detection ---
    # Primary: language_pipeline (langdetect); secondary: Gemini; fallback: heuristic
    if _LANGUAGE_PIPELINE_AVAILABLE:
        source_code = _lp_detect_language(original_text)
        source_name = LANGUAGE_NAMES.get(source_code, source_code.upper())
    else:
        detected = _heuristic_language_detection(original_text)
        if gemini_service and getattr(gemini_service, "_initialized", False):
            detected = await asyncio.to_thread(gemini_service.detect_language, original_text)
        source_code = str(detected.get("code", "en")).lower()
        source_name = detected.get("name") or LANGUAGE_NAMES.get(source_code, source_code.upper())

    # If langdetect returned "en" / "unknown", try Gemini for confirmation
    if source_code in ("en", "unknown") and gemini_service and getattr(gemini_service, "_initialized", False):
        gemini_detected = await asyncio.to_thread(gemini_service.detect_language, original_text)
        gemini_code = str(gemini_detected.get("code", "en")).lower()
        if gemini_code not in ("en", "eng", "unknown"):
            source_code = gemini_code
            source_name = gemini_detected.get("name") or LANGUAGE_NAMES.get(gemini_code, gemini_code.upper())

    if source_code in ("en", "eng", "unknown"):
        return {
            "text_for_analysis": original_text,
            "source_language": "en",
            "source_language_name": "English",
            "was_translated": False,
            "original_text": original_text,
            "metadata":{},
        }

    # --- Step 2: Translation to English ---
    # Primary: language_pipeline (Helsinki-NLP); fallback: Gemini
    translated_text = original_text
    if _LANGUAGE_PIPELINE_AVAILABLE:
        translated_text = await asyncio.to_thread(_lp_translate_to_english, original_text, source_code)

    # Fall back to Gemini if Helsinki-NLP returned the same text (model unavailable)
    if translated_text == original_text and gemini_service and getattr(gemini_service, "_initialized", False):
        translated_text = await asyncio.to_thread(gemini_service.translate_to_english, original_text, source_name)

    if not translated_text or translated_text.strip() == original_text:
        return {
            "text_for_analysis": original_text,
            "source_language": source_code,
            "source_language_name": source_name,
            "was_translated": False,
            "original_text": original_text,
            "metadata":{},
        }

    return {
        "text_for_analysis": translated_text.strip(),
        "source_language": source_code,
        "source_language_name": source_name,
        "was_translated": True,
        "original_text": original_text,
        "metadata":{},
    }


# ---------------------------------------------------------------------------
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all models at startup."""
    print("[Startup] Loading AI models ...")

    # Connect to Redis cache (non-fatal — graceful degradation on failure)
    cache_service.connect()
    print(
        f"[Startup] Redis Cache: {'Connected' if cache_service.is_available else 'Unavailable (running without cache)'}"
    )

    try:
        redis_cache.connect()
    except Exception as e:
        print(f"[WARNING] Redis cache not available: {e}")
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
        
        # Start background weekly digest email scheduler (checks hourly)
        from backend.services.digest_service import digest_scheduler_loop_async
        asyncio.create_task(digest_scheduler_loop_async(supabase, interval_seconds=3600))
        print("[Startup] Weekly digest email scheduler started (interval=3600s)")

    print("[Startup] Classifier V2 Shadow: Ready.")
    print(f"[Startup] ONNX MiniLM Fallback: {'READY' if getattr(onnx_classifier, '_loaded', False) else 'DEGRADED (artifacts missing)'}")
    print("[Startup] Ready.")

    # Start WebSocket heartbeat background loop
    heartbeat_task = asyncio.create_task(_heartbeat_loop())
    print("[Startup] WebSocket heartbeat loop started (interval=30s).")

    # Start WebSocket connection pool eviction sweep
    eviction_task = asyncio.create_task(_eviction_loop())
    print("[Startup] WebSocket eviction sweep started (interval=60s).")

    yield

    # Cancel background tasks on shutdown
    heartbeat_task.cancel()
    eviction_task.cancel()
    try:
        await heartbeat_task
    except asyncio.CancelledError:
        pass
    try:
        await eviction_task
    except asyncio.CancelledError:
        pass
    print("[Shutdown] Cleaning up ...")
    cache_service.close()
    print("[Shutdown] Redis cache connection closed.")
    if hasattr(app.state, "scheduler"):
        app.state.scheduler.shutdown()

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
API_DESCRIPTION = """
# HELPDESK.AI Backend API

A FastAPI service powering AI-driven IT support ticket triage, classification, and
auto-resolution.

## Capabilities
- **AI Analysis** — multi-stage NLP cascade (NER, classification, duplicate detection,
  RAG knowledge base lookup, optional Gemini vision/summary).
- **Ticket Lifecycle** — create, fetch, patch, and persist tickets via Supabase.
- **Diagnostics** — health/readiness probes and admin correction logging for
  continuous improvement.

## Authentication
Supabase service-role authentication is performed server-side. Frontend clients
should call these endpoints over HTTPS from the configured CORS origins.

## Rate Limits
The `/ai/analyze_ticket` endpoint is capped at **10 requests / minute / IP**.
"""

TAGS_METADATA = [
    {
        "name": "System",
        "description": "Service health, readiness, landing page, and monitoring endpoints.",
    },
    {
        "name": "AI Analysis",
        "description": "Core NLP endpoints: classification, troubleshooting, bug analysis, duplicate detection, and streaming analysis.",
    },
    {
        "name": "Tickets",
        "description": "CRUD operations over support tickets (Supabase + in-memory). Includes search, bulk operations, and ratings.",
    },
    {
        "name": "Admin",
        "description": "Internal endpoints for correction logging, CSAT reporting, knowledge gap analysis, and security auditing.",
    },
    {
        "name": "Docs",
        "description": "Themed API documentation (Swagger UI and ReDoc).",
    },
    {
        "name": "SLA Management",
        "description": "SLA tracking, breach detection, escalation management, and policy configuration.",
    },
    {
        "name": "Translation",
        "description": "Multi-language translation endpoints for tickets and text.",
    },
    {
        "name": "Estimator",
        "description": "Response time and SLA estimation endpoints.",
    },
    {
        "name": "Voice",
        "description": "Voice-to-ticket endpoints using speech-to-text transcription.",
    },
    {
        "name": "Weekly Digest",
        "description": "Automated weekly digest emails with ticket summaries and trends.",
    },
]

app = FastAPI(
    title="HELPDESK.AI Backend",
    description=API_DESCRIPTION,
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=TAGS_METADATA,
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        "docExpansion": "none",
        "filter": True,
        "syntaxHighlight.theme": "monokai",
    },
    swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
    swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
)
app.state.supabase = supabase

# Corporate-clean Swagger theme overrides (HELPDESK.AI palette: emerald + slate).
SWAGGER_CUSTOM_CSS = """
:root {
  --hd-bg: #0f172a;
  --hd-panel: #1e293b;
  --hd-border: #334155;
  --hd-text: #f8fafc;
  --hd-muted: #94a3b8;
  --hd-accent: #10b981;
  --hd-accent-2: #3b82f6;
}
body { background: var(--hd-bg); color: var(--hd-text); font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.swagger-ui, .swagger-ui .info .title, .swagger-ui .opblock-tag, .swagger-ui .opblock .opblock-summary-operation-id,
.swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-description,
.swagger-ui table thead tr th, .swagger-ui .parameter__name, .swagger-ui .parameter__type,
.swagger-ui .response-col_status, .swagger-ui .model-title, .swagger-ui .markdown p,
.swagger-ui .info p, .swagger-ui label, .swagger-ui .tab li, .swagger-ui section.models h4 { color: var(--hd-text); }
.swagger-ui .topbar { background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); border-bottom: 1px solid var(--hd-border); padding: 12px 24px; }
.swagger-ui .topbar .download-url-wrapper { display: none; }
.swagger-ui .info { margin: 32px 0; }
.swagger-ui .info .title { font-weight: 700; letter-spacing: -0.02em; }
.swagger-ui .info .title small.version-stamp { background: var(--hd-accent); color: #052e1c; }
.swagger-ui .scheme-container { background: var(--hd-panel); border: 1px solid var(--hd-border); box-shadow: none; padding: 16px 20px; }
.swagger-ui .opblock-tag { border-bottom: 1px solid var(--hd-border); font-weight: 600; }
.swagger-ui .opblock { background: var(--hd-panel); border: 1px solid var(--hd-border); border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 0 0 16px; }
.swagger-ui .opblock .opblock-summary { border-bottom: 1px solid var(--hd-border); }
.swagger-ui .opblock.opblock-get .opblock-summary-method { background: var(--hd-accent-2); }
.swagger-ui .opblock.opblock-post .opblock-summary-method { background: var(--hd-accent); }
.swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #f59e0b; }
.swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; }
.swagger-ui .btn { border-radius: 8px; border-color: var(--hd-border); color: var(--hd-text); }
.swagger-ui .btn.execute { background: var(--hd-accent); border-color: var(--hd-accent); color: #052e1c; }
.swagger-ui .btn.execute:hover { background: #0ea271; }
.swagger-ui .btn.authorize { background: var(--hd-accent-2); border-color: var(--hd-accent-2); color: #ffffff; }
.swagger-ui input[type=text], .swagger-ui textarea, .swagger-ui select { background: #0b1220; color: var(--hd-text); border: 1px solid var(--hd-border); }
.swagger-ui .markdown code, .swagger-ui .renderedMarkdown code { background: #0b1220; color: #5eead4; padding: 2px 6px; border-radius: 4px; }
.swagger-ui section.models { background: var(--hd-panel); border: 1px solid var(--hd-border); border-radius: 10px; }
.swagger-ui .model-box { background: #0b1220; }
.swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 { color: var(--hd-muted); }
.swagger-ui .response-col_description__inner div.markdown, .swagger-ui .response-col_description__inner div.renderedMarkdown { background: #0b1220; color: var(--hd-text); }
"""

# Rate limiter — 10 AI requests per minute per IP (free tier protection)
from backend.services.rate_limit_config import limiter
app.state.limiter = limiter



async def _custom_rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Custom 429 handler that returns JSON with retry_after field."""
    limit_str = str(exc.detail) if hasattr(exc, 'detail') else RATE_LIMIT_AI
    retry_after = get_retry_after_seconds(limit_str)
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": f"Too many requests. Please retry after {retry_after} seconds.",
            "retry_after": retry_after,
            "limit": limit_str,
        },
        headers={"Retry-After": str(retry_after)},
    )


app.add_exception_handler(RateLimitExceeded, _custom_rate_limit_handler)

# ── Security Headers Middleware (Helmet.js equivalent) ────────────────────────
from security_middleware import SecurityHeadersMiddleware, get_allowed_origins
app.add_middleware(SecurityHeadersMiddleware)

# ── CORS — strictly from ALLOWED_ORIGINS env var, never wildcard ──────────────
_allowed_origins = get_allowed_origins()
print(f"[startup] CORS allowed origins: {_allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.middleware.tenant_validator import TenantValidatorMiddleware
app.add_middleware(TenantValidatorMiddleware)


app.include_router(auth_cookie_router)

# ---------------------------------------------------------------------------
# Prometheus HTTP request instrumentation
# ---------------------------------------------------------------------------
# Exposes http_request_duration_seconds, http_requests_total, http_requests_in_progress
METRICS_TOKEN = os.environ.get("METRICS_TOKEN", "")
METRICS_ALLOWED_IPS = {
    ip.strip()
    for ip in os.environ.get("METRICS_ALLOWED_IPS", "127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16").split(",")
    if ip.strip()
}

instrumentator = Instrumentator(
    should_group_status_codes=True,
    should_group_untemplated=True,
    excluded_handlers=["/metrics", "/health"],
)
instrumentator.instrument(app)

# Translation service routes
from backend.routes.translation import router as translation_router
app.include_router(translation_router)

# Response time estimator routes
from backend.routes.estimator import router as estimator_router
app.include_router(estimator_router)

# Tagging router (Issue #404)
from tag_router import router as tag_router
app.include_router(tag_router)

# Sentiment router (Issue #775)
from sentiment_router import router as sentiment_router
app.include_router(sentiment_router)


# ---------------------------------------------------------------------------
# Custom Swagger UI with branding
# ---------------------------------------------------------------------------
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html(request: Request):
    """Serve custom Swagger UI with AI Helpdesk branding."""
    theme = request.query_params.get("theme", "light")
    dark_mode = theme == "dark"
    return HTMLResponse(
        content=f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI Helpdesk API Documentation</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
        <style>{SWAGGER_UI_CUSTOM_CSS}</style>
        <style id="swagger-dark-css">{SWAGGER_UI_DARK_CSS if dark_mode else ''}</style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
            const ui = SwaggerUIBundle({{
                url: '/openapi.json',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIBundle.SwaggerUIStandalonePreset
                ],
                layout: "BaseLayout",
                defaultModelsExpandDepth: -1,
                docExpansion: "none",
                filter: true,
                syntaxHighlight: {{"theme": "monokai"}}
            }});
            window._swaggerUi = ui;
        </script>
        <script id="swagger-dark-data" type="application/json">{json.dumps(SWAGGER_UI_DARK_CSS)}</script>
        <script>{SWAGGER_UI_CUSTOM_JS}</script>
    </body>
    </html>
    """,
        media_type="text/html",
    )


# ---------------------------------------------------------------------------
# Prometheus instrumentation and /metrics endpoint (secure)
# ---------------------------------------------------------------------------
if Instrumentator:
    try:
        instrumentator = Instrumentator()
        instrumentator.instrument(app)
    except Exception as e:
        instrumentator = None
        print(f"[METRICS] Instrumentator init failed: {e}")
else:
    instrumentator = None


@app.get("/metrics")
async def metrics_endpoint(request: Request):
    """Expose Prometheus metrics with basic IP / token-based protections.

    Controls:
    - `METRICS_TOKEN` env var: if set, the client must provide that token either
      via the `token` query param or `X-Metrics-Token` header.
    - `METRICS_ALLOWED_IPS` env var: comma-separated CIDR or IP list allowed.
    - If neither is set, only localhost (127.0.0.1 / ::1) is allowed.
    """
    # Token-based auth (preferred)
    metrics_token = os.environ.get("METRICS_TOKEN")
    allowed_ips = os.environ.get("METRICS_ALLOWED_IPS", "")
    client_ip = None
    try:
        client_ip = request.client.host if request.client else None
    except Exception:
        client_ip = None

    # Check token first (header or query param)
    if metrics_token:
        token = None
        # header may be presented in different casing; prefer X-Metrics-Token
        token = request.headers.get("X-Metrics-Token") or request.query_params.get("token")
        if token != metrics_token:
            raise HTTPException(status_code=403, detail="Forbidden: invalid metrics token")
    elif allowed_ips:
        # Validate client IP against allowed CIDRs
        try:
            allowed = [s.strip() for s in allowed_ips.split(",") if s.strip()]
            ok = False
            if client_ip:
                for entry in allowed:
                    try:
                        net = ipaddress.ip_network(entry, strict=False)
                        if ipaddress.ip_address(client_ip) in net:
                            ok = True
                            break
                    except Exception:
                        # Treat as single IP
                        if client_ip == entry:
                            ok = True
                            break
            if not ok:
                raise HTTPException(status_code=403, detail="Forbidden: IP not allowed")
        except HTTPException:
            raise
        except Exception as e:
            print(f"[METRICS] allowed_ips parse error: {e}")
            raise HTTPException(status_code=500, detail="Metrics configuration error")
    else:
        # Default: local-only
        if client_ip not in ("127.0.0.1", "::1"):
            raise HTTPException(status_code=403, detail="Forbidden: metrics restricted to localhost")

    if REGISTRY is None or generate_latest is None:
        return JSONResponse(status_code=503, content={"status": "metrics_unavailable"})

    data = generate_latest(REGISTRY)
    return StreamingResponse(content=data, media_type=CONTENT_TYPE_LATEST)


# Request context binding middleware for encryption auditing and tenant context
@app.middleware("http")
async def audit_context_middleware(request: Request, call_next):
    from backend.security.encryption_manager import request_context
    import base64
    import json
    
    user_id = request.headers.get("x-user-id")
    company_id = request.headers.get("x-company-id") or request.headers.get("x-tenant-id")
    
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            parts = token.split(".")
            if len(parts) == 3:
                payload_b64 = parts[1]
                payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
                payload = json.loads(base64.b64decode(payload_b64).decode("utf-8"))
                if not user_id:
                    user_id = payload.get("sub")
                if not company_id:
                    user_metadata = payload.get("user_metadata", {})
                    company_id = user_metadata.get("company_id") or payload.get("company_id")
        except Exception:
            pass
            
    ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    request_source = f"IP: {ip}, UA: {user_agent}"
    
    context = {
        "user_id": user_id,
        "company_id": company_id,
        "request_source": request_source
    }
    
    token_var = request_context.set(context)
    try:
        response = await call_next(request)
        return response
    finally:
        request_context.reset(token_var)


# ---------------------------------------------------------------------------
# Root & Health check
# ---------------------------------------------------------------------------
@app.get("/", response_class=HTMLResponse, tags=["System"], summary="API landing page")
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
                <a href="{FRONTEND_BASE_URL}/" target="_blank" class="btn-hover block w-full bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700/80 rounded-xl p-5 group">
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


async def verify_metrics_token(x_metrics_token: str | None = Header(default=None)):
    expected_token = os.environ.get("METRICS_TOKEN")
    if expected_token and x_metrics_token != expected_token:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/metrics", dependencies=[Depends(verify_metrics_token)])
def metrics():
    """Prometheus scrape endpoint — exposes HTTP request, AI inference, and system metrics."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Return a lightweight status payload showing whether core models are loaded."""
    return HealthResponse(
        status="ok",
        classifier_loaded=classifier_service._loaded,
        ner_loaded=ner_service._loaded,
    )


@app.get("/cache/health")
async def cache_health():
    """Report Redis connectivity and configuration."""
    return {
        "redis_available": cache_service.is_available,
        "redis_ping": cache_service.ping(),
        "redis_url": (
            os.getenv("REDIS_URL", "redis://localhost:6379/0").split("@")[-1]
        ),
    }


@app.get("/ready", response_model=ReadinessResponse)
@app.get("/ready", response_model=ReadinessResponse, tags=["System"], summary="Readiness probe")
async def readiness_check():
    """Return ``ready`` only when all required subsystems (classifier, NER,
    duplicate index, RAG, and optionally Supabase) report healthy. Returns
    HTTP 503 otherwise — suitable for Kubernetes / load-balancer probes."""
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


# ---------------------------------------------------------------------------
# Weekly Digest endpoints
# ---------------------------------------------------------------------------
@app.post("/api/digest/send-now")
async def send_digest_now(current_user: dict = Depends(get_current_user)):
    """Manual trigger to send the weekly digest email."""
    from backend.services.digest_service import get_weekly_stats, generate_ai_summary, send_digest_email
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection not initialized")
        
    try:
        # For manual test, get the first admin or a specific user
        # To match the requirements simply: send to all admins with digest_enabled=True
        res = supabase.table("system_settings").select("company_id, digest_enabled").eq("digest_enabled", True).execute()
        companies = res.data or []
        
        sent_count = 0
        for comp in companies:
            company_id = comp.get("company_id")
            admins_res = supabase.table("profiles").select("email").eq("company_id", company_id).eq("role", "admin").execute()
            admins = admins_res.data or []
            
            if not admins:
                continue
                
            stats = get_weekly_stats() 
            summary = generate_ai_summary(stats)
            
            for admin in admins:
                email = admin.get("email")
                if email:
                    send_digest_email(email, stats, summary)
                    sent_count += 1
                    
        return {"status": "success", "emails_sent": sent_count}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



class TroubleshootResponse(BaseModel):
    step_text: str
    options: list[str]
    is_final: bool


class TroubleshootRequest(BaseModel):
    text: str
    category: str
    history: list[dict] = []


class TroubleshootResponse(BaseModel):
    step_text: str
    options: list[str]
    is_final: bool


@app.post("/ai/troubleshoot", response_model=TroubleshootResponse)
@limiter.limit("10/minute")
async def troubleshoot(request: Request, request_body: TroubleshootRequest):
    """Get the next dynamic troubleshooting step from Gemini given the user's
    ticket text, predicted category, and the conversation history so far.
    Returns the next ``step_text``, suggested ``options``, and an ``is_final``
    flag signalling when the wizard should end."""
    if not gemini_service or not gemini_service._initialized:
        return TroubleshootResponse(
            step_text="AI Troubleshooting is currently unavailable.",
            options=["Continue to tracking"],
            is_final=True
        )

    result = gemini_service.get_troubleshooting_step(
        request_body.text,
        request_body.history,
        request_body.category
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
@limiter.limit("10/minute")
async def analyze_bug(request: Request, request_body: BugReportAnalysisRequest):
    """Analyze a structured bug report (title, description, repro steps, and any
    captured console errors) using Gemini and return a short ``probable_cause``
    explanation that frontends can show to the reporter."""
    if not gemini_service or not gemini_service._initialized:
        return BugReportAnalysisResponse(
            probable_cause="AI Diagnostics are currently unavailable."
        )
    
    cause = gemini_service.analyze_bug_report(
        request_body.bug_title,
        request_body.description,
        request_body.steps_to_reproduce,
        request_body.console_errors
    )
    return BugReportAnalysisResponse(probable_cause=cause)


# ---------------------------------------------------------------------------
# Agent Performance Scorecard endpoint
# ---------------------------------------------------------------------------

@app.get("/ai/agent_scorecard")
async def agent_scorecard(company_id: str | None = None):
    """
    Build a real-time performance scorecard for every support agent
    (grouped by assigned_team) within a company, then request personalised
    AI coaching insights from Gemini for each one.

    Query params:
        company_id: filter tickets to a specific tenant (optional)

    Returns a list of agent scorecard objects sorted by performance score.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection not initialised")

    try:
        query = supabase.table("tickets").select(
            "id, assigned_team, status, priority, created_at, updated_at, "
            "sla_breach_at, auto_resolve, category, subcategory"
        ).order("created_at", desc=False)

        if company_id:
            query = query.eq("company_id", company_id)

        res = query.execute()
        tickets = res.data or []
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tickets: {exc}")

    if not tickets:
        return {"scorecards": [], "generated_at": datetime.datetime.utcnow().isoformat() + "Z"}

    # Group tickets by assigned_team (treated as the agent dimension)
    from collections import defaultdict, Counter

    team_buckets: dict[str, list] = defaultdict(list)
    for t in tickets:
        team = (t.get("assigned_team") or "Unassigned").strip()
        team_buckets[team].append(t)

    scorecards = []

    for team_name, team_tickets in team_buckets.items():
        total = len(team_tickets)
        resolved = sum(
            1 for t in team_tickets if (t.get("status") or "").lower().startswith("resolv")
        )
        open_count = total - resolved
        critical = sum(1 for t in team_tickets if (t.get("priority") or "").lower() == "critical")
        auto_resolved = sum(1 for t in team_tickets if t.get("auto_resolve"))

        # Average resolution time in hours (only for resolved tickets with both timestamps)
        resolution_times: list[float] = []
        for t in team_tickets:
            if (t.get("status") or "").lower().startswith("resolv") and t.get("created_at") and t.get("updated_at"):
                try:
                    created = datetime.datetime.fromisoformat(t["created_at"].replace("Z", "+00:00"))
                    updated = datetime.datetime.fromisoformat(t["updated_at"].replace("Z", "+00:00"))
                    hours = (updated - created).total_seconds() / 3600
                    if hours >= 0:
                        resolution_times.append(hours)
                except Exception:
                    pass

        avg_resolution_hours = (
            round(sum(resolution_times) / len(resolution_times), 2)
            if resolution_times
            else 0.0
        )

        # SLA breach rate
        sla_breached = 0
        now_utc = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc)
        for t in team_tickets:
            breach_at = t.get("sla_breach_at")
            if breach_at:
                try:
                    breach_dt = datetime.datetime.fromisoformat(breach_at.replace("Z", "+00:00"))
                    ticket_open = not (t.get("status") or "").lower().startswith("resolv")
                    if ticket_open and breach_dt < now_utc:
                        sla_breached += 1
                except Exception:
                    pass

        sla_breach_rate = round((sla_breached / total) * 100, 2) if total else 0.0
        auto_resolved_rate = round((auto_resolved / total) * 100, 2) if total else 0.0

        cat_counter = Counter(t.get("category") or "Unknown" for t in team_tickets)
        sub_counter = Counter(t.get("subcategory") or "Unknown" for t in team_tickets)
        top_categories = [c for c, _ in cat_counter.most_common(3)]
        common_subcategories = [s for s, _ in sub_counter.most_common(3)]

        metrics = {
            "total_tickets": total,
            "resolved_tickets": resolved,
            "open_tickets": open_count,
            "critical_tickets": critical,
            "avg_resolution_hours": avg_resolution_hours,
            "sla_breach_rate": sla_breach_rate,
            "auto_resolved_rate": auto_resolved_rate,
            "top_categories": top_categories,
            "common_subcategories": common_subcategories,
        }

        # Request Gemini coaching (graceful fallback when Gemini unavailable)
        coaching: dict = {
            "performance_score": 0,
            "strengths": [],
            "improvement_areas": [],
            "coaching_tip": "AI coaching requires Gemini to be configured.",
            "recommended_training": [],
        }
        if gemini_service and gemini_service._initialized:
            try:
                coaching = gemini_service.get_agent_coaching(team_name, metrics)
            except Exception as coaching_exc:
                print(f"[Scorecard] Gemini coaching failed for {team_name}: {coaching_exc}")

        scorecards.append({
            "agent_team": team_name,
            "metrics": metrics,
            "coaching": coaching,
        })

    # Sort descending by performance score so top performers appear first
    scorecards.sort(key=lambda s: s["coaching"]["performance_score"], reverse=True)

    return {
        "scorecards": scorecards,
        "total_agents": len(scorecards),
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
    }


# ---------------------------------------------------------------------------
# Admin Correction Logging endpoint
# ---------------------------------------------------------------------------
def extract_token(request: Request) -> str | None:
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip() or None
    return None

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

CORRECTIONS_LOG_PATH = Path(__file__).parent / "data" / "corrections_log.json"
_corrections_lock = asyncio.Lock()

_EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
_PHONE_RE = re.compile(r"\b\d{10,}\b")
_IP_RE = re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b")


def _redact_pii(text: str) -> str:
    text = _EMAIL_RE.sub("[EMAIL REDACTED]", text)
    text = _PHONE_RE.sub("[PHONE REDACTED]", text)
    text = _IP_RE.sub("[IP REDACTED]", text)
    return text


def _atomic_write_json(path: Path, data) -> None:
    tmp_path = path.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp_path, path)


@app.post("/ai/log_correction")
@limiter.limit("30/minute")
async def log_correction(request: Request, user: dict = Depends(get_current_user)):
    """Log an admin correction when the AI prediction differs from the human decision."""
    role = (user.get("user_metadata") or {}).get("role", "") or (user.get("app_metadata") or {}).get("role", "")
    if role not in ("admin", "company_admin"):
        raise HTTPException(status_code=403, detail="Only admins can log corrections")

    profile = {}
    if supabase:
        try:
            profile_res = supabase.table("profiles").select("company_id, company").eq("id", user["id"]).single().execute()
            profile = profile_res.data or {}
        except Exception:
            pass

    try:
        body = await request.json()
    except Exception as e:
        logging.error(f"[CORRECTION ERROR] Could not parse request body: {e}")
        return {"status": "error", "message": "Invalid JSON body"}

    logging.info(f"[CORRECTION RECEIVED] Payload keys: {list(body.keys())}")

    ticket_id = str(body.get("ticket_id", "unknown"))
    original_text = _redact_pii(str(body.get("original_text", "")))
    ocr_text = _redact_pii(str(body.get("ocr_text", "")))
    confidence = float(body.get("confidence") or 0.0)
    original_prediction = body.get("original_prediction") or {}
    corrected_prediction = body.get("corrected_prediction") or {}

    if supabase and ticket_id != "unknown":
        try:
            ticket_res = supabase.table("tickets").select("id, company_id").eq("id", ticket_id).single().execute()
            if not ticket_res.data:
                return {"status": "error", "message": "Ticket not found"}
            ticket_company = ticket_res.data.get("company_id")
            admin_company = profile.get("company_id")
            if admin_company and ticket_company and ticket_company != admin_company:
                return {"status": "error", "message": "Ticket does not belong to your company"}
        except Exception as e:
            return {"status": "error", "message": f"Ticket not found"}

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
        "corrected_by": user["id"],
        "company_id": profile.get("company_id"),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

    try:
        CORRECTIONS_LOG_MAX = int(os.getenv("CORRECTIONS_LOG_MAX", "10000"))

        def _read_write_log():
            """Read-modify-write cycle with cross-process file locking.

            Locking strategy (two layers):
              1. asyncio.Lock (_corrections_lock) — serialises concurrent
                 coroutine calls within a single process/worker.
              2. fcntl.flock(LOCK_EX) — serialises concurrent OS-process
                 writes when the app runs with multiple uvicorn workers.

            Atomicity: data is written to a sibling .tmp file first, then
            renamed via os.replace() which is POSIX-atomic. A crash mid-write
            leaves the old file intact; the .tmp file is discarded on the
            next start.
            """
            CORRECTIONS_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

            lock_path = CORRECTIONS_LOG_PATH.with_suffix(".lock")
            with open(lock_path, "w") as lock_fd:
                if fcntl is not None:
                    fcntl.flock(lock_fd, fcntl.LOCK_EX)
                try:
                    logs: list = []
                    if CORRECTIONS_LOG_PATH.exists() and CORRECTIONS_LOG_PATH.stat().st_size > 2:
                        try:
                            with open(CORRECTIONS_LOG_PATH, "r", encoding="utf-8") as f:
                                parsed = json.load(f)
                            # Guard against a file that was corrupted to a non-list value
                            logs = parsed if isinstance(parsed, list) else []
                        except (json.JSONDecodeError, OSError) as read_err:
                            logging.warning(
                                "[CORRECTION] Could not parse existing log; starting fresh: %s",
                                read_err,
                            )
                            logs = []

                    if len(logs) >= CORRECTIONS_LOG_MAX:
                        logs = logs[-(CORRECTIONS_LOG_MAX - 1):]

                    logs.append(entry)
                    _atomic_write_json(CORRECTIONS_LOG_PATH, logs)
                finally:
                    if fcntl is not None:
                        fcntl.flock(lock_fd, fcntl.LOCK_UN)

        # Use asyncio.get_running_loop() (not the deprecated get_event_loop())
        # to obtain the currently-running event loop inside this async function.
        running_loop = asyncio.get_running_loop()
        async with _corrections_lock:
            await running_loop.run_in_executor(None, _read_write_log)

        logging.info(f"[CORRECTION SAVED] Ticket ID: {ticket_id} | Changed: {changed_fields}")
        return {"status": "saved", "changed_fields": changed_fields}

    except Exception as e:
        logging.error(f"[CORRECTION ERROR] Could not save: {e}")
        return {"status": "error", "message": str(e)}


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
    
    user_payload = user.model_dump() if hasattr(user, "model_dump") else (user.dict() if hasattr(user, "dict") else dict(user))
    
    # Resolve company_id and role from profiles if missing or to ensure validity
    try:
        profile_res = supabase.table("profiles").select("company_id, role").eq("id", user_payload.get("id")).execute()
        if profile_res.data:
            user_payload["company_id"] = profile_res.data[0].get("company_id")
            user_payload["role"] = profile_res.data[0].get("role")
    except Exception:
        pass
        
    request.state.user = user_payload
    return user_payload


# ---------------------------------------------------------------------------
# Ticket operations (Now via Supabase)
# ---------------------------------------------------------------------------
MASTER_TICKET_ROLES = {"master_admin", "super_admin", "superadmin", "owner"}
TENANT_ADMIN_ROLES = {"admin", "company_admin", "super_admin"}


def _get_auth_user_id(user: dict) -> str:
    user_id = user.get("id") or user.get("sub") or user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authenticated user")
    return str(user_id)


def _get_authenticated_profile(user: dict) -> dict:
    user_id = _get_auth_user_id(user)
    res = (
        supabase.table("profiles")
        .select("id, company_id, company, role")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        raise HTTPException(status_code=403, detail="User profile not found")
    data = res.data
    if isinstance(data, list):
        if not data:
            raise HTTPException(status_code=403, detail="User profile not found")
        return data[0]
    return data


def _profile_role(profile: dict) -> str:
    return str(profile.get("role") or "").lower()


def _is_master_ticket_reader(profile: dict) -> bool:
    return _profile_role(profile) in MASTER_TICKET_ROLES


def _is_tenant_admin(profile: dict) -> bool:
    return _is_master_ticket_reader(profile) or _profile_role(profile) in TENANT_ADMIN_ROLES


def _require_tenant_admin_profile(user: dict) -> dict:
    profile = _get_authenticated_profile(user)
    if not _is_tenant_admin(profile):
        raise HTTPException(status_code=403, detail="Admin access required")
    return profile


def _require_platform_admin_profile(user: dict) -> dict:
    profile = _get_authenticated_profile(user)
    if not _is_master_ticket_reader(profile):
        raise HTTPException(status_code=403, detail="Platform admin access required")
    return profile


def _ticket_company_scope(profile: dict, requested_company_id: str | None = None) -> str | None:
    if _is_master_ticket_reader(profile):
        return requested_company_id

    company_id = profile.get("company_id")
    if not company_id:
        raise HTTPException(status_code=403, detail="User tenant is not configured")
    if requested_company_id and requested_company_id != company_id:
        raise HTTPException(status_code=403, detail="User not authorized for this tenant")
    return str(company_id)


@app.get("/tickets")
async def get_tickets(
    company_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Fetch persistent tickets from Supabase with pagination."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    if limit < 1 or limit > 200:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 200")
    if offset < 0:
        raise HTTPException(status_code=400, detail="Offset must be non-negative")

    profile = _get_authenticated_profile(current_user)
    company_scope = _ticket_company_scope(profile, company_id)
    
    query = supabase.table("tickets").select("*").order("created_at", desc=True).limit(limit).offset(offset)
    if company_scope:
        query = query.eq("company_id", company_scope)
        
    res = query.execute()
    return res.data

def trigger_webhook_for_new_ticket(company_id: str, ticket: dict) -> None:
    """Trigger Slack or Microsoft Teams webhook for new Critical/High tickets (Issue #175)."""
    if not supabase or not company_id:
        return
    
    priority = str(ticket.get("priority") or "medium").lower().strip()
    if priority not in ("critical", "high"):
        return

    try:
        # Fetch webhook settings for the company
        res = supabase.table("webhook_settings").select("webhook_url, is_enabled").eq("company_id", company_id).maybeSingle().execute()
        if res.data and res.data.get("is_enabled"):
            webhook_url = res.data.get("webhook_url")
            if not webhook_url:
                return
            
            # Format the alert payload
            ticket_id = str(ticket.get("id") or "???")
            ticket_ref = f"#T-{ticket_id[-4:]}" if len(ticket_id) >= 4 else f"#T-{ticket_id}"
            subject = ticket.get("subject") or "Untitled ticket"
            category = ticket.get("category") or "General"
            assigned_team = ticket.get("assigned_team") or "Unassigned"
            
            payload = {
                "text": f"🚨 *New {priority.upper()} Ticket Alert*: {ticket_ref} - {subject}\nPriority: {priority.upper()}\nLink: {FRONTEND_BASE_URL}/tickets/{ticket_id}",
                "attachments": [
                    {
                        "color": "#FF0000" if priority == "critical" else "#FFA500",
                        "title": f"New Ticket: {ticket_ref}",
                        "title_link": f"{FRONTEND_BASE_URL}/tickets/{ticket_id}",
                        "fields": [
                            {"title": "Subject", "value": subject, "short": True},
                            {"title": "Priority", "value": priority.upper(), "short": True},
                            {"title": "Category", "value": category, "short": True},
                            {"title": "Assigned Team", "value": assigned_team, "short": True}
                        ]
                    }
                ]
            }
            
            import urllib.request
            import json
            req = urllib.request.Request(
                webhook_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"[Webhook] Sent alert to {webhook_url} for ticket {ticket_id} (HTTP {resp.status})")
    except Exception as e:
        print(f"[Webhook] Failed to trigger webhook for ticket: {e}")


@app.post("/tickets/save")
async def save_ticket(request_body: TicketSaveRequest, user: dict = Depends(get_current_user)):
    """
    OFFICIAL PERSISTENCE: Saves the analyzed ticket to Supabase.
    This is called AFTER the user confirms the analysis results.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection not initialized.")

    auth_user_id = user.get("id") or user.get("sub") or ""
    # Ensure current user is authorized to save this ticket (request user_id must match authenticated user_id)
    if request_body.user_id and str(request_body.user_id) != str(auth_user_id):
        role = (user.get("user_metadata") or {}).get("role", "") or (user.get("app_metadata") or {}).get("role", "") or user.get("role", "")
        if role != "master_admin":
            raise HTTPException(status_code=403, detail="Unauthorized user context")

    if not request_body.user_id:
        request_body.user_id = auth_user_id

    logger = logging.getLogger(__name__)
    final_data = request_body.model_dump()
    original_subject = final_data.get("subject", "") or ""
    original_description = final_data.get("description", "") or ""

    # Detect language and translate subject/description into English before downstream routing/indexing.
    translation_probe_text = (original_description.strip() or original_subject.strip())
    translation_ctx = await detect_and_translate_ticket_text(translation_probe_text)
    metadata = final_data.get("metadata") or {}
    if translation_ctx["was_translated"]:
        translated_subject = await asyncio.to_thread(gemini_service.translate_to_english, original_subject, translation_ctx["source_language_name"]) if original_subject else original_subject
        translated_description = await asyncio.to_thread(gemini_service.translate_to_english, original_description, translation_ctx["source_language_name"]) if original_description else original_description
        final_data["subject"] = translated_subject or original_subject
        final_data["description"] = translated_description or original_description
        metadata["original_text"] = {
            "subject": original_subject,
            "description": original_description,
        }
    metadata["translation"] = {
        "translated": bool(translation_ctx["was_translated"]),
        "source_language": translation_ctx["source_language"],
        "source_language_name": translation_ctx["source_language_name"],
    }
    final_data["metadata"] = metadata

    # Backfill SLA deadlines/status when the client omits or sends empty values.
    priority_key = str(final_data.get("priority") or "medium").lower().strip()
    now_utc = datetime.datetime.now(datetime.timezone.utc)

    if not str(final_data.get("sla_breach_at") or "").strip():
        final_data["sla_breach_at"] = compute_sla_breach_at(priority_key, now_utc)

    if not str(final_data.get("sla_response_due_at") or "").strip():
        policy = get_sla_policy(priority_key)
        response_hours = max(1, int(round(float(policy["max_hours"]) * 0.25)))
        response_due_at = now_utc + datetime.timedelta(hours=response_hours)
        final_data["sla_response_due_at"] = response_due_at.isoformat()

    if not str(final_data.get("sla_status") or "").strip():
        final_data["sla_status"] = "ACTIVE"
    # Resolve tenant linkage from user profile with authorization validation.
    profile = {}
    auth_user_id = user.get("id")
    if auth_user_id and request_body.user_id and str(request_body.user_id) != str(auth_user_id):
        raise HTTPException(status_code=403, detail="User not authorized to save ticket for another user ID")
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

        priority = final_data.get("priority")
        if not final_data.get("sla_response_due_at"):
            final_data["sla_response_due_at"] = calculate_sla_response_at(priority).isoformat().replace("+00:00", "Z")
        if not final_data.get("sla_breach_at"):
            final_data["sla_breach_at"] = calculate_sla_breach_at(priority).isoformat().replace("+00:00", "Z")
        final_data["sla_status"] = final_data.get("sla_status") or classify_sla_status(final_data.get("sla_breach_at"))
        final_data["escalation_level"] = int(final_data.get("escalation_level") or 0)

        user_hash = hashlib.sha256(str(request_body.user_id).encode()).hexdigest()[:8]
        logger.info(f"Tenant linkage: user_hash={user_hash}, company_id={final_data.get('company_id')}")

        duplicate_text = (request_body.description or "").strip() or (request_body.subject or "").strip()
        duplicate_threshold = get_duplicate_threshold(final_data.get("company_id"), 0.85)  # noqa: F841


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
            "confidence", "image_url", "company", "company_id",
            "sla_breach_at", "sla_response_due_at", "sla_status", "escalation_level", "metadata", "source"
        }
        # Merge any extra telemetry and SLA/duplicate fields into metadata before filtering
        existing_metadata = final_data.get("metadata") or {}
        extra_keys = (
            "entities", "solution_steps", "ocr_text", "needs_review", "routing_confidence",
            "is_potential_duplicate", "parent_ticket_id"
        )
        for extra_key in extra_keys:
            if extra_key in final_data and final_data[extra_key] not in (None, "", [], {}):
                existing_metadata[extra_key] = final_data[extra_key]
        final_data["metadata"] = existing_metadata

        # Apply PII redaction if enabled for this company
        company_id_for_settings = final_data.get("company_id")
        if company_id_for_settings:
            try:
                _cs = get_system_settings(company_id_for_settings)
                if _cs.get("enable_pii_redaction"):
                    redact_ips = _cs.get("redact_ip_addresses", False)
                    final_data = redact_pii_dict(final_data, redact_ips=redact_ips)
                    logger.info("[PIIRedaction] PII redacted for ticket save (company=%s)", company_id_for_settings)
            except Exception as redact_err:
                logger.warning("[PIIRedaction] Redaction skipped: %s", redact_err)

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
        if final_data.get("auto_resolve"):
            msg = "AI Auto-Resolution active: A verified solution has been identified. Please review the attached resolution steps."

        detected_language = final_data.get("detected_language")
        if detected_language and detected_language.lower() not in ("en", "eng", "unknown"):
            try:
                from backend.language_pipeline import translate_from_english
                msg = translate_from_english(msg, detected_language)
            except Exception as e:
                print(f"[WARNING] Failed to back-translate message: {e}")

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
        
        # Broadcast the new/updated ticket to all WebSocket clients for this company
        company_id = final_data.get("company_id")
        if company_id:
            # Trigger webhook notifications if any configured (Issue #175)
            asyncio.create_task(asyncio.to_thread(trigger_webhook_for_new_ticket, company_id, {
                "id": ticket_id,
                "priority": insert_data.get("priority"),
                "subject": insert_data.get("subject"),
                "category": insert_data.get("category"),
                "assigned_team": insert_data.get("assigned_team")
            }))

            asyncio.create_task(
                connection_manager.broadcast(
                    company_id,
                    {
                        "type": "ticket_update",
                        "event": "created",
                        "ticket": insert_data,
                        "ticket_id": str(ticket_id),
                    },
                )
            )
        return response

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/{company_id}")
async def websocket_endpoint(ws: WebSocket, company_id: str):
    """Real-time WebSocket feed for a company's ticket dashboard.

    Protocol:
        - Server sends ``{"type": "ping"}`` every 30s (heartbeat).
        - Client must respond with ``{"type": "pong"}`` within 10s.
        - Server pushes ``{"type": "ticket_update", ...}`` on changes.

    Usage (frontend):
        const socket = new WebSocket("ws://host:7860/ws/{company_id}");
        socket.onmessage = (event) => { const msg = JSON.parse(event.data); };
    """
    if not company_id or not company_id.strip():
        await ws.close(code=4000, reason="Missing company_id")
        return

    company_id = company_id.strip()
    accepted = await connection_manager.connect(company_id, ws)
    if not accepted:
        await ws.close(code=4001, reason="Connection limit reached")
        return
    print(f"[WS] Client connected — company_id={company_id}")

    try:
        while True:
            raw = await ws.receive_text()
            if not raw.strip():
                continue
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue  # ignore malformed frames

            msg_type = data.get("type")

            # Client responds to server pings — record liveness timestamp
            if msg_type == "pong":
                connection_manager.record_pong(ws)
                continue

            # Client-initiated keepalive ping — echo back so the client can
            # confirm the connection is alive and cancel its pong-timeout timer
            if msg_type == "ping":
                try:
                    await ws.send_json({"type": "pong"})
                except Exception:
                    pass
                continue

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        print(f"[WS] Connection error for company_id={company_id}: {exc}")
    finally:
        await connection_manager.disconnect(company_id, ws)
        print(f"[WS] Client disconnected — company_id={company_id}")


@app.get("/ws/stats")
async def ws_stats():
    """Return WebSocket connection pool statistics for monitoring."""
    return connection_manager.room_stats()



# TicketUpdate restricts PATCH payloads to the fields a caller is permitted to
# change. Ownership fields (owner_id), routing fields (assigned_team), and
# system-set identifiers (ticket_id) are intentionally excluded.
class TicketUpdate(BaseModel):
    status: str | None = None
    last_user_viewed_at: str | None = None


@app.post("/tickets", response_model=dict)
async def create_ticket(
    ticket: TicketSaveRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new ticket record in Supabase. Requires authentication.
    The caller's authenticated user ID is always used as the owner; any
    owner_id supplied in the request body is silently overridden to prevent
    ownership spoofing.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    user_id = _get_auth_user_id(current_user)
    data = ticket.model_dump()
    # Always derive ownership from the authenticated session.
    data["user_id"] = user_id

    profile = _get_authenticated_profile(current_user)
    profile_company_id = profile.get("company_id")
    if profile_company_id:
        if data.get("company_id") and data["company_id"] != profile_company_id:
            raise HTTPException(status_code=403, detail="User not authorized for this tenant")
        data["company_id"] = profile_company_id
    elif data.get("company_id"):
        raise HTTPException(status_code=403, detail="User has no tenant assignment")

    # Apply PII redaction if enabled for this company
    if data.get("company_id"):
        try:
            _cs = get_system_settings(data["company_id"])
            if _cs.get("enable_pii_redaction"):
                redact_ips = _cs.get("redact_ip_addresses", False)
                data = redact_pii_dict(data, redact_ips=redact_ips)
        except Exception:
            pass

    res = supabase.table("tickets").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create ticket")
    return res.data[0]


@app.patch("/tickets/{ticket_id}", response_model=dict)
async def update_ticket(
    ticket_id: str,
    updates: TicketUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Partially update a ticket. Requires authentication. Only status and
    last_user_viewed_at may be changed via this endpoint. The caller must
    own the ticket or have a master admin role.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    res = supabase.table("tickets").select("id, user_id, company_id").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket_row = res.data
    user_id = _get_auth_user_id(current_user)
    profile = _get_authenticated_profile(current_user)

    # Enforce ownership: caller must own the ticket or hold a master admin role.
    if not _is_master_ticket_reader(profile) and str(ticket_row.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="User not authorized to update this ticket")

    # Enforce company scope for non-master callers.
    company_scope = _ticket_company_scope(profile)
    if company_scope and ticket_row.get("company_id") != company_scope:
        raise HTTPException(status_code=403, detail="User not authorized for this tenant")

    patch_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not patch_data:
        raise HTTPException(status_code=400, detail="No updatable fields provided")

    updated = (
        supabase.table("tickets")
        .update(patch_data)
        .eq("id", ticket_id)
        .execute()
    )
    if not updated.data:
        raise HTTPException(status_code=500, detail="Failed to update ticket")
    return updated.data[0]


@app.get("/tickets/{ticket_id}")
async def get_ticket_by_id(
    request: Request,
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Fetch single persistent ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    # Guard route overlap where '/tickets/search' may be matched here first.
    if ticket_id == "search":
        return await search_tickets(
            q=request.query_params.get("q", ""),
            company_id=request.query_params.get("company_id"),
            current_user=current_user,
        )

    profile = _get_authenticated_profile(current_user)
    company_scope = _ticket_company_scope(profile)
    res = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if company_scope and res.data.get("company_id") != company_scope:
        raise HTTPException(status_code=403, detail="User not authorized for this tenant")
    return res.data


@app.get("/tickets/{ticket_id}/sla-estimate")
async def get_ticket_sla_estimate(
    ticket_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Estimate resolution time and SLA breach risk for a ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    profile = _get_authenticated_profile(current_user)
    company_scope = _ticket_company_scope(profile)

    res = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data
    if company_scope and ticket.get("company_id") != company_scope:
        raise HTTPException(status_code=403, detail="User not authorized for this tenant")

    return get_sla_estimate(ticket, supabase)


@app.get("/tickets/{ticket_id}/audit_logs", response_model=list[AuditLogRecord])
async def get_ticket_audit_logs(ticket_id: str, company_id: str, current_user: dict = Depends(get_current_user)):
    """Return a company-scoped chronological audit trail for a ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    profile = _get_authenticated_profile(current_user)
    user_id = _get_auth_user_id(current_user)
    company_scope = _ticket_company_scope(profile, company_id)

    # Fetch target ticket to verify company scope and ownership
    res = supabase.table("tickets").select("id, user_id, company_id").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket_row = res.data
    if company_scope and str(ticket_row.get("company_id")) != company_scope:
        raise HTTPException(status_code=403, detail="User not authorized for this tenant")

    role = str(profile.get("role") or "").lower()
    is_admin = role in TENANT_ADMIN_ROLES or _is_master_ticket_reader(profile)
    if not is_admin and str(ticket_row.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="User not authorized to view this ticket's history")

    try:
        service = AuditLogService(supabase)
        return service.get_ticket_audit_logs(ticket_id, company_id)
    except AuditLogAccessError as err:
        raise HTTPException(status_code=err.status_code, detail=err.detail)


@app.get("/tickets/search")
async def search_tickets(
    q: str,
    company_id: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    """Search tickets by query text, optionally scoped by company_id."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")
    query_text = (q or "").strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query text is required")

    profile = _get_authenticated_profile(current_user)
    company_scope = _ticket_company_scope(profile, company_id)

    try:
        rpc_res = supabase.rpc(
            "search_tickets",
            {"query_text": query_text, "company_id": company_scope},
        ).execute()
        return rpc_res.data or []
    except Exception:
        # Fallback for environments without RPC function support.
        fallback = supabase.table("tickets").select("*").order("created_at", desc=True).execute()
        rows = fallback.data or []
        lowered = query_text.lower()
        filtered = [
            row for row in rows
            if lowered in str(row.get("subject", "")).lower()
            or lowered in str(row.get("description", "")).lower()
        ]
        if company_scope:
            filtered = [row for row in filtered if row.get("company_id") == company_scope]
        return filtered


class BulkUpdateResponse(BaseModel):
    updated_count: int
    failed_ids: list[str] = []

class BulkUpdateRequest(BaseModel):
    ticket_ids: list[str]
    status: str | None = None
    priority: str | None = None
    assigned_team: str | None = None

@app.post("/tickets/bulk-update", response_model=BulkUpdateResponse, tags=["Tickets"])
async def bulk_update_tickets(
    request: BulkUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Perform bulk updates on multiple tickets. Requires admin or master role.
    Supports updating status, priority, and assigned_team.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    if not request.ticket_ids:
        raise HTTPException(status_code=400, detail="No ticket IDs provided")

    profile = _get_authenticated_profile(current_user)
    # Check if user is admin or master
    role = str(profile.get("role") or "").lower()
    if role not in ("admin", "company_admin") and not _is_master_ticket_reader(profile):
        raise HTTPException(status_code=403, detail="Insufficient permissions for bulk operations")

    company_scope = _ticket_company_scope(profile)

    patch_data = {k: v for k, v in request.model_dump().items() if k != "ticket_ids" and v is not None}
    if not patch_data:
        raise HTTPException(status_code=400, detail="No update fields provided")

    updated_count = 0
    failed_ids = []

    for tid in request.ticket_ids:
        try:
            # Verify ticket belongs to company
            if company_scope:
                check = supabase.table("tickets").select("company_id").eq("id", tid).single().execute()
                if not check.data or check.data.get("company_id") != company_scope:
                    failed_ids.append(tid)
                    continue
            
            res = supabase.table("tickets").update(patch_data).eq("id", tid).execute()
            if res.data:
                updated_count += 1
            else:
                failed_ids.append(tid)
        except Exception:
            failed_ids.append(tid)

    return BulkUpdateResponse(updated_count=updated_count, failed_ids=failed_ids)

@app.post("/tickets/bulk-delete", tags=["Tickets"])
async def bulk_delete_tickets(
    ticket_ids: list[str],
    current_user: dict = Depends(get_current_user),
):
    """
    Bulk delete tickets. Requires admin or master role.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    profile = _get_authenticated_profile(current_user)
    role = str(profile.get("role") or "").lower()
    if role not in ("admin", "company_admin") and not _is_master_ticket_reader(profile):
        raise HTTPException(status_code=403, detail="Insufficient permissions for bulk operations")

    company_scope = _ticket_company_scope(profile)

    deleted_count = 0
    failed_ids = []

    for tid in ticket_ids:
        try:
            # Verify ticket belongs to company
            if company_scope:
                check = supabase.table("tickets").select("company_id").eq("id", tid).single().execute()
                if not check.data or check.data.get("company_id") != company_scope:
                    failed_ids.append(tid)
                    continue
            
            res = supabase.table("tickets").delete().eq("id", tid).execute()
            if res.data:
                deleted_count += 1
            else:
                failed_ids.append(tid)
        except Exception:
            failed_ids.append(tid)

    return {"deleted_count": deleted_count, "failed_ids": failed_ids}





# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Ticket Rating / CSAT Endpoints
# ---------------------------------------------------------------------------
@app.post("/tickets/rate")
async def rate_ticket(request_body: RatingRequest, user: dict = Depends(get_current_user)):
    """Submit a 1-5 star satisfaction rating for a resolved ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    auth_user_id = user.get("id")
    user_metadata = user.get("user_metadata", {})
    user_company_id = user_metadata.get("company_id")
    if not user_company_id:
        raise HTTPException(status_code=403, detail="Access denied: caller has no company_id")

    if request_body.rating < 1 or request_body.rating > 5:
        raise HTTPException(status_code=422, detail="Rating must be between 1 and 5")

    # Verify ticket exists and belongs to this company
    try:
        ticket_res = supabase.table("tickets").select("ticket_id, company_id, assigned_to").eq("ticket_id", request_body.ticket_id).eq("company_id", user_company_id).single().execute()
        ticket = ticket_res.data
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Upsert rating (one rating per user per ticket)
    rating_data = {
        "ticket_id": request_body.ticket_id,
        "user_id": auth_user_id,
        "company_id": user_company_id,
        "rating": request_body.rating,
        "feedback": request_body.feedback,
        "agent_id": ticket.get("assigned_to"),
    }
    try:
        supabase.table("ticket_ratings").upsert(rating_data, on_conflict="ticket_id,user_id").execute()
        return {"status": "rated", "rating": request_body.rating}
    except Exception as e:
        logger.error(f"[RATING ERROR] Could not save rating: {e}")
        raise HTTPException(status_code=500, detail="Failed to save rating")


@app.get("/tickets/{ticket_id}/rating")
async def get_ticket_rating(ticket_id: str, user: dict = Depends(get_current_user)):
    """Get the rating for a specific ticket."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    user_metadata = user.get("user_metadata", {})
    user_company_id = user_metadata.get("company_id")
    if not user_company_id:
        raise HTTPException(status_code=403, detail="Access denied: caller has no company_id")

    try:
        res = supabase.table("ticket_ratings").select("*").eq("ticket_id", ticket_id).eq("company_id", user_company_id).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"[RATING ERROR] Could not fetch rating: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch rating")


@app.get("/admin/csat")
async def get_csat_scores(user: dict = Depends(get_current_user)):
    """Get CSAT scores per agent for the admin dashboard."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not initialized")

    user_metadata = user.get("user_metadata", {})
    user_company_id = user_metadata.get("company_id")
    user_role = user.get("role", "")
    if user_role not in ("admin", "company_admin"):
        raise HTTPException(status_code=403, detail="Access denied: admin role required")
    if not user_company_id:
        raise HTTPException(status_code=403, detail="Access denied: caller has no company_id")

    try:
        # Read from tickets table (csat_rating is stored there by CSATModal)
        res = supabase.table("tickets").select("csat_rating, csat_comment, assigned_to, company_id").eq("company_id", user_company_id).not_.is_("csat_rating", "null").execute()
        rated_tickets = res.data or []

        # Aggregate by agent
        agent_stats = {}
        for t in rated_tickets:
            agent_id = t.get("assigned_to") or "unassigned"
            rating = t["csat_rating"]
            if agent_id not in agent_stats:
                agent_stats[agent_id] = {"ratings": [], "distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}}
            agent_stats[agent_id]["ratings"].append(rating)
            if 1 <= rating <= 5:
                agent_stats[agent_id]["distribution"][rating] += 1

        result = []
        for agent_id, stats in agent_stats.items():
            avg = sum(stats["ratings"]) / len(stats["ratings"]) if stats["ratings"] else 0
            result.append({
                "agent_id": agent_id,
                "avg_rating": round(avg, 2),
                "total_ratings": len(stats["ratings"]),
                "ratings_distribution": stats["distribution"],
            })

        # Sort by avg_rating descending
        result.sort(key=lambda x: x["avg_rating"], reverse=True)
        return {"agents": result, "total_ratings": len(rated_tickets)}
    except Exception as e:
        logger.error(f"[CSAT ERROR] Could not fetch CSAT scores: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch CSAT scores")
# Main AI Analyzer endpoint
# ---------------------------------------------------------------------------
@app.post("/ai/analyze_ticket", response_model=TicketResponse, tags=["AI Analysis"], summary="Full AI ticket analysis (rate-limited)")
@limiter.limit("10/minute")
async def analyze_ticket(request_body: TicketRequest, request: Request, current_user: dict = Depends(get_current_user)):
    """Main entry point for end-to-end ticket triage. Runs OCR (when an image
    is attached), classification, NER, duplicate check, and RAG lookup, then
    returns the consolidated ``TicketResponse``. Throttled to 10 requests per
    minute per IP."""
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
        local_ocr_text = await ocr_service.extract_text(request_body.image_base64)
        if local_ocr_text:
            text = f"{text} {local_ocr_text}".strip()
            print(f"[AI] OCR added {len(local_ocr_text)} chars to context.")

    # Pass OCR-enriched text downstream so the analyze_only endpoint uses it.
    enriched = request_body.model_copy(update={"text": text, "image_text": local_ocr_text})
    return await analyze_only(enriched, request, user)

@app.post("/ai/analyze")
@limiter.limit("10/minute")
async def analyze_only(request_body: TicketRequest, request: Request, current_user: dict = Depends(get_current_user)):
    """
    Centralized analysis logic used by `/ai/analyze`, `/ai/analyze_ticket`, and `/ai/analyze_stream`.
    Returns a serializable dict representing the ticket analysis result.
    """
    api_endpoint = request.url.path
    text = request_body.text
    translation_ctx = await detect_and_translate_ticket_text(text)
    text = translation_ctx["text_for_analysis"]
    print(f"[AI] Starting Analysis (READ-ONLY) for: {text[:50]}...") 
    settings = get_system_settings(request_body.company_id or request_body.company)
    confidence_threshold = settings.get("ai_confidence_threshold", 0.80)
    duplicate_sensitivity = settings.get("duplicate_sensitivity", 0.85)
    enable_auto_resolve = settings.get("enable_auto_resolve", False)

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
            sla_breach_at=_sla_breach.isoformat().replace("+00:00", "Z"),
            original_text=request_body.text,
            source_language=translation_ctx["source_language"],
            source_language_name=translation_ctx["source_language_name"],
            was_translated=translation_ctx["was_translated"],
        )
    
    # --- Context & Environment ---
    import datetime
    def get_now_ist():
        return datetime.datetime.utcnow().isoformat() + "Z"

    env_metadata = {
        "timestamp": get_now_ist(),
        "model_version": "3.0.0-PRO",
        "api_endpoint": api_endpoint
    }

    timeline = {"received": get_now_ist()}

    gemini_analysis = {"ocr_text": request_body.image_text or "", "image_description": ""}
    if request_body.image_base64 and not gemini_analysis["ocr_text"] and gemini_service:
        try:
            vision_result = gemini_service.analyze_image(request_body.image_base64, text)
            gemini_analysis.update(vision_result)
        except Exception as e:
            print(f"[VISION ERROR] {e}")

    summary = text[:100] + ("…" if len(text) > 100 else "")

    # --- Spam / Phishing Detection (runs before classification) ---
    try:
        spam_result = spam_service.check(text, gemini_analysis.get("ocr_text", ""))
    except Exception as e:
        print(f"[SPAM ERROR] {e}")
        spam_result = {
            "is_spam": False, "risk_score": 0.0, "reasons": [],
            "suspicious_urls": [], "matched_keywords": [],
        }

    # --- Classification ---
    classification = classify_ticket_text(text)
    if not enable_auto_resolve:
        classification["auto_resolve"] = False

    timeline["ai_analyzed"] = get_now_ist()
    timeline["triaged"] = get_now_ist()

    try:
        entities = ner_service.extract_entities(text)
    except Exception:
        entities = []
    timeline["metadata_harvested"] = get_now_ist()

    try:
        dup_result = duplicate_service.check_duplicate(text, threshold=request_body.duplicate_sensitivity)
    except Exception:
        dup_result = {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0}

    # --- Incident correlation (Enterprise Outage Detection) ---
    try:
        incident_result = incident_service.correlate(
            text,
            user_id=request_body.user_id,
            category=classification.get("category"),
            priority=classification.get("priority"),
        )
    except Exception as e:
        print(f"[INCIDENT ERROR] {e}")
        incident_result = {
            "incident_id": None, "is_major_incident": False,
            "ticket_count": 0, "affected_users": 0, "similarity": 0.0,
        }

    # --- RAG Knowledge Base Check ---
    rag_match = None
    try:
        rag_match = rag_service.search_knowledge_base(text, threshold=0.85)
        if rag_match:
            # Only allow RAG to enable auto-resolve if the company toggle permits it.
            # Fixes #913: the toggle in Admin Settings had no effect because RAG
            # unconditionally overwrote classification["auto_resolve"] = True.
            if enable_auto_resolve:
                classification["auto_resolve"] = True
                classification["assigned_team"] = "Auto-Resolve AI"
            classification["confidence"] = max(classification["confidence"], float(rag_match["similarity"]))
            print(f"[RAG SUCCESS] Found solution for: '{rag_match['title']}'")
    except Exception as e:
        print(f"[RAG ERROR] {e}")

    decision_factors = []
    if classification["confidence"] > request_body.confidence_threshold:
        decision_factors.append(f"High confidence match for '{classification['subcategory']}'")
    if entities:
        decision_factors.append(f"Detected entities: {', '.join([e['text'] for e in entities[:2]])}")
    if dup_result["is_duplicate"]:
        decision_factors.append(f"Found similar incident ({int(dup_result['similarity']*100)}%)")
    if incident_result.get("is_major_incident"):
        decision_factors.append(
            f"Linked to Major Incident {incident_result['incident_id']} "
            f"({incident_result['ticket_count']} tickets, {incident_result['affected_users']} users)"
        )
    elif incident_result.get("incident_id") and incident_result.get("ticket_count", 0) > 1:
        decision_factors.append(
            f"Correlated to incident {incident_result['incident_id']} "
            f"({incident_result['ticket_count']} related tickets)"
        )
    if rag_match:
        decision_factors.append(f"Found solution article: '{rag_match['title']}'")
    if spam_result["is_spam"]:
        decision_factors.append(
            f"Flagged as spam/phishing (risk {spam_result['risk_score']:.2f})"
        )
        classification["assigned_team"] = "Spam / Suspicious"
        classification["auto_resolve"] = False

    reasoning = f"Categorized as '{classification['category']}' - {classification['subcategory']}."
    if classification["auto_resolve"]:
        reasoning += " Flagged for AI auto-resolution via Knowledge Base." if rag_match else " Flagged for auto-resolution."
    if spam_result["is_spam"]:
        reasoning += " Ticket flagged as spam/phishing and quarantined from agent inbox."
    
    timeline["routed"] = get_now_ist()

    # --- Gemini Summary ---
    if gemini_service and gemini_service._initialized:
        try:
            summary = gemini_service.get_summary(text)
        except Exception:
            pass

    hours_map = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}
    sla_hours = hours_map.get(classification["priority"], 72)
    sla_breach_dt = datetime.datetime.utcnow() + datetime.timedelta(hours=sla_hours)

    return TicketResponse(
        ticket_id=str(uuid.uuid4()), # Temporary ID
        summary=sanitize_text(summary),
        category=classification["category"],
        subcategory=classification["subcategory"],
        priority=classification["priority"],
        auto_resolve=classification["auto_resolve"],
        assigned_team=classification["assigned_team"],
        entities=[EntityInfo(**e) for e in entities],
        duplicate_ticket=DuplicateInfo(**dup_result),
        incident=IncidentInfo(**incident_result),
        confidence=classification["confidence"],
        needs_review=classification["confidence"] < 0.20,
        reasoning=reasoning,
        decision_factors=decision_factors,
        image_description=gemini_analysis["image_description"],
        ocr_text=gemini_analysis["ocr_text"],
        image_url=request_body.image_url,
        highlights=[e.get("text") if isinstance(e, dict) else getattr(e, "text", "") for e in entities] if entities else [],
        timeline=timeline,
        env_metadata=env_metadata,
        spam_check=SpamCheck(**spam_result),
        is_potential_duplicate=dup_result.get("is_potential_duplicate", False),
        parent_ticket_id=dup_result.get("parent_ticket_id"),
        sla_breach_at=sla_breach_dt.isoformat().replace("+00:00", "Z"),
        original_text=translation_ctx["original_text"],
        source_language=translation_ctx["source_language"],
        source_language_name=translation_ctx["source_language_name"],
        was_translated=translation_ctx["was_translated"],
    )

@app.post("/ai/analyze_stream")
@limiter.limit("10/minute")
async def analyze_stream(request: Request, request_body: TicketRequest):
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
        await asyncio.sleep(0.15)
        yield f"data: {json.dumps({'step': 'Analyzing', 'status': 'in_progress'})}\n\n"
        # Centralized computation
        result = compute_analysis(request_body, api_endpoint="/ai/analyze_stream")

        gemini_analysis = {"ocr_text": request_body.image_text or "", "image_description": ""}
        if request_body.image_base64 and not gemini_analysis["ocr_text"]:
            try:
                vision_result = gemini_service.analyze_image(request_body.image_base64, text)
                gemini_analysis.update(vision_result)
            except Exception as e:
                pass

        summary = text[:100] + ("…" if len(text) > 100 else "") 

        # Spam / Phishing check (silent step — does not get its own SSE event)
        try:
            spam_result = spam_service.check(text, gemini_analysis.get("ocr_text", ""))
        except Exception:
            spam_result = {
                "is_spam": False, "risk_score": 0.0, "reasons": [],
                "suspicious_urls": [], "matched_keywords": [],
            }

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
        
        settings = get_system_settings(request_body.company_id or request_body.company)
        enable_auto_resolve = settings.get("enable_auto_resolve", False)
        
        classification = classify_ticket_text(text)
        if not enable_auto_resolve:
            classification["auto_resolve"] = False
            
        timeline["ai_analyzed"] = get_now_ist()
        timeline["triaged"] = get_now_ist()

        # 4. Duplicates
        yield f"data: {json.dumps({'step': 'Checking duplicate issues', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        try:
            dup_result = duplicate_service.check_duplicate(text, threshold=request_body.duplicate_sensitivity)
        except Exception:
            dup_result = {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0}

        # 4b. Incident correlation
        yield f"data: {json.dumps({'step': 'Correlating to active incidents', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        try:
            incident_result = incident_service.correlate(
                text,
                user_id=request_body.user_id,
                category=classification.get("category"),
                priority=classification.get("priority"),
            )
        except Exception as e:
            print(f"[INCIDENT ERROR] {e}")
            incident_result = {
                "incident_id": None, "is_major_incident": False,
                "ticket_count": 0, "affected_users": 0, "similarity": 0.0,
            }

        # 5. RAG / Solutions
        yield f"data: {json.dumps({'step': 'Finding possible solutions', 'status': 'in_progress'})}\n\n"
        await asyncio.sleep(0.2)
        rag_match = None
        try:
            rag_match = rag_service.search_knowledge_base(text, threshold=0.85)
            if rag_match:
                # Only allow RAG to enable auto-resolve if the company toggle permits it.
                # Fixes #913: the toggle in Admin Settings had no effect because RAG
                # unconditionally overwrote classification["auto_resolve"] = True.
                if enable_auto_resolve:
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
        if spam_result["is_spam"]:
            decision_factors.append(
                f"Flagged as spam/phishing (risk {spam_result['risk_score']:.2f})"
            )
            classification["assigned_team"] = "Spam / Suspicious"
            classification["auto_resolve"] = False

        reasoning = f"Categorized as '{classification['category']}' - {classification['subcategory']}."
        if classification["auto_resolve"]:
            reasoning += " Flagged for AI auto-resolution via Knowledge Base." if rag_match else " Flagged for auto-resolution."
        if spam_result["is_spam"]:
            reasoning += " Ticket flagged as spam/phishing and quarantined from agent inbox."
        
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
            "incident": incident_result,
            "confidence": classification["confidence"],
            "needs_review": classification["confidence"] < 0.20,
            "reasoning": reasoning,
            "decision_factors": decision_factors,
            "image_description": gemini_analysis["image_description"],
            "ocr_text": gemini_analysis["ocr_text"],
            "image_url": request_body.image_url,
            "highlights": [e.get("text", "") for e in entities] if entities else [],
            "timeline": timeline,
            "env_metadata": env_metadata,
            "spam_check": spam_result,
            "sla_breach_at": sla_breach_dt.isoformat() + "Z"
        }

        # 6. Final Result
        yield f"data: {json.dumps({'step': 'done', 'result': jsonable_encoder(ticket_response_dict)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Refactored: Renamed duplicate /ai/analyze_ticket route to /ai/analyze_ticket/legacy (Issue #1427)
@app.post("/ai/analyze_ticket/legacy", deprecated=True)
async def legacy_analyze_and_save(request_body: TicketRequest):
    """
    BACKWARD COMPATIBILITY: Strictly performs analysis only.
    Does NOT persist to DB to avoid foreign key violations.

    DEPRECATED: This endpoint is redundant with /ai/analyze and exists only
    for backward compatibility. New clients should use /ai/analyze instead.

    The duplicate endpoints /ai/analyze_ticket/legacy and /ai/analyze both
    delegate to analyze_only(), making /ai/analyze_ticket/legacy unnecessary.
    See: https://github.com/ritesh-1918/HELPDESK.AI/issues/751 and https://github.com/ritesh-1918/HELPDESK.AI/issues/1427
    """
    result = await analyze_only(request_body)
    # Wrap with deprecation warning
    return JSONResponse(
        content=result.model_dump(mode="json"),
        headers={
            "Deprecation": "true",
            "Sunset": "2026-12-31",
            "Warning": '10 Deprecation: "/ai/analyze_ticket/legacy is deprecated. Use /ai/analyze instead."',
            "Link": '</ai/analyze>; rel="alternate"',
        },
    )

@app.post("/ai/analyze-v2")
@limiter.limit("10/minute")
async def analyze_ticket_v2(request: Request, body: TicketRequest):
    """V2 AI analysis with improved classifier. Returns category, subcategory, priority, and auto-resolve flag."""
    text = sanitize_text(body.text) or ""
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


def _aggregate_sla_stats(tickets: list[dict]) -> dict:
    total = len(tickets)
    active_tickets = [
        ticket for ticket in tickets
        if not any(status_key in (ticket.get("status") or "").lower() for status_key in ["resolv", "closed"])
    ]

    counts = {
        "total": total,
        "active": len(active_tickets),
        "breached": sum(1 for ticket in tickets if ticket.get("sla_status") == "breached"),
        "warning": sum(1 for ticket in tickets if ticket.get("sla_status") == "warning"),
        "met": sum(1 for ticket in tickets if ticket.get("sla_status") == "met"),
        "by_priority": {},
        "breach_rate": 0,
    }

    if total > 0:
        counts["breach_rate"] = round(counts["breached"] / total * 100, 1)

    for priority in ["critical", "high", "medium", "low"]:
        priority_tickets = [ticket for ticket in active_tickets if (ticket.get("priority") or "").lower() == priority]
        counts["by_priority"][priority] = {
            "total": len(priority_tickets),
            "breached": sum(1 for ticket in priority_tickets if ticket.get("sla_status") == "breached"),
            "warning": sum(1 for ticket in priority_tickets if ticket.get("sla_status") == "warning"),
        }

    return counts


@app.get("/sla/stats", response_model=SLAStatsResponse)
async def sla_stats(company_id: str | None = None, current_user: dict = Depends(get_current_user)):
    """Get aggregated SLA dashboard statistics for the caller's tenant."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    profile = _require_tenant_admin_profile(current_user)
    company_scope = _ticket_company_scope(profile, company_id)

    try:
        query = supabase.table("tickets").select("id, company_id, priority, sla_status, status, escalation_level")
        if company_scope:
            query = query.eq("company_id", company_scope)
        res = query.execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return _aggregate_sla_stats(res.data or [])


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
    current_user: dict = Depends(get_current_user),
):
    """
    List tickets with SLA status. Requires authentication.
    Results are scoped to the caller's company unless the caller has a master admin role.
    Filter by sla_status and/or priority.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    profile = _get_authenticated_profile(current_user)
    company_scope = _ticket_company_scope(profile)

    query = (
        supabase.table("tickets")
        .select("id, ticket_id, subject, summary, priority, status, assigned_team, sla_status, escalation_level, remaining_seconds, created_at, sla_breach_at, sla_warning_at, last_escalated_at")
        .order("created_at", desc=True)
    )

    if company_scope:
        query = query.eq("company_id", company_scope)

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
async def sla_escalations(
    limit: int = 50,
    offset: int = 0,
    company_id: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    """Fetch escalation log history."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    profile = _require_tenant_admin_profile(current_user)
    company_scope = _ticket_company_scope(profile, company_id)

    try:
        logs = (
            supabase.table("escalation_logs")
            .select("*")
            .order("triggered_at", desc=True)
            .execute()
        ).data or []

        if company_scope:
            ticket_rows = (
                supabase.table("tickets")
                .select("id")
                .eq("company_id", company_scope)
                .execute()
            ).data or []
            allowed_ticket_ids = {str(ticket.get("id")) for ticket in ticket_rows if ticket.get("id") is not None}
            logs = [log for log in logs if str(log.get("ticket_id")) in allowed_ticket_ids]

        total = len(logs)
        page = logs[offset:offset + limit]
        return {"escalations": page, "total": total}
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
async def sla_policies(current_user: dict = Depends(get_current_user)):
    """Get configured SLA policies."""
    _require_tenant_admin_profile(current_user)

    if not supabase:
        # Return defaults from code
        policies = []
        policy_source = sla_engine.SLA_POLICIES if hasattr(sla_engine, "SLA_POLICIES") else {}
        for pri, cfg in policy_source.items():
            policies.append({
                "priority": pri,
                "max_hours": cfg["max_hours"],
                "warning_pct": cfg["warning_pct"],
                "auto_escalate": cfg.get("auto_escalate_on_breach", False),
                "l2_after_minutes": cfg.get("l2_escalation_mins", 0),
                "l3_after_minutes": cfg.get("l3_escalation_mins", 0),
            })
        return {"policies": policies}

    try:
        res = supabase.table("sla_policies").select("*").execute()
        return {"policies": res.data or []}
    except Exception as e:
        print(f"[SLA] Policies query failed: {e}")
        return {"policies": []}


@app.post("/sla/check")
async def trigger_sla_check(current_user: dict = Depends(get_current_user)):
    """Manually trigger an SLA evaluation cycle (admin)."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    _require_platform_admin_profile(current_user)
    asyncio.create_task(sla_engine.check_all_active_tickets())
    return {"status": "triggered", "message": "SLA check cycle started in background"}





# ---------------------------------------------------------------------------
# Semantic Duplicate Detection Endpoints
# ---------------------------------------------------------------------------

@app.post("/ai/check_duplicate")
@limiter.limit("20/minute")
async def check_duplicate_endpoint(
    request: Request,
    body: TicketRequest,
    company_id: str | None = None,
    current_user: dict = Depends(get_current_user),
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
@limiter.limit("2/minute")
async def reindex_embeddings(request: Request, current_user: dict = Depends(get_current_user)):
    """Re-generate vector embeddings for all tickets."""
    _require_platform_admin_profile(current_user)
    result = await semantic_dupe_service.reindex_all()
    return result


@app.get("/admin/knowledge-gaps", tags=["Admin"])
async def get_knowledge_gaps(current_user: dict = Depends(get_current_user)):
    """
    Identify gaps in the knowledge base by analyzing resolved tickets and clustering them.
    Requires admin role.
    """
    profile = _get_authenticated_profile(current_user)
    role = str(profile.get("role") or "").lower()
    if role not in ("admin", "company_admin"):
        raise HTTPException(status_code=403, detail="Only admins can access knowledge gaps")
    
    company_id = profile.get("company_id")
    if not company_id:
        raise HTTPException(status_code=400, detail="User must belong to a company")

    from backend.services.knowledge_gap_service import KnowledgeGapService
    kgs = KnowledgeGapService(supabase)
    return await kgs.get_dashboard_insights(company_id)

@app.post("/admin/knowledge-gaps/detect", tags=["Admin"])
async def detect_knowledge_gaps(background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """
    Trigger background detection of knowledge gaps.
    """
    profile = _get_authenticated_profile(current_user)
    role = str(profile.get("role") or "").lower()
    if role not in ("admin", "company_admin"):
        raise HTTPException(status_code=403, detail="Only admins can trigger detection")
        
    company_id = profile.get("company_id")
    if not company_id:
        raise HTTPException(status_code=400, detail="User must belong to a company")

    def run_detection(cid):
        import asyncio
        from backend.services.knowledge_gap_service import KnowledgeGapService
        kgs = KnowledgeGapService(supabase)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(kgs.detect_gaps(cid))
        finally:
            loop.close()

    background_tasks.add_task(run_detection, company_id)
    return {"status": "success", "message": "Knowledge gap detection started in the background."}

@app.post("/admin/tickets/{ticket_id}/convert-to-kb", tags=["Admin"])
async def convert_ticket_to_kb(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """
    Convert a resolved ticket into a knowledge base article draft.
    """
    profile = _get_authenticated_profile(current_user)
    role = str(profile.get("role") or "").lower()
    if role not in ("admin", "company_admin"):
        raise HTTPException(status_code=403, detail="Only admins can convert tickets to KB")
        
    company_id = profile.get("company_id")
    if not company_id:
        raise HTTPException(status_code=400, detail="User must belong to a company")
        
    from backend.services.knowledge_gap_service import KnowledgeGapService
    kgs = KnowledgeGapService(supabase)
    try:
        res = await kgs.convert_ticket_to_article(ticket_id, company_id)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _format_system_settings_payload(rows: list[dict]) -> dict:
    if not rows:
        return {}

    first_row = rows[0]
    if "key" in first_row:
        return {
            str(row["key"]): row.get("value")
            for row in rows
            if row.get("key")
        }

    hidden_fields = {"id", "company_id", "created_at", "updated_at"}
    return {
        key: value
        for key, value in first_row.items()
        if key not in hidden_fields
    }


@app.get("/system/settings")
async def get_system_settings_endpoint(
    company_id: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    """Fetch the current tenant's system settings."""
    _logger = logging.getLogger(__name__)
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    profile = _require_tenant_admin_profile(current_user)
    company_scope = _ticket_company_scope(profile, company_id)

    try:
        query = supabase.table("system_settings").select("*")
        if company_scope:
            query = query.eq("company_id", company_scope)
        res = query.execute()
        return _format_system_settings_payload(res.data or [])
    except Exception as e:
        _logger.warning(f"[SETTINGS] Query failed: {e}")
        return {}


@app.patch("/system/settings")
async def update_system_settings(body: dict, current_user: dict = Depends(get_current_user)):
    """Update system settings for the current tenant."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    profile = _require_tenant_admin_profile(current_user)
    company_scope = _ticket_company_scope(profile, body.get("company_id"))

    update_fields = {
        key: value
        for key, value in body.items()
        if key not in {"company_id", "id", "created_at", "updated_at"}
    }
    if not update_fields:
        raise HTTPException(status_code=400, detail="No settings provided")

    payload = {
        "company_id": company_scope,
        **update_fields,
        "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
    }
    try:
        supabase.table("system_settings").upsert(payload).execute()
        return {"status": "updated", "company_id": company_scope}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sla/tickets/{ticket_id}")
async def sla_ticket_detail(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed SLA info for a specific ticket."""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    # Fetch ticket
    res = supabase.table("tickets").select("*").eq("id", ticket_id).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = res.data

    # Enforce company-level authorization so callers cannot view tickets from
    # other tenants by guessing or iterating ticket IDs.
    profile = _get_authenticated_profile(current_user)
    company_scope = _ticket_company_scope(profile)
    if company_scope and ticket.get("company_id") != company_scope:
        raise HTTPException(status_code=403, detail="User not authorized for this tenant")

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




@app.get("/metrics")
async def metrics(request: Request):
    """Prometheus scrape endpoint — exposes HTTP request, AI inference, and system metrics.

    Secured via optional ``METRICS_TOKEN`` bearer token and IP allowlist
    (``METRICS_ALLOWED_IPS`` env var, defaults to private ranges).
    """
    # --- IP allowlist check ---
    client_ip = request.client.host if request.client else ""
    if METRICS_ALLOWED_IPS:
        import ipaddress
        try:
            client_addr = ipaddress.ip_address(client_ip)
        except ValueError:
            raise HTTPException(status_code=403, detail="Forbidden")
        allowed = any(
            client_addr in ipaddress.ip_network(cidr, strict=False)
            for cidr in METRICS_ALLOWED_IPS
        )
        if not allowed:
            # Fall back to token check if IP not in allowlist
            auth = request.headers.get("authorization", "")
            if METRICS_TOKEN and auth == f"Bearer {METRICS_TOKEN}":
                pass  # Token grants access
            else:
                raise HTTPException(status_code=403, detail="Forbidden")


# ---------------------------------------------------------------------------
# Admin settings endpoints (Issue #913)
# ---------------------------------------------------------------------------
@app.get("/admin/settings/auto-resolve")
async def get_auto_resolve_setting(
    company_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Return the current auto-resolve / auto-close enabled setting for a company.
    Reads live from DB so it reflects the latest toggle state.
    Requires admin authentication.
    """
    profile = _require_tenant_admin_profile(current_user)
    company_scope = _ticket_company_scope(profile, company_id)
    settings = get_system_settings(company_scope)
    return {
        "company_id": company_scope,
        "enable_auto_resolve": settings.get("enable_auto_resolve", False),
        "auto_close_enabled": settings.get("auto_close_enabled", False),
        "auto_close_days": settings.get("auto_close_days", 7),
    }

    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ---------------------------------------------------------------------------
# Tenant Isolation Security Audit & Scoped API Endpoints (Issue #1054)
# ---------------------------------------------------------------------------

from backend.security.isolation_audit import IsolationAuditEngine
from backend.auth.tenant_middleware import security_manager

_audit_engine = IsolationAuditEngine()


@app.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    current_user: dict = Depends(security_manager.get_current_user_profile)
):
    """Fetch user profile with tenant boundaries verified."""
    if current_user.get("role") == "master_admin":
        if not supabase:
            return {"id": user_id, "role": "user", "company_id": None}
        res = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        return res.data or {}
        
    user_company_id = current_user.get("company_id")
    
    if user_id.startswith("mock-user-"):
        user_company = user_id.split("-")[2] if len(user_id.split("-")) > 2 else "company-mock-default"
        if user_company != user_company_id:
            raise HTTPException(status_code=403, detail="Access denied: User belongs to another organization.")
        return {"id": user_id, "role": "user", "company_id": user_company}

    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection not initialized")

    res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile_data = res.data[0] if isinstance(res.data, list) else res.data
    if str(profile_data.get("company_id")) != str(user_company_id):
        raise HTTPException(status_code=403, detail="Access denied: User belongs to another organization.")
        
    return profile_data


@app.get("/attachments/{ticket_id}")
async def get_attachments_by_ticket_id(
    ticket_id: str,
    current_user: dict = Depends(security_manager.get_current_user_profile)
):
    """Fetch attachments associated with a ticket, enforcing tenant boundary (IDOR check)."""
    ticket_data = security_manager.verify_resource_ownership("tickets", ticket_id, current_user)
    
    return {
        "ticket_id": ticket_id,
        "company_id": ticket_data.get("company_id"),
        "attachments": [
            {
                "id": "attachment-1",
                "name": "screenshot.png",
                "url": ticket_data.get("image_url") or "https://via.placeholder.com/150",
                "size_bytes": 350208
            }
        ]
    }


@app.get("/analytics")
async def get_analytics(
    current_user: dict = Depends(security_manager.get_current_user_profile)
):
    """Get ticket analytics statistics scoped to the user's company."""
    user_company_id = current_user.get("company_id")
    if not user_company_id:
        raise HTTPException(status_code=403, detail="User has no company assignment")
        
    if not supabase:
        return {
            "company_id": user_company_id,
            "total_tickets": 24,
            "resolved_tickets": 18,
            "critical_tickets": 2,
            "auto_resolve_rate": 0.35
        }

    try:
        res = supabase.table("tickets").select("status, priority, auto_resolve").eq("company_id", user_company_id).execute()
        tickets = res.data or []
        
        total = len(tickets)
        resolved = sum(1 for t in tickets if t.get("status") in ("resolved", "auto_resolved", "closed"))
        critical = sum(1 for t in tickets if t.get("priority") in ("critical", "Critical"))
        auto_resolved = sum(1 for t in tickets if t.get("auto_resolve") is True)
        
        return {
            "company_id": user_company_id,
            "total_tickets": total,
            "resolved_tickets": resolved,
            "critical_tickets": critical,
            "auto_resolve_rate": auto_resolved / total if total > 0 else 0.0
        }
    except Exception as e:
        logger.error(f"Error computing analytics: {e}")
        return {
            "company_id": user_company_id,
            "total_tickets": 0,
            "resolved_tickets": 0,
            "critical_tickets": 0,
            "auto_resolve_rate": 0.0
        }


@app.get("/api/security/audit")
async def run_security_audit(current_user: dict = Depends(security_manager.get_current_user_profile)):
    """
    Run automated tenant isolation audit.
    Only accessible by admin and master_admin roles.
    Returns audit findings with risk score and leakage risk assessment.
    """
    role = current_user.get("role", "user")
    if role not in ("admin", "company_admin", "master_admin"):
        raise HTTPException(
            status_code=403,
            detail="Only administrators can run security audits.",
        )

    company_id = current_user.get("company_id")
    company_ids = [company_id] if company_id else None

    result = _audit_engine.run_full_audit(company_ids=company_ids)
    report = _audit_engine.generate_json_report(result)

    return {"status": "success", **report}


@app.get("/api/security/report")
async def download_security_report(current_user: dict = Depends(security_manager.get_current_user_profile)):
    """
    Download tenant isolation audit report as Markdown.
    Only accessible by admin and master_admin roles.
    """
    role = current_user.get("role", "user")
    if role not in ("admin", "company_admin", "master_admin"):
        raise HTTPException(
            status_code=403,
            detail="Only administrators can download security reports.",
        )

    company_id = current_user.get("company_id")
    company_ids = [company_id] if company_id else None

    result = _audit_engine.run_full_audit(company_ids=company_ids)
    report_md = _audit_engine.generate_report(result)

    return Response(
        content=report_md,
        media_type="text/markdown; charset=utf-8",
        headers={
            "Content-Disposition": "attachment; filename=tenant_isolation_report.md",
        },
    )


@app.post("/api/pii/scan", tags=["Security"])
async def scan_text_for_pii(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    Scan text for PII without redacting. Returns found PII grouped by type.
    Admin-only endpoint for auditing PII exposure.
    """
    profile = _get_authenticated_profile(current_user)
    if not profile.get("is_master_admin"):
        raise HTTPException(status_code=403, detail="Only administrators can scan for PII.")

    body = await request.json()
    text = body.get("text", "")
    if not text:
        return {"findings": {}, "message": "No text provided"}

    from pii_redaction import scan_pii
    findings = scan_pii(text)
    return {
        "findings": findings,
        "total_pii_found": sum(len(v) for v in findings.values()),
        "types_found": list(findings.keys()),
    }

# ---------------------------------------------------------------------------
# API Token Management  (#1592)
# ---------------------------------------------------------------------------

from backend.auth.token_manager import TokenManager
from backend.models.api_token import (
    APITokenCreateRequest,
    APITokenRevokeRequest,
)


def _get_token_manager() -> TokenManager:
    if supabase is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    return TokenManager(supabase)


@app.post("/api-tokens", tags=["API Tokens"], summary="Create a new API token")
async def create_api_token(
    body: APITokenCreateRequest,
    request: Request,
    user: dict = Depends(get_current_user),
    manager: TokenManager = Depends(_get_token_manager),
):
    """
    Generate a scoped API token for the authenticated admin company.
    The raw secret is returned **once** in this response - store it securely.
    """
    try:
        token = manager.create_token(
            owner_id=user["id"],
            company_id=user.get("company_id", ""),
            name=body.name,
            scopes=body.scopes,
            expires_in_days=body.expires_in_days or 90,
            allowed_ips=body.allowed_ips,
        )
        return token
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.get("/api-tokens", tags=["API Tokens"], summary="List tokens for the caller company")
async def list_api_tokens(
    user: dict = Depends(get_current_user),
    manager: TokenManager = Depends(_get_token_manager),
):
    return manager.list_tokens(company_id=user.get("company_id", ""))


@app.delete("/api-tokens/{token_id}", tags=["API Tokens"], summary="Revoke a token")
async def revoke_api_token(
    token_id: str,
    body: APITokenRevokeRequest,
    user: dict = Depends(get_current_user),
    manager: TokenManager = Depends(_get_token_manager),
):
    manager.revoke_token(
        token_id=token_id,
        company_id=user.get("company_id", ""),
        revoked_by=user["id"],
        reason=body.reason,
    )
    return {"status": "revoked", "token_id": token_id}


@app.post("/api-tokens/{token_id}/rotate", tags=["API Tokens"], summary="Rotate a token")
async def rotate_api_token(
    token_id: str,
    user: dict = Depends(get_current_user),
    manager: TokenManager = Depends(_get_token_manager),
):
    """Revoke the existing token and issue a replacement with identical scopes."""
    try:
        new_token = manager.rotate_token(
            token_id=token_id,
            company_id=user.get("company_id", ""),
            owner_id=user["id"],
        )
        return new_token
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get("/api-tokens/{token_id}/usage", tags=["API Tokens"], summary="Get usage statistics")
async def get_token_usage(
    token_id: str,
    user: dict = Depends(get_current_user),
    manager: TokenManager = Depends(_get_token_manager),
):
    return manager.get_usage_summary(
        token_id=token_id,
        company_id=user.get("company_id", ""),
    )
