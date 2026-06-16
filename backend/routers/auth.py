
import hashlib
import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Request, Response

from backend.dependencies import supabase
from backend.limiter import limiter, AUTH_LIMIT
from backend.models import LoginBody, SignupBody

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])
ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
ACCESS_MAX_AGE = 60 * 60
REFRESH_MAX_AGE = 60 * 60 * 24 * 7

def _cookie_kwargs() -> dict:
    secure = os.getenv("ENV", "production").lower() != "development"
    return {
        "httponly": True,
        "secure": secure,
        "samesite": "strict",
        "path": "/",
    }

def extract_token(request: Request) -> str | None:
    cookie_token = request.cookies.get(ACCESS_COOKIE)
    if cookie_token:
        return cookie_token
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip() or None
    return None

def _set_session_cookies(response: Response, session) -> None:
    if not session or not getattr(session, "access_token", None):
        return
    response.set_cookie(
        ACCESS_COOKIE,
        session.access_token,
        max_age=ACCESS_MAX_AGE,
        **_cookie_kwargs(),
    )
    refresh = getattr(session, "refresh_token", None)
    if refresh:
        response.set_cookie(
            REFRESH_COOKIE,
            refresh,
            max_age=REFRESH_MAX_AGE,
            **_cookie_kwargs(),
        )

def _clear_session_cookies(response: Response) -> None:
    kwargs = _cookie_kwargs()
    response.delete_cookie(ACCESS_COOKIE, path=kwargs["path"])
    response.delete_cookie(REFRESH_COOKIE, path=kwargs["path"])

_REVOKED_PREFIX = "helpdesk:revoked:"


def _anon_supabase():
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=503,
            detail="Auth backend not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing)",
        )
    return create_client(url, key)


def _service_supabase():
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


def _get_redis():
    try:
        import redis as _redis

        url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        client = _redis.from_url(url, decode_responses=True, socket_connect_timeout=1)
        client.ping()
        return client
    except Exception:
        return None


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _revoke_token(token: str, ttl: int = 3600) -> None:
    try:
        redis = _get_redis()
        if redis:
            redis.setex(f"{_REVOKED_PREFIX}{_token_hash(token)}", ttl, "1")
    except Exception as exc:
        logger.warning("[Auth] Redis denylist write failed: %s", exc)


async def get_current_user(request: Request) -> dict:
    token = extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection offline")
    try:
        result = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid session: {exc}",
        ) from exc
    user = getattr(result, "user", None) or (result.get("user") if isinstance(result, dict) else None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    if hasattr(user, "model_dump"):
        return user.model_dump()
    if hasattr(user, "dict"):
        return user.dict()
    return dict(user)


@router.post("/login")
@limiter.limit(AUTH_LIMIT)
async def auth_login(request: Request, body: LoginBody, response: Response):
    """Authenticate a user with email and password.

    On success, sets HttpOnly session cookies (access_token + refresh_token)
    and returns the authenticated user profile.

    Rate limited to 5 requests/minute per IP to prevent brute-force attacks.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection offline")
    try:
        result = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as exc:
        logger.error("Login attempt failed", exc_info=exc)
        raise HTTPException(status_code=401, detail="Invalid email or password") from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if not session or not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _set_session_cookies(response, session)
    user_payload = user.model_dump() if hasattr(user, "model_dump") else dict(user)
    return {"user": user_payload, "message": "Session cookies set"}

@router.post("/signup")
@limiter.limit(AUTH_LIMIT)
async def auth_signup(request: Request, body: SignupBody, response: Response):
    """Register a new user account.

    Accepts email, password, and optional full_name/role/company metadata.
    On success, auto-authenticates the new user and sets session cookies.

    Rate limited to 5 requests/minute per IP to prevent abuse.
    """
    if not supabase:
        raise HTTPException(status_code=503, detail="Database connection offline")
    metadata = {}
    if body.full_name:
        metadata["full_name"] = body.full_name
    if body.role:
        metadata["role"] = body.role
    if body.company:
        metadata["company"] = body.company

    try:
        result = supabase.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
                "options": {"data": metadata} if metadata else {},
            }
        )
    except Exception as exc:
        logger.error("Signup attempt failed", exc_info=exc)
        raise HTTPException(status_code=400, detail="Signup failed. Please try again.") from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if session:
        _set_session_cookies(response, session)
    user_payload = user.model_dump() if user and hasattr(user, "model_dump") else None
    return {"user": user_payload, "message": "Signup complete"}

@router.post("/logout")
@limiter.limit(AUTH_LIMIT)
async def auth_logout(request: Request, response: Response):
    """Log out the current user, invalidating the session server-side.

    Performs three layers of session invalidation:
    1. Adds the access token to a Redis denylist for immediate rejection
    2. Calls the Supabase admin API to sign the user out server-side
    3. Clears both the access_token and refresh_token HttpOnly cookies
    """
    token = extract_token(request)
    if token:
        _revoke_token(token, ttl=3600)
        try:
            admin = _service_supabase()
            if admin:
                user_result = admin.auth.get_user(token)
                user = getattr(user_result, "user", None)
                user_id = getattr(user, "id", None) if user else None
                if user_id:
                    admin.auth.admin.sign_out(user_id)
        except Exception as exc:
            logger.warning("[Auth] Admin sign-out failed: %s", exc)
    _clear_session_cookies(response)
    return {"ok": True}

@router.get("/me")
async def auth_me(user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return {"user": user}

