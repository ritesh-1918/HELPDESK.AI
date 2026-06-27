
import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from backend.dependencies import supabase
from backend.models import LoginBody, SignupBody
from backend.limiter import limiter, AUTH_LIMIT

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
async def auth_login(body: LoginBody, response: Response):
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
async def auth_signup(body: SignupBody, response: Response):
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
async def auth_logout(response: Response):
    """Clear session cookies to log out the current user."""
    _clear_session_cookies(response)
    return {"ok": True}

@router.get("/me")
async def auth_me(user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return {"user": user}

