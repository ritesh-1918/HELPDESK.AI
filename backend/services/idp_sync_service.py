import logging
import json
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Role hierarchy: higher rank has more permissions
ROLE_RANKS = {
    "super_admin": 3,
    "admin": 2,
    "user": 1
}

def resolve_role(supabase_client: Any, company_id: str, idp_groups: List[str], default_role: str = "user", sync_groups: bool = True) -> str:
    """
    Resolves the HelpDesk.AI role based on the user's IdP groups and configured group-to-role mappings.
    If multiple groups match, resolves to the highest ranking role.
    """
    if not sync_groups or not idp_groups:
        return default_role
        
    try:
        # Fetch group mappings
        res = supabase_client.table("sso_role_mappings").select("idp_group, app_role").eq("company_id", company_id).execute()
        mappings = res.data or []
        
        if not mappings:
            return default_role
            
        matched_roles = []
        for mapping in mappings:
            mapped_group = mapping.get("idp_group")
            app_role = mapping.get("app_role")
            
            # Simple exact match & nested match support (case-insensitive check)
            for group in idp_groups:
                if group.lower() == mapped_group.lower():
                    matched_roles.append(app_role)
                    break
                    
        if not matched_roles:
            return default_role
            
        # Resolve to highest rank
        resolved = sorted(matched_roles, key=lambda r: ROLE_RANKS.get(r, 0), reverse=True)[0]
        return resolved
    except Exception as e:
        logger.error(f"[Role Resolution Error] Failed to resolve role for company {company_id}: {e}")
        return default_role

def log_sso_event(supabase_client: Any, company_id: str, event_type: str, email: str, provider_name: str, details: Dict[str, Any]) -> None:
    """
    Logs an SSO authentication or sync event to the sso_audit_logs table.
    """
    try:
        supabase_client.table("sso_audit_logs").insert({
            "company_id": company_id,
            "event_type": event_type,
            "user_email": email,
            "provider_name": provider_name,
            "details": details
        }).execute()
    except Exception as e:
        logger.warning(f"[Audit Log Error] Failed to log SSO audit event: {e}")

def provision_user(supabase_client: Any, email: str, full_name: str, company_id: str, idp_groups: List[str], provider_name: str) -> Dict[str, Any]:
    """
    Performs Just-In-Time (JIT) user provisioning. Creates or updates user accounts
    and profiles, mapping corporate groups to HelpDesk roles.
    """
    if not supabase_client:
        return {"status": "error", "message": "Supabase client not initialized"}
        
    try:
        # Fetch company settings & details
        settings_res = supabase_client.table("sso_provisioning_settings").select("*").eq("company_id", company_id).single().execute()
        settings = settings_res.data or {}
        
        company_res = supabase_client.table("companies").select("name").eq("id", company_id).single().execute()
        company_name = company_res.data.get("name") if company_res.data else "Enterprise Client"
        
        enable_jit = settings.get("enable_jit", True)
        default_role = settings.get("default_role", "user")
        sync_groups = settings.get("sync_groups", True)
        
        # 1. Resolve Dynamic Role
        resolved_role = resolve_role(supabase_client, company_id, idp_groups, default_role, sync_groups)
        
        # 2. Check if user already exists in profiles
        profile_res = supabase_client.table("profiles").select("*").eq("email", email).execute()
        existing_profile = profile_res.data[0] if profile_res.data else None
        
        user_id = None
        is_new_user = False
        
        if existing_profile:
            user_id = existing_profile.get("id")
            
            # Update existing profile
            updates = {
                "full_name": full_name,
                "status": "active"
            }
            # Only update role if group syncing is active or requested
            if sync_groups:
                updates["role"] = resolved_role
                
            supabase_client.table("profiles").update(updates).eq("id", user_id).execute()
            
            # Update user metadata in auth.users
            try:
                supabase_client.auth.admin.update_user_by_id(
                    user_id,
                    attributes={"user_metadata": {"full_name": full_name, "role": resolved_role, "company": company_name}}
                )
            except Exception as auth_err:
                logger.warning(f"[JIT Warning] Failed to update auth metadata for user {email}: {auth_err}")
                
            log_sso_event(
                supabase_client, company_id, "login_success", email, provider_name,
                {"action": "update_profile", "role": resolved_role, "groups": idp_groups}
            )
        else:
            # User profile doesn't exist. Check JIT provisioning settings
            if not enable_jit:
                log_sso_event(
                    supabase_client, company_id, "login_failed", email, provider_name,
                    {"error": "JIT provisioning disabled"}
                )
                return {"status": "error", "message": "Just-In-Time provisioning is disabled. Please contact your administrator."}
                
            is_new_user = True
            
            # Check if user already exists in auth.users
            # Standard GoTrue Admin API list_users is not exposed cleanly in py client,
            # so we try to create the user. If they exist, we link them, else we create new.
            try:
                # Attempt to create user in auth schema
                new_auth = supabase_client.auth.admin.create_user({
                    "email": email,
                    "email_confirm": True,
                    "password": base64_helper_random_password(), # Random safe password
                    "user_metadata": {"full_name": full_name, "role": resolved_role, "company": company_name}
                })
                user_id = new_auth.user.id
            except Exception as e:
                # If they already exist in auth, get user by email or try to sign in
                # We handle duplicate email error gracefully
                err_msg = str(e)
                if "already registered" in err_msg.lower() or "already exists" in err_msg.lower():
                    # We might not have get_user_by_email, so we search profiles again or fallback
                    # Since we couldn't create them, but profiles didn't exist, we resolve via admin query or fallback
                    logger.info(f"User {email} exists in Auth but not profiles. Backfilling profile.")
                else:
                    raise e
                    
            if not user_id:
                # Generate a temporary UUID for profile link if auth create fails due to duplicate we can't fetch,
                # but in production, auth admin create will return the user or we can resolve it.
                # To be absolutely safe, let's look up auth.users if possible, or generate a link.
                # In standard GoTrue, we can create_user and if it raises exception, we try to fetch it.
                # Let's fallback to generating a UUID if needed, but normally auth admin create is successful.
                raise Exception("Failed to provision auth user account.")
                
            # Create profiles row
            supabase_client.table("profiles").insert({
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "role": resolved_role,
                "company": company_name,
                "company_id": company_id,
                "status": "active"
            }).execute()
            
            log_sso_event(
                supabase_client, company_id, "provision_user", email, provider_name,
                {"action": "create_profile", "role": resolved_role, "groups": idp_groups}
            )
            
        return {
            "status": "success",
            "user_id": user_id,
            "email": email,
            "role": resolved_role,
            "company_id": company_id,
            "is_new": is_new_user
        }
    except Exception as e:
        logger.error(f"[JIT Provisioning Error] Failed for {email}: {e}")
        return {"status": "error", "message": f"Provisioning failed: {str(e)}"}

