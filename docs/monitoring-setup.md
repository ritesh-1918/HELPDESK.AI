# backend/main.py
import asyncio
import hmac
import ipaddress
import logging
import os
from typing import Any, AsyncIterator, List, Optional

import structlog
from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseSettings, Field, validator
from prometheus_client import CONTENT_TYPE_LATEST, REGISTRY, generate_latest
from prometheus_fastapi_instrumentator import Instrumentator
from starlette.middleware.base import BaseHTTPMiddleware

# ---------- Constants ----------
ENVIRONMENT_VAR = "ENVIRONMENT"
VERSION_VAR = "VERSION"
METRICS_PATH = "/metrics"
HEALTH_PATH = "/health"

# ---------- Configuration ----------
class Settings(BaseSettings):
    """Application configuration loaded from environment variables and .env file.

    Supports validation of CIDR networks, log levels, and CORS origins.
    """

    metrics_token: Optional[str] = Field(
        None,
        env="METRICS_TOKEN",
        description="Bearer token required to access /metrics. If set, IP‑based access is disabled.",
    )
    allowed_metrics_networks: List[str] = Field(
        default=[
            "127.0.0.0/8",
            "10.0.0.0/8",
            "172.16.0.0/12",
            "192.168.0.0/16",
        ],
        env="ALLOWED_METRICS_NETWORKS",
        description="List of CIDR networks allowed to access /metrics when no token is set.",
    )
    log_level: str = Field(
        "INFO",
        env="LOG_LEVEL",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).",
    )
    app_name: str = Field(
        "helpdesk-ai",
        env="APP_NAME",
        description="Application name used in logs and OpenAPI title.",
    )
    cors_origins: List[str] = Field(
        default=["*"],
        env="CORS_ORIGINS",
        description="CORS allowed origins. Comma-separated list.",
    )

    class Config:
        env_file = ".env"
        case_sensitive = False

    # ---------- Validators ----------
    @validator("allowed_metrics_networks", pre=True)
    def parse_networks(cls, value: Any) -> List[str]:
        """Parse and validate CIDR networks from environment variable.

        Args:
            value: Raw value from environment (string or list).

        Returns:
            List of validated CIDR strings.

        Raises:
            ValueError: If any network is invalid.
        """
        if isinstance(value, str):
            value = [network.strip() for network in value.split(",") if network.strip()]
        if not isinstance(value, list):
            raise ValueError("allowed_metrics_networks must be a list of CIDR strings")
        for network in value:
            try:
                ipaddress.ip_network(network)
            except ValueError as exc:
                raise ValueError(f"Invalid CIDR network '{network}': {exc}") from exc
        return value

    @validator("log_level")
    def validate_log_level(cls, value: str) -> str:
        """Normalize and validate log level.

        Args:
            value: Log level string.

        Returns:
            Uppercase validated log level.

        Raises:
            ValueError: If not one of the standard levels.
        """
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = value.upper()
        if upper not in valid_levels:
            raise ValueError(f"log_level must be one of {valid_levels}, got '{value}'")
        return upper

    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, value: Any) -> List[str]:
        """Parse comma-separated CORS origins.

        Args:
            value: Raw value from environment.

        Returns:
            List of origin strings.
        """
        if isinstance(value, str):
            value = [origin.strip() for origin in value.split(",") if origin.strip()]
        if not isinstance(value, list):
            raise ValueError("cors_origins must be a list of strings")
        return value


def get_settings() -> Settings:
    """Dependency that provides application settings (singleton).

    Returns:
        Settings instance.
    """
    if not hasattr(get_settings, "_settings"):
        get_settings._settings = Settings()
    return get_settings._settings


settings = get_settings()

# ---------- Logging Setup ----------
def setup_logging() -> None:
    """Configure structured logging with structlog and standard logging.

    Uses application settings for log level.
    """
    logging.basicConfig(level=settings.log_level)
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer(),
        ],
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


setup_logging()
logger = structlog.get_logger()

