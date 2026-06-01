import os
import time
import logging
from typing import Dict, Optional
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from postgrest.exceptions import APIError

logger = logging.getLogger(__name__)

# Reusable security scheme to extract token
security_scheme = HTTPBearer(auto_error=False)

# Cache user profiles in memory (user_id -> {company_id, role, cache_time})
_profile_cache: Dict[str, dict] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes cache

class TenantSecurityManager:
    def __init__(self, supabase_client=None):
        self._supabase = supabase_client

    @property
    def supabase(self):
        # Lazy load or use the global client
        if self._supabase is None:
            from backend.main import supabase as global_supabase
            self._supabase = global_supabase
        return self._supabase

    def resolve_user_profile(self, user_id: str) -> dict:
        """Retrieves and caches the user's company_id and role from the profiles table."""
        now = time.time()
        
        # Check cache
        if user_id in _profile_cache:
            cache_entry = _profile_cache[user_id]
            if now - cache_entry["cached_at"] < CACHE_TTL_SECONDS:
                return cache_entry["profile"]

        if not self.supabase:
            # Degraded/Mock fallback
            return {"company_id": None, "role": "user", "id": user_id}

        try:
            res = (
                self.supabase.table("profiles")
                .select("id, company_id, role")
                .eq("id", user_id)
                .single()
                .execute()
            )
            profile_data = res.data or {}
            
            # Cache the result
            _profile_cache[user_id] = {
                "profile": profile_data,
                "cached_at": now
            }
            return profile_data
        except Exception as e:
            logger.error(f"Error fetching user profile for {user_id}: {e}")
            # Fallback to no company_id (safe default)
            return {"company_id": None, "role": "user", "id": user_id}

    async def get_current_user_profile(self, request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> dict:
        """
        Extracts token, validates auth with Supabase, and returns the resolved profile.
        Supports mock tokens for testing/offline audits.
        """
        if not credentials:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication credentials missing."
            )
        
        token = credentials.credentials

        # --- MOCK TOKENS FOR TESTING / OFFLINE MODE ---
        if token.startswith("mock-token-"):
            parts = token.split("-")
            # Format: mock-token-[company_id]-[role]-[user_id]
            # e.g., mock-token-companyA-admin-user123
            company_id = parts[2] if len(parts) > 2 else "company-mock-default"
            role = parts[3] if len(parts) > 3 else "user"
            user_id = parts[4] if len(parts) > 4 else f"user-{company_id}-{role}"
            
            if company_id == "master":
                return {"id": "master-admin-id", "company_id": None, "role": "master_admin"}
            
            return {"id": user_id, "company_id": company_id, "role": role}

        if not self.supabase:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service not initialized."
            )

        try:
            # Validate token against Supabase Auth
            user_res = self.supabase.auth.get_user(token)
            if not user_res or not user_res.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token."
                )
            
            user = user_res.user
            profile = self.resolve_user_profile(user.id)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User profile not registered."
                )
            return profile

        except Exception as e:
            logger.warning(f"Auth verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed."
            )

    def verify_tenant_access(self, target_company_id: Optional[str], current_user: dict) -> None:
        """
        Verifies that the authenticated user belongs to the target company.
        Master Admins can access any company.
        """
        if current_user.get("role") == "master_admin":
            return  # Master admin bypass

        user_company_id = current_user.get("company_id")
        if not user_company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is not assigned to any tenant organization."
            )

        if target_company_id and str(target_company_id) != str(user_company_id):
            logger.warning(
                f"Tenant Access Spoofing Blocked: user {current_user.get('id')} "
                f"tried accessing company {target_company_id} (assigned: {user_company_id})"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permissions for this tenant."
            )

    def verify_resource_ownership(self, table_name: str, resource_id: str, current_user: dict) -> dict:
        """
        Verifies that a database resource (e.g. ticket) belongs to the authenticated user's company.
        Prevents Insecure Direct Object References (IDOR).
        """
        if current_user.get("role") == "master_admin":
            # Master Admin bypass, fetch directly
            if not self.supabase:
                return {}
            try:
                res = self.supabase.table(table_name).select("*").eq("id", resource_id).single().execute()
                return res.data or {}
            except Exception:
                raise HTTPException(status_code=404, detail=f"{table_name.capitalize()} not found.")

        user_company_id = current_user.get("company_id")
        if not user_company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: User has no tenant assignments."
            )

        # MOCK FALLBACK for testing
        if resource_id.startswith("mock-"):
            parts = resource_id.split("-")
            # Resource ID format: mock-[type]-[company_id]-[id]
            resource_company = parts[2] if len(parts) > 2 else "company-mock-default"
            if resource_company != user_company_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: Resource belongs to another organization."
                )
            return {"id": resource_id, "company_id": resource_company}

        if not self.supabase:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service not initialized."
            )

        try:
            # Query the table to check resource ownership.
            # We enforce company_id check in the SQL query itself for secure-by-design lookup
            res = (
                self.supabase.table(table_name)
                .select("*")
                .eq("id", resource_id)
                .eq("company_id", user_company_id)
                .execute()
            )
            if not res.data:
                # To prevent resource enumeration/enumeration attacks, we can either return 404 or 403.
                # Returning 404 makes it seem like the ticket doesn't exist, which is safer,
                # but if the ticket *does* exist in another company, returning 404 avoids leakage.
                # However, returning 403 or 404 depending on requirements. Let's return 404 to block scanning,
                # or check if it exists in another company to return 403. Returning 403 Forbidden is requested.
                # Let's do a quick check if it exists at all to differentiate 404 vs 403.
                exist_check = self.supabase.table(table_name).select("id").eq("id", resource_id).execute()
                if exist_check.data:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Access denied: Resource belongs to another organization."
                    )
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{table_name.capitalize()} not found."
                )
            
            return res.data[0]
        except APIError as e:
            logger.error(f"Supabase APIError in verify_resource_ownership: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database query error."
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error checking resource ownership: {e}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{table_name.capitalize()} not found."
            )

# Create singleton security manager
security_manager = TenantSecurityManager()
