"""HttpOnly cookie session bridge for Supabase JWTs (issue #130)."""

from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
ACCESS_MAX_AGE = 60 * 60
REFRESH_MAX_AGE = 60 * 60 * 24 * 7

router = APIRouter(prefix="/auth", tags=["auth"])


def _cookie_kwargs() -> dict[str, Any]:
    secure = os.getenv("ENV", "production").lower() != "development"
    return {
        "httponly": True,
        "secure": secure,
        "samesite": "strict",
        "path": "/",
    }


def _anon_supabase():
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth backend not configured (SUPABASE_URL / SUPABASE_ANON_KEY missing)",
        )
    return create_client(url, key)


def extract_token(request: Request) -> str | None:
    """Prefer HttpOnly cookie; fall back to Authorization bearer header."""
    cookie_token = request.cookies.get(ACCESS_COOKIE)
    if cookie_token:
        return cookie_token
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip() or None
    return None


def _set_session_cookies(response: Response, session: Any) -> None:
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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        client = _anon_supabase()
        result = client.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid session: {exc}",
        ) from exc
    user = getattr(result, "user", None) or (result.get("user") if isinstance(result, dict) else None)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    if hasattr(user, "model_dump"):
        return user.model_dump()
    if hasattr(user, "dict"):
        return user.dict()
    return dict(user)


class LoginBody(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)


class SignupBody(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    full_name: str | None = None
    role: str | None = "user"
    company: str | None = None


@router.post("/login")
async def auth_login(body: LoginBody, response: Response):
    try:
        client = _anon_supabase()
        result = client.auth.sign_in_with_password(
            {"email": str(body.email), "password": body.password}
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if not session or not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    _set_session_cookies(response, session)
    user_payload = user.model_dump() if hasattr(user, "model_dump") else dict(user)
    return {"user": user_payload, "message": "Session cookies set"}


@router.post("/signup")
async def auth_signup(body: SignupBody, response: Response):
    metadata: dict[str, str] = {}
    if body.full_name:
        metadata["full_name"] = body.full_name
    if body.role:
        metadata["role"] = body.role
    if body.company:
        metadata["company"] = body.company

    try:
        client = _anon_supabase()
        result = client.auth.sign_up(
            {
                "email": str(body.email),
                "password": body.password,
                "options": {"data": metadata} if metadata else {},
            }
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    session = getattr(result, "session", None)
    user = getattr(result, "user", None)
    if session:
        _set_session_cookies(response, session)
    user_payload = user.model_dump() if user and hasattr(user, "model_dump") else None
    return {"user": user_payload, "message": "Signup complete"}


@router.post("/logout")
async def auth_logout(request: Request, response: Response):
    # Invalidate the session server-side before clearing cookies
    token = extract_token(request)
    if token:
        try:
            client = _anon_supabase()
            client.auth.sign_out(token)
        except Exception:
            pass  # Still clear cookies even if server-side invalidation fails
    _clear_session_cookies(response)
    return {"ok": True}


@router.get("/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return {"user": user}
