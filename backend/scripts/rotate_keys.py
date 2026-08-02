import os
import sys
import json
import logging

# Ensure project root is on path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

try:
    from supabase import create_client
except ImportError:
    print("[Error] supabase package is not installed.")
    sys.exit(1)

from backend.security.encryption_manager import (
    get_active_key_version,
    encrypt_field,
    decrypt_field,
    log_audit_event,
)

logger = logging.getLogger("rotate_keys")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[KeyRotation] %(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(handler)

def run_rotation():
    # Initialize Supabase client
    url = os.environ.get("SUPABASE_URL")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not service_key:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY not configured in environment variables.")
        sys.exit(1)
        
    supabase = create_client(url, service_key)
    logger.info("Connected to Supabase. Starting key rotation sweep...")
    
    try:
        # Fetch all tickets with PII fields
        res = supabase.table("tickets").select("id, company_id, contact_email, description, raw_text").execute()
        tickets = res.data or []
    except Exception as e:
        logger.error(f"Failed to fetch tickets from database: {e}")
        sys.exit(1)
        
    logger.info(f"Found {len(tickets)} tickets to evaluate.")
    
    reencrypted_count = 0
    skipped_count = 0
    failed_count = 0
    
    # Cache active versions per tenant
    active_versions = {}
    
    for ticket in tickets:
        ticket_id = ticket["id"]
        company_id = ticket.get("company_id") or "global"
        
        # Resolve active version for tenant
        if company_id not in active_versions:
            try:
                active_versions[company_id] = get_active_key_version(company_id)
            except Exception as e:
                logger.error(f"Failed to get active key version for tenant {company_id}: {e}")
                skipped_count += 1
                continue
                
        active_version = active_versions[company_id]
        needs_update = False
        updates = {}
        
        for field in ["contact_email", "description", "raw_text"]:
            val = ticket.get(field)
            if not val:
                continue
                
            is_old_format = True
            current_version = 0
            
            try:
                stripped = val.strip()
                if stripped.startswith("{") and stripped.endswith("}"):
                    payload = json.loads(stripped)
                    if all(k in payload for k in ("ciphertext", "iv", "tag", "key_version")):
                        is_old_format = False
                        current_version = int(payload["key_version"])
            except Exception:
                pass
                
            # Re-encrypt if using old unversioned format or older key version
            if is_old_format or current_version < active_version:
                logger.info(f"Ticket {ticket_id} field {field} uses key version {current_version} (active: {active_version}). Re-encrypting...")
                
                # Decrypt using the current/legacy credentials
                decrypted = decrypt_field(val, tenant_id=company_id, field_name=field)
                
                # If decryption returned the exact ciphertext, decryption failed. Skip to prevent data loss.
                if decrypted == val:
                    logger.warning(f"Failed to decrypt field {field} for ticket {ticket_id}. Skipping to prevent data loss.")
                    failed_count += 1
                    needs_update = False
                    break
                    
                try:
                    # Encrypt using the active key version
                    encrypted = encrypt_field(decrypted, tenant_id=company_id, field_name=field)
                    if encrypted == decrypted:
                        raise ValueError("Encryption failed, returned original plaintext.")
                    updates[field] = encrypted
                    needs_update = True
                except Exception as e:
                    logger.error(f"Failed to encrypt field {field} for ticket {ticket_id}: {e}")
                    failed_count += 1
                    needs_update = False
                    break
                    
        if needs_update and updates:
            try:
                supabase.table("tickets").update(updates).eq("id", ticket_id).execute()
                reencrypted_count += 1
                
                # Log re-encryption success
                for field in updates.keys():
                    log_audit_event("RE-ENCRYPT", company_id, field, active_version, "SUCCESS")
                logger.info(f"Re-encrypted ticket {ticket_id} successfully.")
            except Exception as e:
                logger.error(f"Failed to update database for ticket {ticket_id}: {e}")
                failed_count += 1
        else:
            skipped_count += 1
            
    logger.info(f"Sweep complete. Re-encrypted: {reencrypted_count}, Skipped/Current: {skipped_count}, Failed: {failed_count}")

if __name__ == "__main__":
    run_rotation()
