import os
import logging
import datetime
import urllib.request
import urllib.error
import json
import asyncio
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional
from string import Template

# Try to import from main to reuse supabase/gemini_service singletons if possible
try:
    from backend.main import supabase, gemini_service
except ImportError:
    supabase = None
    gemini_service = None

logger = logging.getLogger(__name__)

# Default Resend configurations
DEFAULT_SENDER = "Helpdesk.AI <onboarding@resend.dev>"

# Template directory
TEMPLATE_DIR = Path(__file__).parent.parent / "templates"


def get_weekly_stats(company_id: str) -> dict:
    """
    Query tickets table from Supabase for the last 7 days and compute weekly metrics.
    """
    stats = {
        "total_tickets": 0,
        "resolved_tickets": 0,
        "resolution_rate": 0.0,
        "avg_resolution_time_str": "N/A",
        "sla_breaches": 0,
        "top_categories": [],
        "open_tickets": 0,
        "pending_tickets": 0,
        "company_name": "Your Company",
        "date_range_str": "",
        "team_performance": [],
    }

    # Fallback to local import if global failed
    global supabase
    if not supabase:
        try:
            from backend.main import supabase as main_supabase
            supabase = main_supabase
        except ImportError:
            pass

    if not supabase:
        logger.warning("[Digest] Supabase connection is offline. Returning mock stats.")
        return stats

    try:
        # Get company name
        company_res = supabase.table("companies").select("name").eq("id", company_id).single().execute()
        if company_res.data:
            stats["company_name"] = company_res.data.get("name", "Your Company")
    except Exception as e:
        logger.warning(f"[Digest] Failed to fetch company name: {e}")

    # Set up date range
    now = datetime.datetime.now(datetime.timezone.utc)
    seven_days_ago = now - datetime.timedelta(days=7)
    seven_days_ago_iso = seven_days_ago.isoformat()
    
    stats["date_range_str"] = f"{seven_days_ago.strftime('%b %d')} - {now.strftime('%b %d, %Y')}"

    try:
        # Fetch tickets from last 7 days for the company
        res = supabase.table("tickets").select(
            "id, status, priority, category, assigned_team, created_at, updated_at, closed_at, sla_status"
        ).eq("company_id", company_id).gte("created_at", seven_days_ago_iso).execute()

        tickets = res.data or []
        stats["total_tickets"] = len(tickets)

        if not tickets:
            return stats

        resolved_count = 0
        durations = []
        sla_breach_count = 0
        categories = []
        open_count = 0
        pending_count = 0

        # Team performance tracking
        team_stats: Dict[str, dict] = {}

        for t in tickets:
            status = str(t.get("status", "")).lower()
            category = t.get("category") or "Unclassified"
            assigned_team = t.get("assigned_team") or "Unassigned"
            categories.append(category)

            # Initialize team stats if not present
            if assigned_team not in team_stats:
                team_stats[assigned_team] = {
                    "team": assigned_team,
                    "total": 0,
                    "resolved": 0,
                    "open": 0,
                    "pending": 0,
                    "durations": [],
                    "sla_breaches": 0,
                }

            team_stats[assigned_team]["total"] += 1

            # Check if ticket was resolved/closed
            if status in ("resolved", "closed"):
                resolved_count += 1
                team_stats[assigned_team]["resolved"] += 1
                
                # Try parsing timestamps to compute resolution duration
                created_str = t.get("created_at")
                # Fallback to closed_at or updated_at for resolution timestamp
                end_str = t.get("closed_at") or t.get("updated_at")
                
                if created_str and end_str:
                    try:
                        # Clean Z format or offset format to ensure parsing
                        c_dt = datetime.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                        e_dt = datetime.datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                        diff = (e_dt - c_dt).total_seconds() / 60.0  # in minutes
                        if diff >= 0:
                            durations.append(diff)
                            team_stats[assigned_team]["durations"].append(diff)
                    except Exception:
                        pass
            elif status == "pending":
                pending_count += 1
                team_stats[assigned_team]["pending"] += 1
            else:
                open_count += 1
                team_stats[assigned_team]["open"] += 1

            if str(t.get("sla_status", "")).lower() == "breached":
                sla_breach_count += 1
                team_stats[assigned_team]["sla_breaches"] += 1

        stats["resolved_tickets"] = resolved_count
        stats["open_tickets"] = open_count
        stats["pending_tickets"] = pending_count
        stats["sla_breaches"] = sla_breach_count

        if stats["total_tickets"] > 0:
            stats["resolution_rate"] = round((resolved_count / stats["total_tickets"]) * 100, 1)

        # Average resolution duration formatting
        if durations:
            avg_min = sum(durations) / len(durations)
            if avg_min < 60:
                stats["avg_resolution_time_str"] = f"{int(avg_min)}m"
            else:
                avg_hrs = avg_min / 60.0
                if avg_hrs < 24:
                    stats["avg_resolution_time_str"] = f"{avg_hrs:.1f}h"
                else:
                    avg_days = avg_hrs / 24.0
                    stats["avg_resolution_time_str"] = f"{avg_days:.1f}d"

        # Calculate top 3 categories
        cat_counts = Counter(categories).most_common(3)
        stats["top_categories"] = [
            {"category": cat, "count": count} for cat, count in cat_counts
        ]

        # Build team performance list sorted by total tickets descending
        team_performance = []
        for team_name, ts in sorted(team_stats.items(), key=lambda x: x[1]["total"], reverse=True):
            team_resolved = ts["resolved"]
            team_total = ts["total"]
            team_rate = round((team_resolved / team_total) * 100, 1) if team_total > 0 else 0.0

            # Format avg resolution time per team
            team_avg_str = "N/A"
            if ts["durations"]:
                avg_min = sum(ts["durations"]) / len(ts["durations"])
                if avg_min < 60:
                    team_avg_str = f"{int(avg_min)}m"
                else:
                    avg_hrs = avg_min / 60.0
                    if avg_hrs < 24:
                        team_avg_str = f"{avg_hrs:.1f}h"
                    else:
                        avg_days = avg_hrs / 24.0
                        team_avg_str = f"{avg_days:.1f}d"

            team_performance.append({
                "team": team_name,
                "total": team_total,
                "resolved": team_resolved,
                "open": ts["open"],
                "pending": ts["pending"],
                "resolution_rate": team_rate,
                "avg_resolution_time": team_avg_str,
                "sla_breaches": ts["sla_breaches"],
            })

        stats["team_performance"] = team_performance

    except Exception as e:
        logger.error(f"[Digest] Error building weekly stats: {e}")

    return stats


