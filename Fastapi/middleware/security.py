"""
Helmet.js-style security headers middleware for FastAPI.
Implements CSP, X-Frame-Options, X-Content-Type-Options, and more.
"""

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import List, Optional
import os


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers similar to Helmet.js.
    
    Headers added:
    - Content-Security-Policy (CSP)
    - X-Frame-Options
    - X-Content-Type-Options
    - X-XSS-Protection
    - Strict-Transport-Security (HSTS)
    - Referrer-Policy
    - Permissions-Policy
    """
    
    def __init__(
        self,
        app: FastAPI,
        csp_directives: Optional[dict] = None,
        frame_options: str = "DENY",
        hsts_max_age: int = 31536000,
        enable_hsts: bool = True,
    ):
        super().__init__(app)
        self.frame_options = frame_options
        self.hsts_max_age = hsts_max_age
        self.enable_hsts = enable_hsts
        
        # Default CSP directives
        self.csp_directives = csp_directives or {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "img-src": ["'self'", "data:", "https:"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'", "https://api.supabase.io", "wss://*.supabase.co"],
            "frame-ancestors": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
        }
    
    def _build_csp_header(self) -> str:
        """Build CSP header string from directives."""
        parts = []
        for directive, sources in self.csp_directives.items():
            parts.append(f"{directive} {' '.join(sources)}")
        return "; ".join(parts)
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Content-Security-Policy
        response.headers["Content-Security-Policy"] = self._build_csp_header()
        
        # X-Frame-Options (Clickjacking protection)
        response.headers["X-Frame-Options"] = self.frame_options
        
        # X-Content-Type-Options (MIME-sniffing protection)
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # X-XSS-Protection (legacy but still useful)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Strict-Transport-Security (HSTS)
        if self.enable_hsts:
            response.headers["Strict-Transport-Security"] = f"max-age={self.hsts_max_age}; includeSubDomains"
        
        # Referrer-Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions-Policy
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), "
            "payment=(), usb=(), magnetometer=(), gyroscope=()"
        )
        
        return response


def configure_cors(app: FastAPI):
    """
    Configure CORS from ALLOWED_ORIGINS environment variable.
    
    Usage:
        ALLOWED_ORIGINS=http://localhost:3000,https://helpdesk.ai
    """
    from fastapi.middleware.cors import CORSMiddleware
    
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]
    
    # Add production domain if not in dev mode
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        prod_origin = os.getenv("PRODUCTION_ORIGIN", "https://helpdesk.ai")
        if prod_origin not in allowed_origins:
            allowed_origins.append(prod_origin)
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
        expose_headers=["X-Request-Id"],
        max_age=600,  # Cache preflight for 10 minutes
    )


def configure_security(app: FastAPI, environment: str = "development"):
    """
    Configure all security middleware.
    
    Usage:
        from middleware.security import configure_security
        configure_security(app, environment="production")
    """
    # CORS
    configure_cors(app)
    
    # Security headers
    enable_hsts = environment == "production"
    
    # Relax CSP in development
    if environment == "development":
        csp = {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:*"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "data:", "blob:"],
            "connect-src": ["'self'", "http://localhost:*", "ws://localhost:*"],
            "frame-ancestors": ["'self'"],
        }
    else:
        csp = None  # Use strict defaults
    
    app.add_middleware(
        SecurityHeadersMiddleware,
        csp_directives=csp,
        frame_options="DENY",
        enable_hsts=enable_hsts,
    )
