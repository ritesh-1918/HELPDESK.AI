
import os
import sys
from pathlib import Path
from slowapi import Limiter
from slowapi.util import get_remote_address

try:
    from supabase import create_client, Client
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
        supabase = None
    else:
        supabase = create_client(url, key)
        try:
            import backend.auth.crypto
        except Exception as patch_err:
            print(f"[Crypto WARNING] Failed to import backend.auth.crypto: {patch_err}")
except (ImportError, Exception) as e:
    print(f"[WARNING] Supabase initialization failed: {e}")
    supabase = None
    Client = None

try:
    from backend.services.classifier_service import ClassifierService
    classifier_service = ClassifierService()
except ImportError:
    classifier_service = None

try:
    from backend.services.classifier_v2 import classifier_v2
except ImportError:
    classifier_v2 = None

try:
    from backend.services.classifier_v3 import classifier_v3
except ImportError:
    classifier_v3 = None

try:
    from backend.services.ner_service import NERService
    ner_service = NERService()
except ImportError:
    ner_service = None

try:
    from backend.services.duplicate_service import DuplicateService
    duplicate_service = DuplicateService()
except ImportError:
    duplicate_service = None

try:
    from backend.services.rag_service import RagService
    rag_service = RagService()
except ImportError:
    rag_service = None

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
