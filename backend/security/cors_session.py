# CORS & Session Security Configuration
# Fixes #2971 - Strict CORS + session token revocation

from datetime import timedelta
from functools import wraps
import secrets
from flask import Flask, request, jsonify, session
from flask_cors import CORS

# Strict CORS: only allow trusted origins
ALLOWED_ORIGINS = [
    "https://helpdesk.ai",
    "https://app.helpdesk.ai",
]

def configure_cors(app: Flask) -> None:
    CORS(app,
         origins=ALLOWED_ORIGINS,
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "X-CSRF-Token"],
         expose_headers=["X-Request-Id"],
         max_age=600)

# Revoked token store (use Redis in production)
_revoked_tokens: set = set()

def revoke_token(token: str) -> None:
    _revoked_tokens.add(token)

def is_token_revoked(token: str) -> bool:
    return token in _revoked_tokens

def require_valid_session(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        if not token or is_token_revoked(token):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

def logout_user(token: str) -> None:
    revoke_token(token)
    session.clear()