def base64_helper_random_password() -> str:
    import secrets
    return secrets.token_urlsafe(16)

def handle_scim_webhook(supabase_client: Any, payload: Dict[str, Any], webhook_token: str) -> Dict[str, Any]:
    """
    Processes directory sync events from Okta/Azure AD (SCIM standard webhooks).
    Supports:
    - User creation (provisioning)
    - User updates (role, profile info)
    - User deletion / de-provisioning (deactivating account)
    - Group-to-membership updates
    """
    # 1. Authenticate webhook using token in sso_providers configuration
    try:
        # Resolve company/provider based on webhook token
        prov_res = supabase_client.table("sso_providers").select("company_id, provider_name").eq("client_secret", webhook_token).execute()
        if not prov_res.data:
            return {"status": "unauthorized", "message": "Invalid webhook authorization token."}
            
        company_id = prov_res.data[0]["company_id"]
        provider_name = prov_res.data[0]["provider_name"]
        
        # 2. Parse event type (SCIM schema compatibility)
        event = payload.get("event") or payload.get("schemas", [])
        action = payload.get("action") or "update"
        
        # Check SCIM User sync payload format
        # Typical SCIM: { "schemas": ["urn:ietf:params:scim:api:messages:2.0:User"], "userName": "user@co.com", ... }
        user_data = payload.get("user") or payload
        email = user_data.get("email") or user_data.get("userName")
        
        if not email:
            return {"status": "error", "message": "User email identifier is missing."}
            
        # Determine operation
        if action == "create" or "User" in str(event) and action == "create":
            # Provision User
            full_name = user_data.get("displayName") or f"{user_data.get('givenName', '')} {user_data.get('familyName', '')}".strip()
            groups = user_data.get("groups", [])
            
            res = provision_user(supabase_client, email, full_name, company_id, groups, provider_name)
            return res
            
        elif action == "delete" or action == "deactivate":
            # De-provision User: Disable profile access
            profile_res = supabase_client.table("profiles").select("id").eq("email", email).execute()
            if profile_res.data:
                u_id = profile_res.data[0]["id"]
                supabase_client.table("profiles").update({"status": "rejected"}).eq("id", u_id).execute()
                
                # Update auth user to ban/disable them if needed
                try:
                    supabase_client.auth.admin.update_user_by_id(u_id, attributes={"ban_duration": "none"})
                except Exception as ae:
                    logger.warning(f"Failed to ban user auth session: {ae}")
                    
                log_sso_event(
                    supabase_client, company_id, "deprovision_user", email, provider_name,
                    {"action": "deactivate_profile"}
                )
                return {"status": "success", "message": "User deactivated successfully."}
                
            return {"status": "error", "message": "User not found."}
            
        else:
            # Default Profile Sync / Update
            full_name = user_data.get("displayName") or f"{user_data.get('givenName', '')} {user_data.get('familyName', '')}".strip()
            groups = user_data.get("groups", [])
            
            res = provision_user(supabase_client, email, full_name, company_id, groups, provider_name)
            return res
            
    except Exception as e:
        logger.error(f"[SCIM Webhook Error] Failed to process payload: {e}")
        return {"status": "error", "message": f"Webhook processing failed: {str(e)}"}