# ---------- FastAPI Application ----------
app = FastAPI(
    title=settings.app_name,
    version=os.getenv(VERSION_VAR, "1.0.0"),
    docs_url=(
        "/docs"
        if os.getenv(ENVIRONMENT_VAR, "").lower() != "production"
        else None
    ),
    redoc_url=None,
)

# ---------- CORS Middleware ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Security Middleware ----------
class MetricsSecurityMiddleware(BaseHTTPMiddleware):
    """Middleware restricting access to /metrics endpoint.

    Supports two mutually exclusive authentication methods:
    - Token-based (Bearer token) if ``METRICS_TOKEN`` is set.
    - IP-based (CIDR allowlist) otherwise.

    Attributes:
        _allowed_networks: Tuple of ``ipaddress.IPv4Network`` or ``IPv6Network`` objects.
        _settings: Application settings.
    """

    def __init__(self, app: Any, settings: Settings) -> None:
        """Initialize security middleware with allowed networks.

        Args:
            app: ASGI application.
            settings: Application settings containing token and network config.
        """
        super().__init__(app)
        self._settings = settings
        self._allowed_networks = tuple(
            ipaddress.ip_network(net) for net in settings.allowed_metrics_networks
        )

    async def dispatch(self, request: Request, call_next: Any) -> Response:
        """Enforce security for /metrics endpoint.

        Args:
            request: Incoming HTTP request.
            call_next: Next middleware or route handler.

        Returns:
            Response object.

        Raises:
            HTTPException: If access is denied.
        """
        if request.url.path.rstrip("/") == METRICS_PATH:
            client_host = request.client.host if request.client else None
            if client_host is None:
                logger.warning("metrics_request_no_client_ip")
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cannot determine client IP address",
                )

            # Token-based authentication
            if self._settings.metrics_token:
                auth_header: str = request.headers.get("Authorization", "")
                provided_token: str = ""
                if auth_header.startswith("Bearer "):
                    provided_token = auth_header[len("Bearer "):].strip()
                if not hmac.compare_digest(provided_token, self._settings.metrics_token):
                    logger.warning(
                        "metrics_token_mismatch",
                        client_ip=client_host,
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Invalid metrics token",
                    )
            else:
                # IP-based authentication
                allowed = False
                try:
                    client_ip = ipaddress.ip_address(client_host)
                    for network in self._allowed_networks:
                        if client_ip in network:
                            allowed = True
                            break
                except ValueError:
                    logger.warning(
                        "invalid_client_ip",
                        client_ip=client_host,
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Invalid client IP address",
                    )
                if not allowed:
                    logger.warning(
                        "metrics_ip_not_allowed",
                        client_ip=client_host,
                    )
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="IP address not allowed to access metrics",
                    )

        # Continue processing request
        response = await call_next(request)
        return response


app.add_middleware(MetricsSecurityMiddleware, settings=settings)

# ---------- Prometheus Instrumentator ----------
instrumentator = Instrumentator(
    should_group_status_codes=True,
    should_ignore_untemplated=True,
    should_instrument_requests_inprogress=True,
    excluded_handlers=[METRICS_PATH, HEALTH_PATH],
    env_var_name="ENABLE_METRICS",
)
instrumentator.instrument(app).expose(app, endpoint=METRICS_PATH, include_in_schema=False)

# ---------- Health Check Endpoint ----------
@app.get(HEALTH_PATH, tags=["health"])
async def health_check() -> dict:
    """Return a simple health status.

    Returns:
        Dictionary with status "ok" and version.
    """
    return {
        "status": "ok",
        "version": os.getenv(VERSION_VAR, "1.0.0"),
    }

# ---------- Application Lifespan Events ----------
@app.on_event("startup")
async def startup_event() -> None:
    """Perform actions on application startup.

    Logs that the application is ready.
    """
    logger.info(
        "application_startup",
        app_name=settings.app_name,
        environment=os.getenv(ENVIRONMENT_VAR, "development"),
    )

@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Perform actions on application shutdown.

    Logs shutdown.
    """
    logger.info("application_shutdown")