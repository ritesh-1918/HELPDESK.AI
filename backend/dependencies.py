
import os
import sys
from pathlib import Path
from slowapi import Limiter
from slowapi.util import get_remote_address

from backend.config import settings

supabase = None
Client = None
if settings.supabase_ready:
    try:
        from supabase import create_client, Client as SupabaseClient

        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        Client = SupabaseClient
    except (ImportError, Exception) as e:
        print(f"[WARNING] Supabase initialization failed: {e}")
        supabase = None
        Client = None
else:
    print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")

from backend.services.classifier_service import ClassifierService
from backend.services.classifier_v2 import classifier_v2
from backend.services.classifier_v3 import classifier_v3
from backend.services.ner_service import NERService
from backend.services.duplicate_service import DuplicateService
from backend.services.rag_service import RagService

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

limiter = Limiter(key_func=get_remote_address)

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
