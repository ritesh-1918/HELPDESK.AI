import asyncio
import base64
import json
import logging
import uuid
from datetime import datetime, timezone
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.concurrency import iterate_in_threadpool
from typing import Any, Dict, Optional, Tuple

logger = logging.getLogger(__name__)

def decode_jwt_payload_unverified(token: str) -> dict:
    """Safely decode JWT payload locally without verifying signature."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return {}
        payload_b64 = parts[1]
        # Pad base64 string
        payload_b64 += '=' * (4 - len(payload_b64) % 4)
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        return json.loads(payload_bytes.decode('utf-8'))
    except Exception:
        return {}

class AuditLoggerMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for capturing security-sensitive actions and logging them asynchronously."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # 1. Setup Request ID
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = request_id

        # 2. Extract Token and Session
        token = self._extract_token(request)
        user_info = {}
        if token:
            user_info = decode_jwt_payload_unverified(token)
            request.state.jwt_payload = user_info

        path = request.url.path
        method = request.method

        # 3. Determine if path is audit-sensitive
        is_sensitive, action, resource_type, operation_type = self._parse_route_meta(path, method)

        # 4. For PATCH/PUT operations, fetch the BEFORE state (old_value)
        old_value = None
        resource_id = None
        
        # Resolve Supabase client from app state or import
        from backend.main import supabase
        
        if is_sensitive and method in ("PATCH", "PUT") and supabase:
            # Extract resource_id from path (e.g. /tickets/{id})
            parts = [p for p in path.split("/") if p]
            if len(parts) >= 2:
                resource_id = parts[-1]
                if resource_type == "ticket":
                    old_value = self._fetch_ticket_state(supabase, resource_id)

        # 5. Execute Request
        start_time = datetime.now(timezone.utc)
        response = await call_next(request)
        end_time = datetime.now(timezone.utc)

        # Inject X-Request-ID Header
        response.headers["X-Request-ID"] = request_id

        # 6. Parse response body if it's sensitive and successful
        # We need to rebuild the body iterator to prevent hanging
        response_body = [section async for section in response.body_iterator]
        response.body_iterator = iterate_in_threadpool(iter(response_body))
        raw_body = b"".join(response_body)
        response_json = {}
        try:
            response_json = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except Exception:
            pass

        # 7. Asynchronously Log Audit Record
        if is_sensitive:
            asyncio.create_task(self._log_audit_async(
                supabase=supabase,
                request=request,
                response=response,
                response_json=response_json,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                operation_type=operation_type,
                old_value=old_value,
                user_info=user_info,
                start_time=start_time
            ))

        return response

    def _extract_token(self, request: Request) -> Optional[str]:
        # Try cookie first
        cookie_token = request.cookies.get("sb-access-token")
        if cookie_token:
            return cookie_token
        # Try Auth header
        auth = request.headers.get("authorization") or request.headers.get("Authorization")
        if auth and auth.lower().startswith("bearer "):
            return auth.split(" ", 1)[1].strip()
        return None

    def _parse_route_meta(self, path: str, method: str) -> Tuple[bool, str, str, str]:
        # Returns: (is_sensitive, action, resource_type, operation_type)
        if path == "/auth/login":
            return True, "user_login", "user", "authenticate"
        elif path == "/auth/signup":
            return True, "user_signup", "user", "create"
        elif path == "/auth/logout":
            return True, "user_logout", "user", "authenticate"
        
        elif path == "/tickets/save" and method == "POST":
            return True, "create_ticket", "ticket", "create"
        elif path == "/tickets" and method == "POST":
            return True, "create_ticket", "ticket", "create"
        elif path == "/tickets" and method == "GET":
            return True, "view_tickets", "ticket", "read"
        elif path == "/tickets/search" and method == "GET":
            return True, "search_tickets", "ticket", "read"
        
        elif path.startswith("/tickets/") and len(path.split("/")) >= 3:
            # Matches /tickets/{id}
            if method == "GET":
                return True, "view_ticket_detail", "ticket", "read"
            elif method in ("PATCH", "PUT"):
                return True, "update_ticket", "ticket", "update"
            elif method == "DELETE":
                return True, "delete_ticket", "ticket", "delete"

        # Check for admin setting updates or other role actions
        elif path == "/ai/log_correction" and method == "POST":
            return True, "log_correction", "prediction", "update"
            
        return False, "", "", ""

    def _fetch_ticket_state(self, supabase_client: Any, ticket_id: str) -> Optional[Dict[str, Any]]:
        try:
            res = supabase_client.table("tickets").select("*").eq("id", ticket_id).execute()
            if res.data and len(res.data) > 0:
                # Exclude description_vector from logs to save space
                ticket = res.data[0].copy()
                if "description_vector" in ticket:
                    ticket["description_vector"] = None
                return ticket
        except Exception as e:
            logger.warning(f"Failed to fetch ticket {ticket_id} for audit pre-state: {e}")
        return None

    async def _log_audit_async(
        self,
        supabase: Any,
        request: Request,
        response: Response,
        response_json: dict,
        action: str,
        resource_type: str,
        resource_id: Optional[str],
        operation_type: str,
        old_value: Optional[dict],
        user_info: dict,
        start_time: datetime
    ) -> None:
        """Write audit log record to Supabase database asynchronously."""
        if not supabase:
            return

        try:
            status = "success" if 200 <= response.status_code < 300 else "failure"

            # Parse user ID and company ID from request state or JWT payload
            user_id = getattr(request.state, "user", {}).get("id") or user_info.get("sub")
            company_id = getattr(request.state, "user", {}).get("company_id")
            
            # Resolve company_id from profile if user_id is present but company_id is None
            if user_id and not company_id:
                try:
                    profile_res = supabase.table("profiles").select("company_id").eq("id", user_id).execute()
                    if profile_res.data:
                        company_id = profile_res.data[0].get("company_id")
                except Exception:
                    pass

            # Resolve resource ID for creations/logins
            new_value = None
            if status == "success":
                if action in ("create_ticket", "save_ticket") and response_json:
                    resource_id = response_json.get("ticket_id")
                    if resource_id:
                        new_value = self._fetch_ticket_state(supabase, resource_id)
                elif action == "update_ticket" and resource_id:
                    new_value = self._fetch_ticket_state(supabase, resource_id)
                elif action in ("user_login", "user_signup") and response_json:
                    user_data = response_json.get("user", {})
                    user_id = user_data.get("id") or user_id
                    company_id = user_data.get("user_metadata", {}).get("company_id") or company_id
            
            # Override action/status on authentication failures
            if action == "user_login" and response.status_code == 401:
                action = "failed_login_attempt"
                status = "failure"

            # Context collection
            ip_address = request.client.host if request.client else "unknown"
            user_agent = request.headers.get("user-agent", "unknown")
            origin = request.headers.get("origin", "unknown")
            
            # Authentication method
            auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
            auth_method = "session_cookie"
            if auth_header and auth_header.lower().startswith("bearer "):
                auth_method = "bearer_token"
            elif not token_exists(request):
                auth_method = "none"

            # Build record payload
            payload = {
                "user_id": user_id,
                "company_id": company_id,
                "session_id": request.cookies.get("sb-refresh-token")[:64] if request.cookies.get("sb-refresh-token") else None,
                "request_id": request.state.request_id,
                "action": action,
                "resource_type": resource_type,
                "resource_id": str(resource_id) if resource_id else None,
                "operation_type": operation_type,
                "status": status,
                "old_value": old_value or {},
                "new_value": new_value or {},
                "ip_address": ip_address,
                "user_agent": user_agent,
                "origin": origin,
                "authentication_method": auth_method,
                "reason": request.headers.get("x-audit-reason"),
                "approval_id": request.headers.get("x-audit-approval-id"),
                "workflow_reference": request.headers.get("x-audit-workflow-ref")
            }

            # Insert into database using public view
            supabase.table("enterprise_audit_logs").insert(payload).execute()
        except Exception as e:
            logger.error(f"Failed to record async audit log: {e}")

def token_exists(request: Request) -> bool:
    return bool(request.cookies.get("sb-access-token") or request.headers.get("authorization") or request.headers.get("Authorization"))
