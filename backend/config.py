"""
Centralized settings with Pydantic validation schemas.

All environment variables are loaded through this module, validated at startup,
and surfaced as typed attributes on the `settings` singleton. This replaces
ad-hoc `os.getenv()` calls scattered across the codebase.
"""
from typing import Optional
from pydantic import field_validator, model_validator
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

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PASSWORD: Optional[str] = None

    # CORS & Security
    ALLOWED_ORIGINS: str = "https://helpdeskaiv1.vercel.app,http://localhost:5173,http://localhost:3000"
    ALLOWED_ORIGIN_REGEX: Optional[str] = None
    ENV: str = "production"

    # Rate Limiting
    RATE_LIMIT_AI: str = "10/minute"
    RATE_LIMIT_AUTH: str = "5/minute"

    # Ticket Encryption
    TICKET_ENCRYPTION_KEY: Optional[str] = None

    # Slack
    SLACK_WEBHOOK_URL: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("SUPABASE_URL")
    @classmethod
    def validate_supabase_url(cls, v: Optional[str]) -> Optional[str]:
        if v and not v.startswith(("https://", "http://")):
            raise ValueError("SUPABASE_URL must start with https:// or http://")
        return v

    @field_validator("ENV")
    @classmethod
    def validate_env(cls, v: str) -> str:
        allowed = {"production", "development", "staging"}
        v_lower = v.lower()
        if v_lower not in allowed:
            raise ValueError(f"ENV must be one of {allowed}, got '{v}'")
        return v_lower

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def validate_origins(cls, v: str) -> str:
        origins = [o.strip() for o in v.split(",") if o.strip()]
        for origin in origins:
            if not origin.startswith(("https://", "http://")):
                raise ValueError(
                    f"ALLOWED_ORIGINS contains invalid origin '{origin}' — "
                    f"must start with https:// or http://"
                )
        return ",".join(origins)

    @field_validator("REDIS_URL")
    @classmethod
    def validate_redis_url(cls, v: str) -> str:
        if not v.startswith("redis://") and not v.startswith("rediss://"):
            raise ValueError("REDIS_URL must start with redis:// or rediss://")
        return v

    @model_validator(mode="after")
    def validate_dependencies(self) -> "Settings":
        """Ensure critical dependencies are configured unless degraded mode is enabled."""
        if not self.ALLOW_DEGRADED_STARTUP:
            if not self.SUPABASE_URL or not self.SUPABASE_SERVICE_KEY:
                raise ValueError(
                    "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set "
                    "unless ALLOW_DEGRADED_STARTUP is True"
                )
        return self

    @property
    def is_development(self) -> bool:
        return self.ENV == "development"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
