"""
Auth Cookie Middleware — issue #130

Moves Supabase JWT access/refresh tokens out of browser LocalStorage /
AsyncStorage and into HttpOnly, Secure, SameSite=Strict cookies set by
the FastAPI gateway.

Exposes:
  POST /auth/login   — proxies Supabase password sign-in, sets cookies
  POST /auth/signup  — proxies Supabase sign-up, sets cookies if a session
                       was returned (i.e. email confirmation disabled)
  POST /auth/logout  — clears the cookies
  GET  /auth/me      — returns the cookie-verified user

Also exports:
  get_current_user   — FastAPI dependency that resolves the JWT from
                       the HttpOnly cookie first, falling back to the
                       Authorization: Bearer header.
"""

import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

try:
    from supabase import create_client, Client  # type: ignore
except ImportError:  # pragma: no cover - supabase is in requirements
    create_client = None
    Client = None


ACCESS_COOKIE = "sb_access_token"
REFRESH_COOKIE = "sb_refresh_token"

# Refresh tokens live longer than access tokens; defaults follow Supabase.
ACCESS_COOKIE_MAX_AGE = 60 * 60          # 1 hour
REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def _cookie_secure() -> bool:
    """Secure flag is on in production, off only for plain HTTP localhost."""
    env = os.environ.get("ENV", os.environ.get("ENVIRONMENT", "production")).lower()
    return env not in {"dev", "development", "local"}


def _anon_client() -> "Client":
    """Anon client used for user-scoped auth calls (login / signup / refresh)."""
    if create_client is None:
        raise HTTPException(status_code=503, detail="Supabase SDK unavailable")
    url = os.environ.get("SUPABASE_URL")
    anon_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not anon_key:
        raise HTTPException(
            status_code=503,
            detail="Auth backend not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing)",
        )
    return create_client(url, anon_key)


def _set_session_cookies(response: Response, access_token: str, refresh_token: Optional[str]) -> None:
    secure = _cookie_secure()
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=access_token,
        max_age=ACCESS_COOKIE_MAX_AGE,
        httponly=True,
        secure=secure,
        samesite="strict",
        path="/",
    )
    if refresh_token:
        response.set_cookie(
            key=REFRESH_COOKIE,
            value=refresh_token,
            max_age=REFRESH_COOKIE_MAX_AGE,
            httponly=True,
            secure=secure,
            samesite="strict",
            path="/",
        )


def _clear_session_cookies(response: Response) -> None:
    for key in (ACCESS_COOKIE, REFRESH_COOKIE):
        response.delete_cookie(key=key, path="/")


def _extract_bearer(request: Request) -> Optional[str]:
    """Reads the JWT from the HttpOnly cookie first, then Authorization header."""
    token = request.cookies.get(ACCESS_COOKIE)
    if token:
        return token
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip() or None
    return None


def get_current_user(request: Request) -> dict:
    """Resolve the authenticated user from cookie (preferred) or Bearer header."""
    token = _extract_bearer(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    client = _anon_client()
    try:
        result = client.auth.get_user(token)
    except Exception as exc:  # supabase raises various subclasses
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid session: {exc}")

    user = getattr(result, "user", None)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    # Return a plain dict so callers don't depend on the SDK model.
    try:
        return user.model_dump()  # pydantic v2
    except AttributeError:
        try:
            return user.dict()  # pydantic v1
        except AttributeError:
            return {"id": getattr(user, "id", None), "email": getattr(user, "email", None)}


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    data: Optional[dict] = None  # forwarded as user_metadata
    email_redirect_to: Optional[str] = None


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    client = _anon_client()
    try:
        result = client.auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if not session or not getattr(session, "access_token", None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    _set_session_cookies(response, session.access_token, getattr(session, "refresh_token", None))
    return {
        "user": user.model_dump() if user else None,
        "expires_in": getattr(session, "expires_in", None),
    }


@router.post("/signup")
def signup(payload: SignupRequest, response: Response):
    client = _anon_client()
    options: dict = {}
    if payload.data:
        options["data"] = payload.data
    if payload.email_redirect_to:
        options["email_redirect_to"] = payload.email_redirect_to

    try:
        body: dict = {"email": payload.email, "password": payload.password}
        if options:
            body["options"] = options
        result = client.auth.sign_up(body)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)

    # Supabase may return a user without a session (email confirmation flow).
    if session and getattr(session, "access_token", None):
        _set_session_cookies(response, session.access_token, getattr(session, "refresh_token", None))

    return {
        "user": user.model_dump() if user else None,
        "session_started": bool(session and getattr(session, "access_token", None)),
    }


@router.post("/logout")
def logout(response: Response):
    _clear_session_cookies(response)
    return {"ok": True}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"user": user}