def generate_ai_summary(stats: dict) -> str:
    """
    Format statistics and request Gemini API to write a 3-sentence summary insight.
    """
    fallback_summary = (
        f"This week, your support team managed {stats['total_tickets']} tickets with a "
        f"{stats['resolution_rate']}% resolution rate. Average resolution time stood at "
        f"{stats['avg_resolution_time_str']}, with {stats['sla_breaches']} SLA breaches recorded."
    )

    global gemini_service
    # Lazy init check/instantiation if main import failed or key not initialized
    if not gemini_service:
        try:
            from backend.services.gemini_service import GeminiService
            gemini_service = GeminiService()
        except Exception as e:
            logger.warning(f"[Digest] Could not load GeminiService: {e}")
            return fallback_summary

    if not gemini_service or not getattr(gemini_service, "_initialized", False):
        logger.warning("[Digest] Gemini service is offline. Returning template-based summary.")
        return fallback_summary
    try:
        top_cats_str = ", ".join([f"{c['category']} ({c['count']})" for c in stats.get('top_categories', [])])
        
        # Build team performance context for AI
        team_lines = []
        for tm in stats.get("team_performance", []):
            team_lines.append(
                f"  - {tm['team']}: {tm['total']} tickets, {tm['resolution_rate']}% resolved, "
                f"avg {tm['avg_resolution_time']}, {tm['sla_breaches']} SLA breaches"
            )
        team_context = "\n".join(team_lines) if team_lines else "  No team data available."

        # Build prompt
        prompt = (
            "You are a professional IT support manager assistant. "
            "Analyze the following helpdesk statistics for the past week and write a concise, "
            "insightful 3-sentence summary of the helpdesk health. "
            "Highlight any major bottlenecks (like SLA breaches or high-volume categories) and "
            "mention standout team performance. Provide a professional recommendation.\n\n"
            f"Company: {stats['company_name']}\n"
            f"Tickets Created: {stats['total_tickets']}\n"
            f"Tickets Resolved: {stats['resolved_tickets']}\n"
            f"Tickets Pending: {stats.get('pending_tickets', 0)}\n"
            f"Resolution Rate: {stats['resolution_rate']}%\n"
            f"Average Resolution Time: {stats['avg_resolution_time_str']}\n"
            f"SLA Breaches: {stats['sla_breaches']}\n"
            f"Top Categories: {top_cats_str}\n"
            f"Open/Active Tickets remaining: {stats['open_tickets']}\n"
            f"Team Performance:\n{team_context}\n\n"
            "Return only the 3-sentence summary without any headers or intro text."
        )

        response = gemini_service.client.models.generate_content(
            model=gemini_service.model_name,
            contents=prompt
        )
        return response.text.strip().replace("\n", " ")
    except Exception as e:
        logger.error(f"[Digest] Gemini summary generation failed: {e}")
        return fallback_summary


