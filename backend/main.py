"""
FastAPI Backend — AI Helpdesk Ticket Analyzer
POST /ai/analyze_ticket  →  full analysis of a support ticket
GET  /health             →  service health check
"""

import os
import sys
import uuid
import traceback
import warnings
from contextlib import asynccontextmanager

# Suppress harmless PyTorch CPU pin_memory warning
warnings.filterwarnings("ignore", message="'pin_memory'")

# HF Rebuild Trigger: 2026-03-08-2030
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from backend/.env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Ensure project root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.classifier_service import ClassifierService
from backend.services.classifier_v2 import classifier_v2
from backend.services.classifier_v3 import classifier_v3 # V3 Power Model
from backend.services.ner_service import NERService
from backend.services.duplicate_service import DuplicateService


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------
class TicketRequest(BaseModel):
    text: str
    image_base64: str = ""
    image_text: str = "" # Keep for backward compatibility


class DuplicateInfo(BaseModel):
    is_duplicate: bool
    duplicate_ticket_id: str | None = None
    similarity: float = 0.0


class EntityInfo(BaseModel):
    text: str
    label: str
    confidence: float


class TicketResponse(BaseModel):
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


# --- In-Memory Database (to be replaced with SQL later) ---
TICKETS_DB: list[TicketRecord] = []


class HealthResponse(BaseModel):
    status: str
    classifier_loaded: bool
    ner_loaded: bool


# ---------------------------------------------------------------------------
# Service singletons
# ---------------------------------------------------------------------------
classifier_service = ClassifierService()
ner_service = NERService()
duplicate_service = DuplicateService()

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
    
    if gemini_service:
        print(f"[Startup] Gemini Service: {'Initialized' if gemini_service._initialized else 'FAILED (Key missing or SDK error)'}")
    else:
        print("[Startup] Gemini Service: NOT LOADED (Import failed)")

    print("[Startup] Classifier V2 Shadow: Ready.")
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
                            <p class="text-slate-400 text-sm">Verify AI model loading statuses</p>
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
        "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z"
    }

    try:
        if CORRECTIONS_LOG_PATH.exists() and CORRECTIONS_LOG_PATH.stat().st_size > 2:
            with open(CORRECTIONS_LOG_PATH, "r", encoding="utf-8") as f:
                logs = __import__("json").load(f)
        else:
            logs = []

        logs.append(entry)

        with open(CORRECTIONS_LOG_PATH, "w", encoding="utf-8") as f:
            __import__("json").dump(logs, f, indent=2)

        print(f"[CORRECTION SAVED] Ticket ID: {ticket_id} | Changed: {changed_fields}")
        return {"status": "saved", "changed_fields": changed_fields}

    except Exception as e:
        print(f"[CORRECTION ERROR] Could not save: {e}")
        return {"status": "error", "message": str(e)}


# ---------------------------------------------------------------------------
# Ticket Persistence Management Endpoints
# ---------------------------------------------------------------------------
@app.get("/tickets")
async def list_tickets(user_id: str | None = None):
    """Retrieve all tickets, optionally filtered by owner_id."""
    if user_id:
        return [t for t in TICKETS_DB if t.owner_id == user_id]
    return TICKETS_DB


