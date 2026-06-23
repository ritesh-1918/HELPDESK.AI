from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Core API Keys
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    GEMINI_API_KEY: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None

    # Model Configurations
    SENTENCE_TRANSFORMER_MODEL_PATH: str = "all-MiniLM-L6-v2"

    # Application State
    ALLOW_DEGRADED_STARTUP: bool = False
    REQUIRE_SUPABASE: bool = True

    # Logging
    # Severity threshold for the FastAPI backend logger.
    # Accepts standard stdlib names (DEBUG/INFO/WARNING/ERROR/CRITICAL)
    # case-insensitively, or an integer level. Defaults to INFO.
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