def _build_team_performance_html(team_performance: list) -> str:
    """Build HTML rows for the team performance table."""
    if not team_performance:
        return '<p style="color: #6b7280; margin: 0; font-size: 14px;">No team data recorded this week.</p>'

    rows = []
    for tm in team_performance:
        # Color-code resolution rate
        rate = tm.get("resolution_rate", 0)
        if rate >= 80:
            rate_color = "#059669"  # green
        elif rate >= 50:
            rate_color = "#d97706"  # amber
        else:
            rate_color = "#dc2626"  # red

        # Color-code SLA breaches
        breaches = tm.get("sla_breaches", 0)
        breach_color = "#dc2626" if breaches > 0 else "#6b7280"

        rows.append(
            f'<tr style="border-bottom: 1px solid #f3f4f6;">'
            f'<td style="padding: 10px 12px; font-weight: 600; color: #111827;">{tm["team"]}</td>'
            f'<td style="padding: 10px 12px; text-align: center;">{tm["total"]}</td>'
            f'<td style="padding: 10px 12px; text-align: center;">{tm["resolved"]}</td>'
            f'<td style="padding: 10px 12px; text-align: center; color: {rate_color}; font-weight: 600;">{tm["resolution_rate"]}%</td>'
            f'<td style="padding: 10px 12px; text-align: center;">{tm["avg_resolution_time"]}</td>'
            f'<td style="padding: 10px 12px; text-align: center; color: {breach_color}; font-weight: 600;">{breaches}</td>'
            f'</tr>'
        )

    header = (
        '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">'
        '<thead><tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">'
        '<th style="padding: 10px 12px; text-align: left; color: #6b7280; font-weight: 600;">Team</th>'
        '<th style="padding: 10px 12px; text-align: center; color: #6b7280; font-weight: 600;">Total</th>'
        '<th style="padding: 10px 12px; text-align: center; color: #6b7280; font-weight: 600;">Resolved</th>'
        '<th style="padding: 10px 12px; text-align: center; color: #6b7280; font-weight: 600;">Rate</th>'
        '<th style="padding: 10px 12px; text-align: center; color: #6b7280; font-weight: 600;">Avg Time</th>'
        '<th style="padding: 10px 12px; text-align: center; color: #6b7280; font-weight: 600;">SLA Breaches</th>'
        '</tr></thead><tbody>'
    )
    footer = '</tbody></table>'
    return header + "".join(rows) + footer


def _build_category_list_html(top_categories: list) -> str:
    """Build HTML for top categories list."""
    cat_items = []
    for item in top_categories:
        cat_items.append(
            f'<div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">'
            f'  <span style="color: #4b5563;">{item["category"]}</span>'
            f'  <span style="font-weight: 600; color: #111827;">{item["count"]} tickets</span>'
            f'</div>'
        )
    return (
        "\n".join(cat_items)
        if cat_items
        else '<p style="color: #6b7280; margin: 0; font-size: 14px;">No category data recorded.</p>'
    )


def _load_email_template() -> str:
    """Load the HTML email template from the templates directory."""
    template_path = TEMPLATE_DIR / "weekly_digest.html"
    if template_path.exists():
        return template_path.read_text(encoding="utf-8")
    # Fallback: minimal template
    logger.warning(f"[Digest] Template not found at {template_path}. Using inline fallback.")
    return """<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Weekly Digest</title></head>
<body><div>${header_content}</div><div>${body_content}</div><div>${footer_content}</div></body></html>"""


