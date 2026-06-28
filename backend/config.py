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

    @model_validator(mode="after")
    def validate_supabase_settings(self):
        if not self.ALLOW_DEGRADED_STARTUP and self.REQUIRE_SUPABASE:
            missing = [
                name
                for name in ("SUPABASE_URL", "SUPABASE_SERVICE_KEY")
                if not getattr(self, name)
            ]
            if missing:
                missing_list = ", ".join(missing)
                raise ValueError(
                    f"Missing required Supabase environment variables: {missing_list}"
                )
        return self

    @property
    def supabase_ready(self) -> bool:
        return bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_KEY)

    @property
    def should_init_supabase(self) -> bool:
        return self.supabase_ready and not self.ALLOW_DEGRADED_STARTUP

settings = Settings()
