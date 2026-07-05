import os
import json
from typing import List, Dict, Any

class KBIntegrationService:
    def __init__(self):
        # Local cache path for external KB articles
        self.cache_file = os.path.join(os.path.dirname(__file__), "..", "data", "external_kb_cache.json")
        os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
        
        # Pre-defined mock external documents across various platform sources
        self.mock_external_articles: List[Dict[str, Any]] = [
            {
                "title": "VPN Connectivity Issue Troubleshooting Guide",
                "content": "For network unreachable while connecting to VPN: 1. Verify you have a stable internet connection. 2. Restart your network adapter. 3. Check for DNS misconfigurations. 4. Change connection protocol in Cisco AnyConnect from IPsec to SSL. 5. If getting ERR_1024 or VPN Timeout, contact security unit to reset your authentication session.",
                "source": "Confluence",
                "category": "Network",
                "resolution_effectiveness": "95%",
                "url": "https://confluence.internal/wiki/spaces/IT/pages/1024"
            },
            {
                "title": "Office Printer Offline & Setup Guide",
                "content": "If the office printing device is not responding or offline: 1. Restart the Print Spooler service on Windows. 2. Clear all documents in the printing queue. 3. Reconnect to the shared printer IP. 4. Check paper jam sensor lights. 5. WFH VPN users must route printing jobs to the virtual print server.",
                "source": "Notion",
                "category": "Hardware",
                "resolution_effectiveness": "90%",
                "url": "https://notion.so/company/Office-Printer-Setup"
            },
            {
                "title": "Active Directory Password Reset & Login Policies",
                "content": "For authentication issues, login problems, and password resets: 1. Navigate to the self-service reset portal. 2. Check if your account is locked out after 3 failed login attempts. 3. Sync MFA device time to resolve invalid codes. 4. 401 Unauthorized errors usually indicate expired JWT session cookies; clearing browser cookies solves it.",
                "source": "SharePoint",
                "category": "Access",
                "resolution_effectiveness": "92%",
                "url": "https://sharepoint.internal/sites/HR/AD-Password-Reset"
            },
            {
                "title": "SSH Keys and Git Access Runbook",
                "content": "Runbook to troubleshoot Git access issues: 1. Regenerate your SSH key using ssh-keygen. 2. Ensure ssh-agent is running. 3. Add your public key to your GitLab / GitHub profile. 4. Verify connectivity using ssh -T git@github.com.",
                "source": "Internal Wiki",
                "category": "Software",
                "resolution_effectiveness": "88%",
                "url": "https://wiki.company.internal/git-access"
            },
            {
                "title": "Database Timeout ERR_5002 Recovery Runbook",
                "content": "Runbook to resolve database timeout (ERR_5002) and pool exhaustion: 1. Monitor active connection pools. 2. Temporarily increase pool size limit. 3. Clean up dangling postgres connections. 4. Restart the DB-PROD-01 instance if thread locking occurs.",
                "source": "Runbooks",
                "category": "Software",
                "resolution_effectiveness": "96%",
                "url": "https://runbooks.internal/db-timeout-5002"
            },
            {
                "title": "MFA Mobile App Re-registration FAQ",
                "content": "FAQ for Multi-Factor Authentication: If you get a new device or your MFA token fails, visit the self-service IT registration desk. Scan the QR code, backup your key codes, and contact the Security Team to delete your old device record.",
                "source": "FAQ Systems",
                "category": "Access",
                "resolution_effectiveness": "94%",
                "url": "https://faq.company.net/mfa-setup"
            }
        ]

    def sync_external_kb(self, supabase_client: Any = None, model: Any = None) -> Dict[str, Any]:
        """
        Synchronize mock external KB articles into Supabase (if available) or write to local cache.
        """
        synced_count = 0
        local_sync = False

        # Generate embeddings and save to local cache
        cache_data = []
        for article in self.mock_external_articles:
            doc_text = article["title"] + " " + article["content"]
            embedding = None
            if model is not None:
                try:
                    embedding = model.encode(doc_text).tolist()
                except Exception as e:
                    print(f"[KBIntegrationService] Failed to embed article: {e}")
            
            cache_data.append({
                **article,
                "embedding": embedding
            })

        try:
            with open(self.cache_file, "w") as f:
                json.dump(cache_data, f, indent=2)
            print(f"[KBIntegrationService] Synced {len(cache_data)} articles to local cache: {self.cache_file}")
            synced_count = len(cache_data)
            local_sync = True
        except Exception as e:
            print(f"[KBIntegrationService] Failed writing local cache: {e}")

        # Insert to Supabase if client is available
        if supabase_client is not None:
            try:
                for article in cache_data:
                    # check if already exists to prevent duplication
                    res = supabase_client.table("knowledge_base").select("id").eq("title", article["title"]).execute()
                    if not res.data:
                        insert_data = {
                            "title": article["title"],
                            "content": article["content"],
                            "category": article["category"],
                            "embedding": article["embedding"]
                            # Note: Supabase columns might be limited, but we insert whatever columns it has.
                        }
                        supabase_client.table("knowledge_base").insert(insert_data).execute()
                print("[KBIntegrationService] Synced articles to Supabase knowledge_base table.")
                local_sync = False
            except Exception as e:
                print(f"[KBIntegrationService] Supabase sync failed (will use cache): {e}")

        return {
            "status": "success",
            "synced_count": synced_count,
            "local_sync": local_sync
        }

    def get_external_kb_articles(self, supabase_client: Any = None) -> List[Dict[str, Any]]:
        """
        Retrieve all synced articles from local cache or Supabase.
        """
        # If Supabase is available, query it
        if supabase_client is not None:
            try:
                res = supabase_client.table("knowledge_base").select("*").execute()
                if res.data:
                    # Map to include source and effectiveness since it might not be in DB columns
                    enriched_articles = []
                    for doc in res.data:
                        # find original mock article details if available
                        match = next((a for a in self.mock_external_articles if a["title"] == doc.get("title")), None)
                        enriched_articles.append({
                            "title": doc.get("title") or "",
                            "content": doc.get("content") or "",
                            "source": match.get("source") if match else "Wiki",
                            "category": doc.get("category") or "General",
                            "resolution_effectiveness": match.get("resolution_effectiveness") if match else "90%",
                            "url": match.get("url") if match else None,
                            "embedding": doc.get("embedding"),
                            "created_at": doc.get("created_at")
                        })
                    return enriched_articles
            except Exception as e:
                print(f"[KBIntegrationService] Failed to fetch from Supabase (falling back to cache): {e}")

        # Fallback to local cache file
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[KBIntegrationService] Error reading cache file: {e}")

        # Final fallback to raw mock articles
        return self.mock_external_articles
