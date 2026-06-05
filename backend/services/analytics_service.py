"""
Analytics Service — Ticket Metrics, Response Times, and Team Reporting.

Provides aggregated analytics over the tickets table in Supabase.
All methods accept ISO-8601 date strings (YYYY-MM-DD) as range boundaries.
"""

from __future__ import annotations

import logging
import os
import statistics
from typing import Optional

logger = logging.getLogger(__name__)

try:
    from supabase import create_client
    _HAS_SUPABASE = True
except ImportError:  # pragma: no cover
    create_client = None  # type: ignore[assignment]
    _HAS_SUPABASE = False


class AnalyticsService:
    """Aggregated analytics computed from the tickets Supabase table."""

    def __init__(self, supabase_client=None) -> None:
        if supabase_client is not None:
            self.supabase = supabase_client
        elif _HAS_SUPABASE:
            url = os.environ.get("SUPABASE_URL", "")
            key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
            if url and key:
                self.supabase = create_client(url, key)
            else:
                self.supabase = None
                logger.warning(
                    "[AnalyticsService] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. "
                    "All analytics methods will return empty results."
                )
        else:
            self.supabase = None

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _query_tickets(self, start_date: str, end_date: str) -> list:
        """Return all tickets created within [start_date, end_date]."""
        if not self.supabase:
            return []
        try:
            resp = (
                self.supabase.table("tickets")
                .select("*")
                .gte("created_at", start_date)
                .lte("created_at", end_date)
                .execute()
            )
            return resp.data or []
        except Exception as exc:
            logger.error("[AnalyticsService] _query_tickets error: %s", exc)
            return []

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_ticket_metrics(self, start_date: str, end_date: str) -> dict:
        """
        Return ticket volume metrics for the given date range.

        Returns:
            dict with keys: total, open_count, closed_count, pending_count,
            in_progress_count, by_status (dict mapping status → count),
            by_priority (dict mapping priority → count).
        """
        tickets = self._query_tickets(start_date, end_date)

        by_status: dict[str, int] = {}
        by_priority: dict[str, int] = {}

        for t in tickets:
            status = (t.get("status") or "unknown").lower()
            priority = (t.get("priority") or "unknown").lower()
            by_status[status] = by_status.get(status, 0) + 1
            by_priority[priority] = by_priority.get(priority, 0) + 1

        return {
            "total": len(tickets),
            "open_count": by_status.get("open", 0),
            "closed_count": by_status.get("closed", 0),
            "pending_count": by_status.get("pending", 0),
            "in_progress_count": by_status.get("in_progress", 0),
            "by_status": by_status,
            "by_priority": by_priority,
        }

    def get_response_time_stats(self, start_date: str, end_date: str) -> dict:
        """
        Return response time statistics for the given date range.

        Response time = hours between created_at and first_response_at.
        Tickets without a first_response_at are excluded from stats.

        Returns:
            dict with keys: count, average_hours, median_hours,
            min_hours, max_hours. All float values; 0.0 if no data.
        """
        tickets = self._query_tickets(start_date, end_date)

        from datetime import datetime, timezone

        response_times: list[float] = []
        for t in tickets:
            created = t.get("created_at")
            responded = t.get("first_response_at")
            if not created or not responded:
                continue
            try:
                fmt = "%Y-%m-%dT%H:%M:%S"
                c = datetime.fromisoformat(str(created).replace("Z", "+00:00"))
                r = datetime.fromisoformat(str(responded).replace("Z", "+00:00"))
                hours = max(0.0, (r - c).total_seconds() / 3600)
                response_times.append(hours)
            except (ValueError, TypeError):
                continue

        if not response_times:
            return {
                "count": 0,
                "average_hours": 0.0,
                "median_hours": 0.0,
                "min_hours": 0.0,
                "max_hours": 0.0,
            }

        return {
            "count": len(response_times),
            "average_hours": round(sum(response_times) / len(response_times), 2),
            "median_hours": round(statistics.median(response_times), 2),
            "min_hours": round(min(response_times), 2),
            "max_hours": round(max(response_times), 2),
        }

    def get_resolution_rate(
        self,
        start_date: str,
        end_date: str,
        priority: Optional[str] = None,
    ) -> dict:
        """
        Return resolution rate for tickets in the given date range.

        Args:
            start_date: ISO date string for range start.
            end_date:   ISO date string for range end.
            priority:   Optional priority filter (critical/high/medium/low).

        Returns:
            dict with keys: total, resolved_count, rate (0.0–1.0),
            rate_percent (0.0–100.0).
        """
        tickets = self._query_tickets(start_date, end_date)

        if priority:
            tickets = [
                t for t in tickets
                if (t.get("priority") or "").lower() == priority.lower()
            ]

        resolved_statuses = {"closed", "resolved"}
        resolved = [
            t for t in tickets
            if (t.get("status") or "").lower() in resolved_statuses
        ]

        total = len(tickets)
        resolved_count = len(resolved)
        rate = resolved_count / total if total > 0 else 0.0

        return {
            "total": total,
            "resolved_count": resolved_count,
            "rate": round(rate, 4),
            "rate_percent": round(rate * 100, 2),
        }

    def get_team_workload(self, start_date: str, end_date: str) -> dict:
        """
        Return ticket distribution across team members (assigned_to field).

        Returns:
            dict with keys: total, unassigned_count,
            by_agent (dict mapping agent_id → count).
        """
        tickets = self._query_tickets(start_date, end_date)

        by_agent: dict[str, int] = {}
        unassigned = 0

        for t in tickets:
            agent = t.get("assigned_to") or t.get("assignee_id") or t.get("agent_id")
            if agent:
                agent_key = str(agent)
                by_agent[agent_key] = by_agent.get(agent_key, 0) + 1
            else:
                unassigned += 1

        return {
            "total": len(tickets),
            "unassigned_count": unassigned,
            "by_agent": by_agent,
        }

    def get_category_breakdown(self, start_date: str, end_date: str) -> dict:
        """
        Return ticket distribution across categories.

        Returns:
            dict with keys: total, uncategorized_count,
            by_category (dict mapping category → count).
        """
        tickets = self._query_tickets(start_date, end_date)

        by_category: dict[str, int] = {}
        uncategorized = 0

        for t in tickets:
            category = t.get("category") or t.get("type")
            if category:
                cat_key = str(category)
                by_category[cat_key] = by_category.get(cat_key, 0) + 1
            else:
                uncategorized += 1

        return {
            "total": len(tickets),
            "uncategorized_count": uncategorized,
            "by_category": by_category,
        }
