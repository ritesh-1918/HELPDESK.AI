"""
Incident Correlation Service
Detects enterprise-wide outages by clustering semantically similar tickets
inside a rolling time window. When configurable thresholds (ticket count,
affected users, critical category) are exceeded, an active Major Incident
is opened automatically.

Reuses the embedding model owned by DuplicateService to avoid loading a
second copy of all-MiniLM-L6-v2.
"""

import os
import time
import uuid

try:
    from sentence_transformers import util
except ImportError:
    util = None


# Defaults are tunable via env without code changes.
CORRELATION_THRESHOLD = float(os.environ.get("INCIDENT_CORRELATION_THRESHOLD", "0.70"))
WINDOW_SECONDS = int(os.environ.get("INCIDENT_WINDOW_SECONDS", "600"))            # 10 minutes
TICKET_TRIGGER = int(os.environ.get("INCIDENT_TICKET_TRIGGER", "20"))             # 20+ tickets
USER_TRIGGER = int(os.environ.get("INCIDENT_USER_TRIGGER", "50"))                 # 50+ affected users
CRITICAL_TICKET_TRIGGER = int(os.environ.get("INCIDENT_CRITICAL_TRIGGER", "5"))   # critical service lower bar


class IncidentService:
    def __init__(self, duplicate_service):
        # Embedding model is owned by DuplicateService — share it.
        self._duplicate_service = duplicate_service
        # Recent tickets: list of dicts {ticket_id, embedding, user_id, category, priority, ts, incident_id}
        self._recent: list[dict] = []
        # Active incidents: incident_id -> {id, centroid, ticket_ids, user_ids, category, priority, first_seen, last_seen, is_major}
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
        """Correlate a new ticket against the active rolling window."""
        # Lazily ensure embedding model is loaded.
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

        # Find best matching active incident by centroid similarity.
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
            # Running-average centroid keeps the cluster stable as it grows.
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

        # Track ticket in rolling window.
        self._recent.append({
            "ticket_id": ticket_id,
            "embedding": embedding,
            "user_id": user_id,
            "category": category,
            "priority": priority,
            "ts": now,
            "incident_id": incident["id"],
        })

        # Promote to Major Incident if thresholds are exceeded.
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
        """Return a JSON-serialisable view of currently active incidents."""
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
        # Newest first.
        out.sort(key=lambda x: x["last_seen"], reverse=True)
        return out
