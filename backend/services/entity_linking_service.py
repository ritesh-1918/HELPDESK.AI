"""
Entity Linking Service — Resolves extracted entity mentions to canonical resource IDs
in the asset inventory (Supabase knowledge_graph_nodes) and handles alias/synonym mapping.
"""

import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Fallback offline seed database for robustness (matches schema sql values)
OFFLINE_ASSETS = [
    {
        "id": "server_001",
        "name": "Server-01",
        "type": "SERVER",
        "metadata": {
            "ip": "192.168.1.10",
            "team": "Infrastructure",
            "location": "Data Center A",
            "aliases": ["Server-01", "Server01", "SRV-01", "srv-01"]
        }
    },
    {
        "id": "server_002",
        "name": "Server-02",
        "type": "SERVER",
        "metadata": {
            "ip": "192.168.1.11",
            "team": "Infrastructure",
            "location": "Data Center B",
            "aliases": ["Server-02", "Server02", "SRV-02", "srv-02"]
        }
    },
    {
        "id": "database_prod_01",
        "name": "MySQL-DB",
        "type": "DATABASE",
        "metadata": {
            "db_type": "MySQL",
            "team": "Database Administration",
            "role": "production",
            "aliases": ["DB-01", "Database-01", "MYSQL-PROD", "MySQL-DB", "MySQL Database", "Database-A"]
        }
    },
    {
        "id": "database_prod_02",
        "name": "PostgreSQL-DB",
        "type": "DATABASE",
        "metadata": {
            "db_type": "Postgres",
            "team": "Database Administration",
            "role": "production",
            "aliases": ["DB-02", "Database-02", "POSTGRES-PROD", "Postgres-DB", "Postgres Database"]
        }
    },
    {
        "id": "crm_service",
        "name": "CRM Service",
        "type": "SERVICE",
        "metadata": {
            "owner": "CRM Team",
            "criticality": "high",
            "aliases": ["CRM", "CRM Service", "CRM-Service", "CRM app", "CRM Service App"]
        }
    },
    {
        "id": "billing_api",
        "name": "Billing API",
        "type": "API",
        "metadata": {
            "owner": "Finance Tech Team",
            "version": "v2",
            "aliases": ["Billing API", "Billing-API", "Billing Endpoint", "Billing-Service"]
        }
    },
    {
        "id": "infrastructure_team",
        "name": "Infrastructure Team",
        "type": "TEAM",
        "metadata": {
            "lead": "Alice Manager",
            "aliases": ["Infrastructure Team", "Infrastructure", "Infra", "Sysadmin"]
        }
    },
    {
        "id": "dba_team",
        "name": "Database Administration Team",
        "type": "TEAM",
        "metadata": {
            "lead": "Bob Admin",
            "aliases": ["Database Administration Team", "DBA Team", "DBA", "Database Team"]
        }
    },
    {
        "id": "iam_team",
        "name": "IAM Team",
        "type": "TEAM",
        "metadata": {
            "lead": "Charlie Sec",
            "aliases": ["IAM Team", "IAM", "Security Team", "Identity Team"]
        }
    }
]

class EntityLinkingService:
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self._cached_assets = None

    def fetch_inventory_assets(self) -> List[Dict[str, Any]]:
        """Fetch all canonical nodes from database or return offline seed data."""
        if self._cached_assets:
            return self._cached_assets

        if not self.supabase:
            return OFFLINE_ASSETS

        try:
            res = self.supabase.table("knowledge_graph_nodes").select("*").execute()
            if res.data:
                self._cached_assets = res.data
                return res.data
        except Exception as e:
            logger.warning(f"Could not load assets from Supabase, using local catalog: {e}")
            
        return OFFLINE_ASSETS

    def link_entities(self, extracted_entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Links extracted mentions to canonical inventory resource nodes.
        Resolves aliases and expands entity dictionaries with canonical metadata.
        """
        inventory = self.fetch_inventory_assets()
        linked_list = []

        for entity_info in extracted_entities:
            entity_text = entity_info.get("entity", "").strip()
            entity_type = entity_info.get("type", "")
            
            resolved_node = None
            
            # 1. Look for matching name or aliases
            for node in inventory:
                name = node.get("name", "")
                aliases = node.get("metadata", {}).get("aliases", [])
                
                # Check case-insensitive exact name
                if name.lower() == entity_text.lower():
                    resolved_node = node
                    break
                    
                # Check aliases list
                if any(alias.lower() == entity_text.lower() for alias in aliases):
                    resolved_node = node
                    break

            if resolved_node:
                # Build canonical link response
                linked_item = {
                    "entity": entity_text,
                    "type": resolved_node.get("type", entity_type),
                    "canonical_id": resolved_node.get("id"),
                    "confidence": entity_info.get("confidence", 0.95),
                    "start": entity_info.get("start"),
                    "end": entity_info.get("end")
                }
                
                # Expand with metadata fields
                meta = resolved_node.get("metadata", {})
                for key, val in meta.items():
                    if key != "aliases":
                        linked_item[key] = val
                
                # Backfill standard keys if not present
                if "team" not in linked_item and "owner" in meta:
                    linked_item["team"] = meta["owner"]
                if "location" not in linked_item and "location" in meta:
                    linked_item["location"] = meta["location"]
                    
                linked_list.append(linked_item)
            else:
                # If unlinked, generate standard self-referential entry
                slug_id = re.sub(r"[^\w\d-]", "_", entity_text.lower())
                linked_list.append({
                    "entity": entity_text,
                    "type": entity_type,
                    "canonical_id": f"gen_{slug_id}",
                    "confidence": entity_info.get("confidence", 0.90),
                    "start": entity_info.get("start"),
                    "end": entity_info.get("end")
                })

        return linked_list