def send_digest_email(admin_email: str, stats: dict, ai_summary: str) -> bool:
    """
    Format the HTML digest template and dispatch using the Resend API.
    """
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not resend_api_key:
        logger.warning("[Digest] Skipped email dispatch: RESEND_API_KEY is not configured in .env.")
        return False

    sender_email = os.getenv("DIGEST_FROM_EMAIL", DEFAULT_SENDER).strip()

    # Style SLA parameters dynamically based on breaches
    sla_count = stats.get("sla_breaches", 0)
    if sla_count > 0:
        sla_border_color = "#fca5a5"  # light red
        sla_text_color = "#dc2626"    # bold red
    else:
        sla_border_color = "#e5e7eb"  # gray
        sla_text_color = "#111827"    # dark gray

    # Build component HTML
    category_list_html = _build_category_list_html(stats.get("top_categories", []))
    team_performance_html = _build_team_performance_html(stats.get("team_performance", []))

    # Load template and substitute values
    template_str = _load_email_template()

    # Use string.Template for safe substitution ($-based)
    tmpl = Template(template_str)
    email_html = tmpl.safe_substitute(
        date_range=stats.get("date_range_str", ""),
        company_name=stats.get("company_name", "Your Company"),
        ai_summary=ai_summary,
        total_tickets=stats.get("total_tickets", 0),
        resolution_rate=stats.get("resolution_rate", 0.0),
        avg_resolution_time=stats.get("avg_resolution_time_str", "N/A"),
        sla_breaches=sla_count,
        sla_border_color=sla_border_color,
        sla_text_color=sla_text_color,
        pending_tickets=stats.get("pending_tickets", 0),
        open_tickets=stats.get("open_tickets", 0),
        resolved_tickets=stats.get("resolved_tickets", 0),
        category_list_html=category_list_html,
        team_performance_html=team_performance_html,
    )

    # Dispatch via Resend API POST
    payload = {
        "from": sender_email,
        "to": [admin_email],
        "subject": f"Weekly Helpdesk Operations Digest — {stats['company_name']}",
        "html": email_html
    }
    
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            logger.info(f"[Digest] Weekly digest emailed successfully to {admin_email} (Resend Response: {body})")
            return True
    except urllib.error.HTTPError as e:
        logger.error(f"[Digest] Resend API error (HTTP {e.code}): {e.read().decode('utf-8')}")
    except Exception as e:
        logger.error(f"[Digest] Resend mail transmission failure: {e}")
        
    return False


async def digest_scheduler_loop_async(supabase_client, interval_seconds=3600):
    """
    Background loop that runs every hour, checks if it is Monday morning (e.g. between 8 AM and 9 AM UTC),
    and sends the weekly digest to all companies that have digest_enabled = true.
    """
    logger.info("Weekly digest scheduler loop started (interval=3600s)")
    while True:
        try:
            # Check if it's Monday
            now = datetime.datetime.now(datetime.timezone.utc)
            # Monday is 0 in weekday()
            if now.weekday() == 0 and now.hour == 8:
                logger.info("[Digest] Monday 8 AM UTC detected. Checking companies for digest dispatch...")
                
                # Fetch settings
                res = supabase_client.table("system_settings").select(
                    "company_id, digest_admin_email, digest_last_sent, digest_enabled"
                ).eq("digest_enabled", True).execute()
                
                settings_list = res.data or []
                for settings in settings_list:
                    company_id = settings.get("company_id")
                    admin_email = settings.get("digest_admin_email")
                    last_sent_str = settings.get("digest_last_sent")
                    
                    if not admin_email:
                        # Fallback: fetch company admins
                        try:
                            profiles_res = supabase_client.table("profiles").select("email").eq("company_id", company_id).in_("role", ["admin", "super_admin", "master_admin"]).execute()
                            if profiles_res.data:
                                admin_email = profiles_res.data[0].get("email")
                        except Exception as e:
                            logger.warning(f"[Digest] Failed to fetch admin emails for company {company_id}: {e}")
                            
                    if not admin_email:
                        logger.warning(f"[Digest] No recipient email found for company {company_id}. Skipping.")
                        continue
                        
                    # Check if already sent in the last 24 hours to prevent duplicate dispatch
                    should_send = True
                    if last_sent_str:
                        try:
                            # Strip Z offset if needed for fromisoformat
                            clean_last = last_sent_str.replace("Z", "+00:00")
                            last_sent = datetime.datetime.fromisoformat(clean_last)
                            if (now - last_sent).total_seconds() < 86400:
                                should_send = False
                        except Exception as ex:
                            logger.warning(f"[Digest] Error checking last sent timestamp: {ex}")
                            
                    if should_send:
                        logger.info(f"[Digest] Sending weekly digest to {admin_email} for company {company_id}...")
                        stats = get_weekly_stats(company_id)
                        summary = generate_ai_summary(stats)
                        success = send_digest_email(admin_email, stats, summary)
                        if success:
                            supabase_client.table("system_settings").update({
                                "digest_last_sent": now.isoformat()
                            }).eq("company_id", company_id).execute()
        except Exception as e:
            logger.error(f"[Digest] Error in digest scheduler loop: {e}")
            
        await asyncio.sleep(interval_seconds)
