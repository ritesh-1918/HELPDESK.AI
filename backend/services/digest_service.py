"""
Weekly Digest Email Service for HELPDESK.AI

Aggregates weekly ticket statistics from Supabase and generates
an HTML email digest with AI-powered summaries for admin users.

Configuration stored in `system_settings` table:
- `weekly_digest_enabled`: Boolean toggle for weekly digest emails
- `digest_recipients`: JSON array of email addresses to receive digest

Usage:
    from backend.services.digest_service import DigestService
    service = DigestService(supabase_client)
    html = await service.generate_weekly_digest(company_id)
"""

import os
import logging
import datetime
from typing import Optional, Dict, Any, List
from collections import Counter

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[DigestService] %(asctime)s - %(levelname)s - %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class DigestService:
    """Service for aggregating weekly ticket stats and generating digest emails."""

    def __init__(self, supabase_client=None):
        self._supabase = supabase_client

    def set_supabase(self, client):
        """Set the Supabase client instance."""
        self._supabase = client

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def get_weekly_stats(self, company_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Aggregate ticket statistics for the past 7 days.

        Returns a dict with:
        - total_tickets, new_tickets, resolved_tickets, open_tickets
        - category_breakdown, priority_breakdown, team_breakdown
        - avg_resolution_time_hours, sla_breach_count
        - top_categories, daily_volume
        - ai_auto_resolved_count, ai_accuracy_rate
        """
        if not self._supabase:
            logger.warning("Supabase client not configured")
            return self._empty_stats()

        now = datetime.datetime.utcnow()
        week_ago = now - datetime.timedelta(days=7)
        week_ago_iso = week_ago.isoformat() + "Z"

        try:
            # Fetch tickets from the past 7 days
            query = self._supabase.table("tickets").select("*")
            if company_id:
                query = query.eq("company", company_id)
            query = query.gte("created_at", week_ago_iso)
            result = query.execute()
            tickets = result.data or []

            # Fetch ALL tickets for total count
            total_query = self._supabase.table("tickets").select("id", count="exact")
            if company_id:
                total_query = total_query.eq("company", company_id)
            total_result = total_query.execute()
            total_all = getattr(total_result, 'count', None) or len(total_result.data or [])

        except Exception as e:
            logger.error(f"Failed to fetch tickets for digest: {e}")
            return self._empty_stats()

        if not tickets:
            return {
                **self._empty_stats(),
                "total_all_time": total_all,
                "period_start": week_ago.strftime("%B %d, %Y"),
                "period_end": now.strftime("%B %d, %Y"),
            }

        return self._compute_stats(tickets, total_all, week_ago, now)

    def generate_digest_html(self, stats: Dict[str, Any], company_name: str = "Your Organization") -> str:
        """
        Generate a beautifully formatted HTML email digest from stats data.
        """
        period_start = stats.get("period_start", "N/A")
        period_end = stats.get("period_end", "N/A")
        total_new = stats.get("new_tickets", 0)
        resolved = stats.get("resolved_tickets", 0)
        open_count = stats.get("open_tickets", 0)
        high_priority = stats.get("priority_breakdown", {}).get("High", 0)
        critical = stats.get("priority_breakdown", {}).get("Critical", 0)
        ai_auto = stats.get("ai_auto_resolved_count", 0)
        ai_accuracy = stats.get("ai_accuracy_rate", 0)
        sla_breaches = stats.get("sla_breach_count", 0)
        total_all = stats.get("total_all_time", 0)

        # Build category rows
        category_rows = ""
        for cat, count in stats.get("top_categories", []):
            pct = round((count / max(total_new, 1)) * 100, 1)
            category_rows += f"""
            <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;font-weight:500;">{cat}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#475569;text-align:center;">{count}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;">
                    <div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;">
                        <div style="width:80px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                            <div style="width:{pct}%;height:100%;background:#6366f1;border-radius:3px;"></div>
                        </div>
                        <span style="font-size:12px;color:#94a3b8;font-weight:600;">{pct}%</span>
                    </div>
                </td>
            </tr>"""

        # Build daily volume rows
        daily_rows = ""
        for day_data in stats.get("daily_volume", []):
            day = day_data.get("day", "")
            count = day_data.get("count", 0)
            bar_width = min(count * 15, 100)
            daily_rows += f"""
            <tr>
                <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569;">{day}</td>
                <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:{bar_width}%;height:8px;background:linear-gradient(90deg,#10b981,#34d399);border-radius:4px;min-width:8px;"></div>
                        <span style="font-size:13px;color:#1e293b;font-weight:600;">{count}</span>
                    </div>
                </td>
            </tr>"""

        # Priority badges
        def priority_badge(label, count, color):
            if count == 0:
                return ""
            return f'<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;color:{color};background:{color}15;margin:2px;">{label}: {count}</span>'

        priority_badges = (
            priority_badge("Critical", critical, "#dc2626") +
            priority_badge("High", high_priority, "#f59e0b") +
            priority_badge("Medium", stats.get("priority_breakdown", {}).get("Medium", 0), "#3b82f6") +
            priority_badge("Low", stats.get("priority_breakdown", {}).get("Low", 0), "#10b981")
        )

        # Team breakdown
        team_rows = ""
        for team, count in stats.get("team_breakdown", {}).items():
            team_rows += f"""
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9;">
                <span style="font-size:13px;color:#475569;font-weight:500;">{team}</span>
                <span style="font-size:14px;color:#1e293b;font-weight:700;background:#f1f5f9;padding:2px 10px;border-radius:12px;">{count}</span>
            </div>"""

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Digest - HELPDESK.AI</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:20px;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
            <div style="margin-bottom:16px;">
                <span style="font-size:32px;">📊</span>
            </div>
            <h1 style="margin:0;color:#f8fafc;font-size:24px;font-weight:800;letter-spacing:-0.02em;">
                Weekly Digest
            </h1>
            <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;font-weight:500;">
                {company_name} &middot; {period_start} — {period_end}
            </p>
            <div style="margin-top:16px;">
                <span style="display:inline-block;background:rgba(16,185,129,0.15);color:#34d399;padding:6px 16px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                    AI-Powered Report
                </span>
            </div>
        </div>

        <!-- KPI Cards -->
        <div style="background:#ffffff;padding:24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                    <td width="25%" style="text-align:center;padding:12px 8px;">
                        <div style="font-size:28px;font-weight:800;color:#1e293b;">{total_new}</div>
                        <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">New Tickets</div>
                    </td>
                    <td width="25%" style="text-align:center;padding:12px 8px;border-left:1px solid #f1f5f9;">
                        <div style="font-size:28px;font-weight:800;color:#10b981;">{resolved}</div>
                        <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">Resolved</div>
                    </td>
                    <td width="25%" style="text-align:center;padding:12px 8px;border-left:1px solid #f1f5f9;">
                        <div style="font-size:28px;font-weight:800;color:#f59e0b;">{open_count}</div>
                        <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">Open</div>
                    </td>
                    <td width="25%" style="text-align:center;padding:12px 8px;border-left:1px solid #f1f5f9;">
                        <div style="font-size:28px;font-weight:800;color:#6366f1;">{total_all}</div>
                        <div style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-top:4px;">All-Time</div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- AI Performance Section -->
        <div style="background:#f0fdf4;padding:20px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.08em;">
                🤖 AI Performance
            </h3>
            <div style="display:flex;gap:24px;flex-wrap:wrap;">
                <div>
                    <span style="font-size:22px;font-weight:800;color:#15803d;">{ai_auto}</span>
                    <span style="font-size:12px;color:#16a34a;font-weight:600;margin-left:4px;">auto-resolved</span>
                </div>
                <div>
                    <span style="font-size:22px;font-weight:800;color:#15803d;">{ai_accuracy}%</span>
                    <span style="font-size:12px;color:#16a34a;font-weight:600;margin-left:4px;">accuracy</span>
                </div>
                {f'<div><span style="font-size:22px;font-weight:800;color:#dc2626;">{sla_breaches}</span><span style="font-size:12px;color:#dc2626;font-weight:600;margin-left:4px;">SLA breaches</span></div>' if sla_breaches > 0 else ''}
            </div>
        </div>

        <!-- Priority Distribution -->
        <div style="background:#ffffff;padding:20px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">
                ⚡ Priority Distribution
            </h3>
            <div>{priority_badges if priority_badges else '<span style="color:#94a3b8;font-size:13px;">No tickets this week</span>'}</div>
        </div>

        <!-- Top Categories Table -->
        <div style="background:#ffffff;padding:20px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <h3 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">
                📋 Top Categories
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <thead>
                    <tr style="background:#f8fafc;">
                        <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Category</th>
                        <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Count</th>
                        <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Distribution</th>
                    </tr>
                </thead>
                <tbody>
                    {category_rows if category_rows else '<tr><td colspan="3" style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">No data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- Daily Volume -->
        <div style="background:#ffffff;padding:20px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <h3 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">
                📈 Daily Volume
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tbody>
                    {daily_rows if daily_rows else '<tr><td colspan="2" style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">No data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- Team Breakdown -->
        {f'''
        <div style="background:#ffffff;padding:20px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <h3 style="margin:0 0 12px;font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.08em;">
                👥 Team Workload
            </h3>
            {team_rows}
        </div>
        ''' if team_rows else ''}

        <!-- Footer -->
        <div style="background:#0f172a;border-radius:0 0 20px 20px;padding:24px 32px;text-align:center;">
            <p style="margin:0;color:#64748b;font-size:11px;">
                Generated by <span style="color:#10b981;font-weight:700;">HELPDESK.AI</span> Neural Engine
            </p>
            <p style="margin:8px 0 0;color:#475569;font-size:10px;">
                This is an automated weekly digest. Configure notification preferences in Admin Settings.
            </p>
        </div>

    </div>
</body>
</html>"""

        return html

    async def get_digest_settings(self, company_id: Optional[str] = None) -> Dict[str, Any]:
        """Retrieve digest email settings from system_settings table."""
        defaults = {
            "weekly_digest_enabled": False,
            "digest_recipients": [],
            "digest_day": "monday",
        }
        if not self._supabase:
            return defaults
        try:
            query = self._supabase.table("system_settings").select(
                "weekly_digest_enabled, digest_recipients, digest_day"
            )
            if company_id:
                query = query.eq("company_id", company_id)
            result = query.single().execute()
            if result.data:
                data = result.data
                # Parse digest_recipients if stored as string
                recipients = data.get("digest_recipients", [])
                if isinstance(recipients, str):
                    import json
                    try:
                        recipients = json.loads(recipients)
                    except Exception:
                        recipients = []
                data["digest_recipients"] = recipients
                return {**defaults, **data}
        except Exception as e:
            logger.warning(f"Could not fetch digest settings: {e}")
        return defaults

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _compute_stats(
        self,
        tickets: List[Dict],
        total_all: int,
        week_ago: datetime.datetime,
        now: datetime.datetime,
    ) -> Dict[str, Any]:
        """Compute aggregated statistics from raw ticket data."""
        new_count = len(tickets)
        resolved = sum(
            1 for t in tickets
            if (t.get("status", "").lower().find("resolv") >= 0
                or t.get("status", "").lower().find("closed") >= 0)
        )
        open_count = new_count - resolved

        # Category breakdown
        cat_counter: Counter = Counter()
        for t in tickets:
            cat = t.get("category", "Uncategorized") or "Uncategorized"
            cat_counter[cat] += 1
        top_categories = cat_counter.most_common(7)

        # Priority breakdown
        priority_counter: Counter = Counter()
        for t in tickets:
            pri = t.get("priority", "Medium") or "Medium"
            priority_counter[pri] += 1

        # Team breakdown
        team_counter: Counter = Counter()
        for t in tickets:
            team = t.get("assigned_team", "Unassigned") or "Unassigned"
            team_counter[team] += 1

        # AI auto-resolved
        ai_auto = sum(
            1 for t in tickets
            if t.get("status", "").lower().find("auto") >= 0
        )

        # AI accuracy (tickets NOT manually corrected)
        corrected = sum(1 for t in tickets if t.get("metadata", {}).get("corrected_at"))
        ai_accuracy = round(((new_count - corrected) / max(new_count, 1)) * 100, 1)

        # SLA breaches (tickets created more than their SLA window ago without resolution)
        sla_breaches = 0
        hours_map = {"Critical": 2, "High": 8, "Medium": 24, "Low": 72}
        for t in tickets:
            if t.get("status", "").lower().find("resolv") >= 0:
                continue
            pri = t.get("priority", "Medium") or "Medium"
            sla_hours = hours_map.get(pri, 72)
            created = t.get("created_at", "")
            if created:
                try:
                    created_dt = datetime.datetime.fromisoformat(created.replace("Z", "+00:00").replace("+00:00", ""))
                    if (now - created_dt).total_seconds() / 3600 > sla_hours:
                        sla_breaches += 1
                except Exception:
                    pass

        # Daily volume
        day_map: Dict[str, int] = {}
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for i in range(7):
            day = week_ago + datetime.timedelta(days=i)
            day_name = day_names[day.weekday()]
            day_map[day_name] = 0

        for t in tickets:
            created = t.get("created_at", "")
            if created:
                try:
                    dt = datetime.datetime.fromisoformat(created.replace("Z", "+00:00").replace("+00:00", ""))
                    day_name = day_names[dt.weekday()]
                    if day_name in day_map:
                        day_map[day_name] += 1
                except Exception:
                    pass

        daily_volume = [{"day": d, "count": c} for d, c in day_map.items()]

        # Avg resolution time
        resolution_times = []
        for t in tickets:
            if t.get("status", "").lower().find("resolv") >= 0:
                created = t.get("created_at", "")
                updated = t.get("updated_at", "")
                if created and updated:
                    try:
                        c_dt = datetime.datetime.fromisoformat(created.replace("Z", "+00:00").replace("+00:00", ""))
                        u_dt = datetime.datetime.fromisoformat(updated.replace("Z", "+00:00").replace("+00:00", ""))
                        resolution_times.append((u_dt - c_dt).total_seconds() / 3600)
                    except Exception:
                        pass

        avg_resolution = round(sum(resolution_times) / max(len(resolution_times), 1), 1) if resolution_times else 0

        return {
            "new_tickets": new_count,
            "resolved_tickets": resolved,
            "open_tickets": open_count,
            "total_all_time": total_all,
            "category_breakdown": dict(cat_counter),
            "top_categories": top_categories,
            "priority_breakdown": dict(priority_counter),
            "team_breakdown": dict(team_counter),
            "ai_auto_resolved_count": ai_auto,
            "ai_accuracy_rate": ai_accuracy,
            "sla_breach_count": sla_breaches,
            "avg_resolution_time_hours": avg_resolution,
            "daily_volume": daily_volume,
            "period_start": week_ago.strftime("%B %d, %Y"),
            "period_end": now.strftime("%B %d, %Y"),
        }

    def _empty_stats(self) -> Dict[str, Any]:
        """Return a zeroed-out stats dict."""
        return {
            "new_tickets": 0,
            "resolved_tickets": 0,
            "open_tickets": 0,
            "total_all_time": 0,
            "category_breakdown": {},
            "top_categories": [],
            "priority_breakdown": {},
            "team_breakdown": {},
            "ai_auto_resolved_count": 0,
            "ai_accuracy_rate": 0,
            "sla_breach_count": 0,
            "avg_resolution_time_hours": 0,
            "daily_volume": [],
            "period_start": "N/A",
            "period_end": "N/A",
        }


# ---------------------------------------------------------------------------
# Singleton
# ---------------------------------------------------------------------------
_instance: Optional[DigestService] = None


def load(supabase_client=None) -> DigestService:
    """Load and return singleton instance of DigestService."""
    global _instance
    if _instance is None:
        _instance = DigestService(supabase_client)
        logger.info("DigestService loaded")
    return _instance


def get_instance() -> Optional[DigestService]:
    """Get the singleton instance if already loaded."""
    return _instance
