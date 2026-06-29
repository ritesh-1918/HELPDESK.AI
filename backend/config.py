from typing import Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Core API Keys
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    RESEND_API_KEY: Optional[str] = None
    
    # Model Configurations
    SENTENCE_TRANSFORMER_MODEL_PATH: str = "all-MiniLM-L6-v2"
    
    # Application State
    ALLOW_DEGRADED_STARTUP: bool = False
    REQUIRE_SUPABASE: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @model_validator(mode='after')
    def validate_dependencies(self) -> 'Settings':
        if not self.ALLOW_DEGRADED_STARTUP:
            if not self.SUPABASE_URL or not self.SUPABASE_SERVICE_KEY:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set unless ALLOW_DEGRADED_STARTUP is True")
        return self

settings = Settings()
