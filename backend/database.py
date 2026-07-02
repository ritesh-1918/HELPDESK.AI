import logging
import os
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

_supabase_instance = None

try:
    from supabase import create_client, Client
    from backend.config import settings
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_KEY
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
        supabase = None
    else:
        supabase = create_client(url, key)
        _supabase_instance = supabase
except (ImportError, Exception) as e:
    logger.warning("Supabase initialization failed: %s", e)
    supabase = None


def close_supabase() -> None:
    """Close the Supabase connection pool on application shutdown."""
    global _supabase_instance
    if _supabase_instance is not None:
        try:
            _supabase_instance.close()
            logger.info("Supabase connection pool closed")
        except Exception as e:
            logger.warning("Failed to close Supabase connection: %s", e)
        _supabase_instance = None
    else:
        logger.debug("No Supabase instance to close")

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
        logger.warning("Could not fetch system_settings for company_id=%s: %s", company_id, e)
    return defaults