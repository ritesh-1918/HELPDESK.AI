import logging
from pathlib import Path
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

from backend.config import settings

env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

try:
    from supabase import create_client, Client
    from backend.config import settings
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_KEY
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")
        supabase = None
else:
    logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY not set in backend/.env")

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
