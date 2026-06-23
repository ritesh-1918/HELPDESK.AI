from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator
from typing import Optional
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    APP_NAME: str = Field(default="HelpDesk AI", env="APP_NAME")
    DEBUG: bool = Field(default=False, env="DEBUG")
    SECRET_KEY: str = Field(default="", env="SECRET_KEY")
    ALLOWED_HOSTS: list[str] = Field(default=["*"], env="ALLOWED_HOSTS")

    # Database
    DATABASE_URL: str = Field(default="sqlite:///./test.db", env="DATABASE_URL")
    DB_POOL_SIZE: int = Field(default=10, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=20, env="DB_MAX_OVERFLOW")

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0", env="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")

    # Email
    SMTP_HOST: str = Field(default="", env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: str = Field(default="", env="SMTP_USER")
    SMTP_PASSWORD: str = Field(default="", env="SMTP_PASSWORD")
    EMAIL_FROM: str = Field(default="noreply@helpdesk.ai", env="EMAIL_FROM")

    # JWT
    JWT_SECRET: str = Field(default="", env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_EXPIRATION_MINUTES: int = Field(default=30, env="JWT_EXPIRATION_MINUTES")

    # OpenAI / AI
    OPENAI_API_KEY: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")

    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")

    @validator("SECRET_KEY", "JWT_SECRET", pre=True, always=True)
    def validate_secrets(cls, v, values, field):
        if not v:
            raise ValueError(f"{field.name} must be set in environment or .env file")
        return v

    @validator("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", pre=True, always=True)
    def validate_email_settings(cls, v, values, field):
        # Only validate if SMTP is configured
        if values.get("SMTP_HOST") and not v:
            raise ValueError(f"{field.name} must be set when SMTP_HOST is provided")
        return v

    @validator("DATABASE_URL", pre=True, always=True)
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL must be set")
        return v

settings = Settings()
