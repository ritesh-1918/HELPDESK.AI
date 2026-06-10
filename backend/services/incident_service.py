"""
Incident Service: Manages incident lifecycle — creation, update, resolution, and escalation.
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List
from enum import Enum

from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[IncidentService] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
VALID_STATUSES = {"open", "in_progress", "resolved", "closed", "escalated"}
VALID_PRIORITIES = {"Critical", "High", "Medium", "Low"}
SLA_HOURS = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}


class IncidentStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    ESCALATED = "escalated"


class IncidentService:
    """Service for managing incident creation, updates, resolution, and escalation."""

    def __init__(self, supabase_client=None):
        if supabase_client is not None:
            self.supabase = supabase_client
        else:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
            if url and key:
                self.supabase = create_client(url, key)
            else:
                self.supabase = None
                logger.warning("Supabase credentials not found. IncidentService running in degraded mode.")

    def create_incident(
        self,
        title: str,
        description: str,
        priority: str = "Medium",
        category: str = "General",
        reported_by: Optional[str] = None,
        company_id: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> Dict:
        if not title or not title.strip():
            raise ValueError("Incident title is required and cannot be empty.")
        if not description or not description.strip():
            raise ValueError("Incident description is required and cannot be empty.")
        if priority not in VALID_PRIORITIES:
            raise ValueError(
                f"Invalid priority '{priority}'. Must be one of: {', '.join(sorted(VALID_PRIORITIES))}"
            )
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        now = datetime.now(timezone.utc).isoformat()
        sla_hours = SLA_HOURS.get(priority, 72)
        sla_breach_at = (datetime.now(timezone.utc) + timedelta(hours=sla_hours)).isoformat()

        record = {
            "title": title.strip(),
            "description": description.strip(),
            "priority": priority,
            "category": category,
            "status": IncidentStatus.OPEN.value,
            "reported_by": reported_by,
            "company_id": company_id,
            "metadata": metadata or {},
            "created_at": now,
            "updated_at": now,
            "sla_breach_at": sla_breach_at,
        }

        try:
            response = self.supabase.table("incidents").insert(record).execute()
        except Exception as exc:
            logger.error(f"Failed to create incident: {exc}")
            raise RuntimeError(f"Database insert failed: {exc}") from exc

        if not response.data:
            raise RuntimeError("Incident creation returned no data.")

        created = response.data[0]
        logger.info(f"Incident created | id={created.get('id')} | priority={priority}")
        return created

    def update_incident(self, incident_id: str, updates: Dict) -> Dict:
        if not incident_id or not incident_id.strip():
            raise ValueError("incident_id is required.")
        if not updates:
            raise ValueError("No updates provided.")
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        allowed_fields = {
            "title", "description", "priority", "category",
            "status", "assigned_to", "metadata",
        }
        sanitized = {k: v for k, v in updates.items() if k in allowed_fields}

        if not sanitized:
            raise ValueError(
                f"No valid fields to update. Allowed: {', '.join(sorted(allowed_fields))}"
            )

        if "priority" in sanitized and sanitized["priority"] not in VALID_PRIORITIES:
            raise ValueError(
                f"Invalid priority '{sanitized['priority']}'. "
                f"Must be one of: {', '.join(sorted(VALID_PRIORITIES))}"
            )

        if "status" in sanitized and sanitized["status"] not in VALID_STATUSES:
            raise ValueError(
                f"Invalid status '{sanitized['status']}'. "
                f"Must be one of: {', '.join(sorted(VALID_STATUSES))}"
            )

        sanitized["updated_at"] = datetime.now(timezone.utc).isoformat()

        try:
            response = (
                self.supabase.table("incidents")
                .update(sanitized)
                .eq("id", incident_id)
                .execute()
            )
        except Exception as exc:
            logger.error(f"Failed to update incident {incident_id}: {exc}")
            raise RuntimeError(f"Database update failed: {exc}") from exc

        if not response.data:
            raise RuntimeError(f"Incident '{incident_id}' not found.")

        updated = response.data[0]
        logger.info(f"Incident updated | id={incident_id} | fields={list(sanitized.keys())}")
        return updated

    def resolve_incident(
        self,
        incident_id: str,
        resolution_notes: str = "",
        resolved_by: Optional[str] = None,
    ) -> Dict:
        if not incident_id or not incident_id.strip():
            raise ValueError("incident_id is required.")
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        now = datetime.now(timezone.utc).isoformat()

        payload = {
            "status": IncidentStatus.RESOLVED.value,
            "resolved_at": now,
            "updated_at": now,
            "resolution_notes": resolution_notes,
        }
        if resolved_by:
            payload["resolved_by"] = resolved_by

        try:
            response = (
                self.supabase.table("incidents")
                .update(payload)
                .eq("id", incident_id)
                .execute()
            )
        except Exception as exc:
            logger.error(f"Failed to resolve incident {incident_id}: {exc}")
            raise RuntimeError(f"Database update failed: {exc}") from exc

        if not response.data:
            raise RuntimeError(f"Incident '{incident_id}' not found.")

        resolved = response.data[0]
        logger.info(f"Incident resolved | id={incident_id}")
        return resolved

    def escalate_incident(
        self,
        incident_id: str,
        reason: str = "",
        escalated_to: Optional[str] = None,
    ) -> Dict:
        if not incident_id or not incident_id.strip():
            raise ValueError("incident_id is required.")
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        now = datetime.now(timezone.utc).isoformat()

        payload = {
            "status": IncidentStatus.ESCALATED.value,
            "escalated_at": now,
            "updated_at": now,
            "escalation_reason": reason,
        }
        if escalated_to:
            payload["escalated_to"] = escalated_to

        try:
            response = (
                self.supabase.table("incidents")
                .update(payload)
                .eq("id", incident_id)
                .execute()
            )
        except Exception as exc:
            logger.error(f"Failed to escalate incident {incident_id}: {exc}")
            raise RuntimeError(f"Database update failed: {exc}") from exc

        if not response.data:
            raise RuntimeError(f"Incident '{incident_id}' not found.")

        escalated = response.data[0]
        logger.info(f"Incident escalated | id={incident_id} | reason={reason}")
        return escalated

    def get_incident(self, incident_id: str) -> Optional[Dict]:
        if not incident_id or not incident_id.strip():
            raise ValueError("incident_id is required.")
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        try:
            response = (
                self.supabase.table("incidents")
                .select("*")
                .eq("id", incident_id)
                .single()
                .execute()
            )
            return response.data
        except Exception:
            return None

    def list_incidents(
        self,
        company_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict]:
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        query = (
            self.supabase.table("incidents")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
        )

        if company_id:
            query = query.eq("company_id", company_id)
        if status:
            if status not in VALID_STATUSES:
                raise ValueError(
                    f"Invalid status filter '{status}'. "
                    f"Must be one of: {', '.join(sorted(VALID_STATUSES))}"
                )
            query = query.eq("status", status)

        try:
            response = query.execute()
            return response.data or []
        except Exception as exc:
            logger.error(f"Failed to list incidents: {exc}")
            return []

    def get_sla_breached_incidents(self, company_id: Optional[str] = None) -> List[Dict]:
        if not self.supabase:
            raise ConnectionError("Database connection not available.")

        now = datetime.now(timezone.utc).isoformat()

        query = (
            self.supabase.table("incidents")
            .select("*")
            .in_("status", [IncidentStatus.OPEN.value, IncidentStatus.IN_PROGRESS.value])
            .lt("sla_breach_at", now)
        )

        if company_id:
            query = query.eq("company_id", company_id)

        try:
            response = query.execute()
            return response.data or []
        except Exception as exc:
            logger.error(f"Failed to fetch SLA-breached incidents: {exc}")
            return []


_instance: Optional[IncidentService] = None


def load() -> IncidentService:
    global _instance
    if _instance is None:
        _instance = IncidentService()
        logger.info("IncidentService loaded")
    return _instance


def get_instance() -> Optional[IncidentService]:
    return _instance


# --- Incident Correlation Service ---

import time
import uuid

try:
    from sentence_transformers import util
except ImportError:
    util = None

CORRELATION_THRESHOLD = float(os.environ.get("INCIDENT_CORRELATION_THRESHOLD", "0.70"))
WINDOW_SECONDS = int(os.environ.get("INCIDENT_WINDOW_SECONDS", "600"))
TICKET_TRIGGER = int(os.environ.get("INCIDENT_TICKET_TRIGGER", "20"))
USER_TRIGGER = int(os.environ.get("INCIDENT_USER_TRIGGER", "50"))
CRITICAL_TICKET_TRIGGER = int(os.environ.get("INCIDENT_CRITICAL_TRIGGER", "5"))


class IncidentCorrelationService:
    def __init__(self, duplicate_service):
        self._duplicate_service = duplicate_service
        self._recent: list[dict] = []
        self._incidents: dict[str, dict] = {}

    def _prune(self, now: float) -> None:
        cutoff = now - WINDOW_SECONDS
        self._recent = [t for t in self._recent if t["ts"] >= cutoff]

    def _is_critical(self, priority: str | None, category: str | None) -> bool:
        if priority and str(priority).lower() == "critical":
            return True
        if category and str(category).lower() in {"email", "network", "authentication", "exchange"}:
            return True
        return False

    def correlate(
        self,
        text: str,
        user_id: str | None = None,
        category: str | None = None,
        priority: str | None = None,
        ticket_id: str | None = None,
    ) -> dict:
        self._duplicate_service.load()
        model = self._duplicate_service.model
        if model is None or util is None:
            return {
                "incident_id": None,
                "is_major_incident": False,
                "ticket_count": 0,
                "affected_users": 0,
                "similarity": 0.0,
            }

        now = time.time()
        self._prune(now)

        embedding = model.encode(text, convert_to_tensor=True)

        best_id = None
        best_score = 0.0
        for inc_id, inc in self._incidents.items():
            if inc["last_seen"] < now - WINDOW_SECONDS:
                continue
            score = util.cos_sim(embedding, inc["centroid"]).item()
            if score > best_score:
                best_score = score
                best_id = inc_id

        if best_id is not None and best_score >= CORRELATION_THRESHOLD:
            incident = self._incidents[best_id]
            n = len(incident["ticket_ids"])
            incident["centroid"] = (incident["centroid"] * n + embedding) / (n + 1)
            incident["ticket_ids"].append(ticket_id or str(uuid.uuid4()))
            if user_id:
                incident["user_ids"].add(str(user_id))
            incident["last_seen"] = now
            if priority and str(priority).lower() == "critical":
                incident["priority"] = "Critical"
        else:
            incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
            incident = {
                "id": incident_id,
                "centroid": embedding,
                "ticket_ids": [ticket_id or str(uuid.uuid4())],
                "user_ids": {str(user_id)} if user_id else set(),
                "category": category,
                "priority": priority,
                "first_seen": now,
                "last_seen": now,
                "is_major": False,
                "sample_text": text[:200],
            }
            self._incidents[incident_id] = incident

        self._recent.append({
            "ticket_id": ticket_id,
            "embedding": embedding,
            "user_id": user_id,
            "category": category,
            "priority": priority,
            "ts": now,
            "incident_id": incident["id"],
        })

        ticket_count = len(incident["ticket_ids"])
        affected_users = len(incident["user_ids"])
        critical = self._is_critical(incident.get("priority"), incident.get("category"))
        trigger = CRITICAL_TICKET_TRIGGER if critical else TICKET_TRIGGER
        if not incident["is_major"] and (
            ticket_count >= trigger or affected_users >= USER_TRIGGER
        ):
            incident["is_major"] = True
            print(
                f"[IncidentService] MAJOR INCIDENT opened: {incident['id']} "
                f"tickets={ticket_count} users={affected_users} critical={critical}"
            )

        return {
            "incident_id": incident["id"],
            "is_major_incident": incident["is_major"],
            "ticket_count": ticket_count,
            "affected_users": affected_users,
            "similarity": round(best_score, 4),
        }

    def list_active(self) -> list[dict]:
        now = time.time()
        out = []
        for inc in self._incidents.values():
            if inc["last_seen"] < now - WINDOW_SECONDS:
                continue
            out.append({
                "incident_id": inc["id"],
                "is_major_incident": inc["is_major"],
                "ticket_count": len(inc["ticket_ids"]),
                "affected_users": len(inc["user_ids"]),
                "category": inc.get("category"),
                "priority": inc.get("priority"),
                "first_seen": inc["first_seen"],
                "last_seen": inc["last_seen"],
                "sample_text": inc.get("sample_text", ""),
            })
        out.sort(key=lambda x: x["last_seen"], reverse=True)
        return out
