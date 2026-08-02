
import os
import sys
from pathlib import Path
from slowapi import Limiter
from slowapi.util import get_remote_address

try:
    from supabase import create_client, Client
    from backend.config import settings
    from tenacity import retry, stop_after_attempt, wait_exponential

    _supabase_admin: Client | None = None
    _supabase_anon: Client | None = None

    def _init_supabase():
        """Lazy initialization of Supabase clients — avoids module-level side effects."""
        global _supabase_admin, _supabase_anon
        url = settings.SUPABASE_URL
        service_key = settings.SUPABASE_SERVICE_KEY
        anon_key = settings.SUPABASE_ANON_KEY

        if not url or not service_key:
            print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
            return

        # Admin client — SERVICE_ROLE_KEY — only for privileged operations
        _supabase_admin = create_client(url, service_key)

        # Anon client — ANON_KEY — for user-facing read operations (respects RLS)
        if anon_key:
            _supabase_anon = create_client(url, anon_key)

        try:
            import backend.auth.crypto
        except Exception as patch_err:
            print(f"[Crypto WARNING] Failed to import backend.auth.crypto: {patch_err}")

    def get_supabase_admin() -> Client | None:
        """Returns the admin Supabase client (SERVICE_ROLE_KEY).
        Use ONLY for privileged operations: ticket saves, admin queries, system tasks.
        """
        global _supabase_admin
        if _supabase_admin is None:
            _init_supabase()
        return _supabase_admin

    def get_supabase_anon() -> Client | None:
        """Returns the anon Supabase client (ANON_KEY).
        Use for user-facing read operations — respects RLS policies.
        """
        global _supabase_anon
        if _supabase_anon is None:
            _init_supabase()
        return _supabase_anon

    # Backward-compatible alias — existing code using `supabase` still works
    # but new code should call get_supabase_admin() or get_supabase_anon() explicitly
    _init_supabase()
    supabase = _supabase_admin

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def execute_with_retry(query_fn):
        """Wraps a Supabase query with exponential backoff retry logic."""
        return query_fn()

except (ImportError, Exception) as e:
    print(f"[WARNING] Supabase initialization failed: {e}")
    supabase = None
    _supabase_admin = None
    _supabase_anon = None
    Client = None

    def get_supabase_admin():
        return None

    def get_supabase_anon():
        return None

    def execute_with_retry(query_fn):
        return query_fn()

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
        "enable_auto_resolve": False,
        "enable_translation": True  # Multi-language support enabled by default
    }
    if not supabase or not company_id:
        return defaults
    try:
        res = supabase.table("system_settings").select(
            "ai_confidence_threshold, duplicate_sensitivity, enable_auto_resolve, enable_translation"
        ).eq("company_id", company_id).single().execute()
        if res.data:
            return {**defaults, **res.data}
    except Exception as e:
        print(f"[WARNING] Could not fetch system_settings for company_id={company_id}: {e}")
    return defaults