@app.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Retrieve a single ticket by its unique ID."""
    for ticket in TICKETS_DB:
        if str(ticket.ticket_id) == str(ticket_id):
            return ticket
    raise HTTPException(status_code=404, detail="Ticket not found")


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
async def analyze_ticket(request: TicketRequest):
    """Analyze a support ticket and return classification, entities, and duplicate info."""
    text = request.text
    
    # --- Layer 1: Local OCR (CPU, no API required) ---
    local_ocr_text = ""
    if request.image_base64 and ocr_service:
        print("[AI] Extracting text via local OCR...")
        local_ocr_text = ocr_service.extract_text(request.image_base64)
        if local_ocr_text:
            text = f"{text} {local_ocr_text}".strip()
            print(f"[AI] OCR added {len(local_ocr_text)} chars to context.")

    # --- Layer 2: Gemini Vision (API, optional enrichment) ---
    gemini_analysis = {
        "image_description": "",
        "ocr_text": local_ocr_text,  # Pre-populate with local OCR result
        "detected_problem": ""
    }

    if request.image_base64 and gemini_service and gemini_service._initialized:
        print("[AI] Enriching image context with Gemini Vision...")
        gemini_result = gemini_service.analyze_image(request.image_base64)
        gemini_analysis["image_description"] = gemini_result.get("image_description", "")
        gemini_analysis["detected_problem"] = gemini_result.get("detected_problem", "")
        # Merge Gemini OCR only if local OCR found nothing
        if not local_ocr_text and gemini_result.get("ocr_text"):
            gemini_analysis["ocr_text"] = gemini_result["ocr_text"]
            text = f"{text} {gemini_result['ocr_text']}".strip()
        if gemini_result.get("detected_problem"):
            text = f"{text} {gemini_result['detected_problem']}".strip()

    # Summary: Generate a concise one-line summary using Gemini
    summary = text[:100] + ("…" if len(text) > 100 else "") # Fallback
    if gemini_service and gemini_service._initialized:
        print("[AI] Generating one-line summary...")
        summary = gemini_service.get_summary(text)

    # --- Classification ---
    try:
        classification = classifier_service.predict(text)
    except FileNotFoundError:
        classification = {
            "category": "Unknown",
            "subcategory": "Unknown",
            "priority": "Medium",
            "auto_resolve": False,
            "assigned_team": "General Support",
            "confidence": 0.0,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

    # --- NER ---
    try:
        entities = ner_service.extract_entities(text)
    except FileNotFoundError:
        entities = []
    except Exception as e:
        traceback.print_exc()
        entities = []

    # --- Duplicate detection ---
    try:
        dup_result = duplicate_service.check_duplicate(text)
    except Exception as e:
        traceback.print_exc()
        dup_result = {"is_duplicate": False, "duplicate_ticket_id": None, "similarity": 0.0}

    # --- Reasoning ---
    # Create template-based reasoning (can be upgraded to OpenAI later)
    decision_factors = []
    if classification["confidence"] > 0.8:
        decision_factors.append(f"High confidence match for '{classification['subcategory']}'")
    if entities:
        entity_names = ", ".join([e["text"] for e in entities[:3]])
        decision_factors.append(f"Detected key entities: {entity_names}")
    if dup_result["is_duplicate"]:
        decision_factors.append(f"Significant similarity ({int(dup_result['similarity']*100)}%) to existing ticket")

    reasoning = (
        f"The AI categorized this as '{classification['category']}' because the content strongly relates to "
        f"{classification['subcategory']}. "
    )
    if classification["auto_resolve"]:
        reasoning += "Since this is a common, documented issue, it has been flagged for auto-resolution."
    else:
        reasoning += f"Due to the nature of the request, it has been routed to the {classification['assigned_team']}."

    # --- Gemini Deep Reasoning ---
    # Disabled as per user request to remove 'Deep Reasoning' section
    highlights = []

    # --- Confidence-Based Routing ---
    REVIEW_THRESHOLD = 0.80
    needs_review = False
    if classification["confidence"] < REVIEW_THRESHOLD:
        needs_review = True
        classification["auto_resolve"] = False
        classification["assigned_team"] = "Human Review Queue"
        print(f'[LOW CONFIDENCE] Text: "{text[:80]}...", Confidence: {classification["confidence"]:.2f}')

    # --- Low-Confidence Logging (threshold: 85%) ---
    LOW_CONF_LOG_PATH = Path(__file__).parent / "data" / "low_confidence_log.json"
    LOW_CONF_THRESHOLD = 0.85
    if classification["confidence"] < LOW_CONF_THRESHOLD:
        try:
            if LOW_CONF_LOG_PATH.exists() and LOW_CONF_LOG_PATH.stat().st_size > 2:
                with open(LOW_CONF_LOG_PATH, "r", encoding="utf-8") as f:
                    low_conf_logs = __import__("json").load(f)
            else:
                low_conf_logs = []

            low_conf_logs.append({
                "text": text,
                "ocr_text": gemini_analysis.get("ocr_text", ""),
                "predicted_category": classification["category"],
                "predicted_subcategory": classification["subcategory"],
                "confidence": classification["confidence"],
                "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z"
            })

            with open(LOW_CONF_LOG_PATH, "w", encoding="utf-8") as f:
                __import__("json").dump(low_conf_logs, f, indent=2)

            print(f'[LOW CONFIDENCE LOGGED] Confidence: {classification["confidence"]:.2f}')
        except Exception as e:
            print(f"[LOW CONFIDENCE LOG ERROR] {e}")

    # Store current ticket for future duplicate checks
    ticket_id = str(uuid.uuid4())
    try:
        duplicate_service.add_ticket(ticket_id, text)
    except Exception:
        pass

    return TicketResponse(
        summary=summary,
        category=classification["category"],
        subcategory=classification["subcategory"],
        priority=classification["priority"],
        auto_resolve=classification["auto_resolve"],
        assigned_team=classification["assigned_team"],
        entities=[EntityInfo(**e) for e in entities],
        duplicate_ticket=DuplicateInfo(**dup_result),
        confidence=classification["confidence"],
        needs_review=needs_review,
        reasoning=reasoning,
        decision_factors=decision_factors,
        image_description=gemini_analysis["image_description"],
        ocr_text=gemini_analysis["ocr_text"],
        highlights=highlights
    )

@app.post("/ai/analyze-v2")
async def analyze_ticket_v2(request: TicketRequest):
    """
    Shadow Route V2: DistilBERT Model (Refined).
    """
    text = request.text
    try:
        prediction = classifier_v2.predict(text)
        return {
            "status": "success",
            "model": "V2-DistilBERT",
            "category": prediction["category"]["prediction"],
            "subcategory": prediction["sub_category"]["prediction"],
            "priority": prediction["priority"]["prediction"],
            "auto_resolve": prediction["auto_resolve"]["prediction"].lower() == "true",
            "assigned_team": prediction["assigned_team"]["prediction"],
            "confidence": prediction["category"]["confidence"],
            "v2_full_results": prediction
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"V2 Shadow Error: {str(e)}")

@app.post("/ai/analyze-v3")
async def analyze_ticket_v3(request: TicketRequest):
    """
    Shadow Route V3: BERT-Base Power Model + OCR Awareness.
    This is the final 'Supervised Brain' candidate.
    """
    text = request.text
    ocr_text = ""

    # 1. OCR Extraction (Vision Awareness)
    if request.image_base64 and ocr_service:
        ocr_text = ocr_service.extract_text(request.image_base64)
        if ocr_text:
            text = f"[USER INPUT]: {text}\n[IMAGE OCR]: {ocr_text}"
    
    try:
        # 2. V3 Power Prediction
        prediction = classifier_v3.predict(text)
        
        return {
            "status": "success",
            "model": "V3-Power-BERT",
            "category": prediction["category"]["prediction"],
            "subcategory": prediction["sub_category"]["prediction"],
            "priority": prediction["priority"]["prediction"],
            "auto_resolve": prediction["auto_resolve"]["prediction"].lower() == "true",
            "assigned_team": prediction["assigned_team"]["prediction"],
            "confidence": prediction["category"]["confidence"],
            "ocr_processed": bool(ocr_text),
            "v3_full_results": prediction
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"V3 Power Error: {str(e)}")
