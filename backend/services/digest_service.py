import os
import logging
import datetime
import urllib.request
import urllib.error
import json
import asyncio
from collections import Counter
from typing import Dict, List, Optional

# Try to import from main to reuse supabase/gemini_service singletons if possible
try:
    from backend.main import supabase, gemini_service
except ImportError:
    supabase = None
    gemini_service = None

logger = logging.getLogger(__name__)

# Default Resend configurations
DEFAULT_SENDER = "Helpdesk.AI <onboarding@resend.dev>"

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
        "company_name": "Your Company",
        "date_range_str": ""
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
            "id, status, priority, category, created_at, updated_at, closed_at, sla_status"
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

        for t in tickets:
            status = str(t.get("status", "")).lower()
            category = t.get("category") or "Unclassified"
            categories.append(category)

            # Check if ticket was resolved/closed
            if status in ("resolved", "closed"):
                resolved_count += 1
                
                # Try parsing timestamps to compute resolution duration
                created_str = t.get("created_at")
                # Fallback to closed_at or updated_at for resolution timestamp
                end_str = t.get("closed_at") or t.get("updated_at")
                
                if created_str and end_str:
                    try:
                        # Clean Z format or offset format to ensure parsing
                        c_dt = datetime.datetime.fromisoformat(created_str.replace("Z", "+00:00"))
                        e_dt = datetime.datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                        diff = (e_dt - c_dt).total_seconds() / 60.0 # in minutes
                        if diff >= 0:
                            durations.append(diff)
                    except Exception:
                        pass
            else:
                open_count += 1

            if str(t.get("sla_status", "")).lower() == "breached":
                sla_breach_count += 1

        stats["resolved_tickets"] = resolved_count
        stats["open_tickets"] = open_count
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
        # Build prompt
        prompt = (
            "You are a professional IT support manager assistant. "
            "Analyze the following helpdesk statistics for the past week and write a concise, "
            "insightful 3-sentence summary of the helpdesk health. "
            "Highlight any major bottlenecks (like SLA breaches or high-volume categories) and provide a professional recommendation.\n\n"
            f"Company: {stats['company_name']}\n"
            f"Tickets Created: {stats['total_tickets']}\n"
            f"Tickets Resolved: {stats['resolved_tickets']}\n"
            f"Resolution Rate: {stats['resolution_rate']}%\n"
            f"Average Resolution Time: {stats['avg_resolution_time_str']}\n"
            f"SLA Breaches: {stats['sla_breaches']}\n"
            f"Top Categories: {top_cats_str}\n"
            f"Open/Active Tickets remaining: {stats['open_tickets']}\n\n"
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

def send_digest_email(admin_email: str, stats: dict, ai_summary: str) -> bool:
    """
    Format the HTML digest template and dispatch using the Resend REST API.
    """
    resend_api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not resend_api_key:
        logger.warning("[Digest] Skipped email dispatch: RESEND_API_KEY is not configured in .env.")
        return False

    sender_email = os.getenv("DIGEST_FROM_EMAIL", DEFAULT_SENDER).strip()

    # Style SLA parameters dynamically based on breaches
    sla_count = stats.get("sla_breaches", 0)
    if sla_count > 0:
        sla_border_color = "#fca5a5" # light red
        sla_text_color = "#dc2626"   # bold red
    else:
        sla_border_color = "#e5e7eb" # gray
        sla_text_color = "#111827"   # dark gray

    # Build top categories HTML
    cat_items = []
    for item in stats.get("top_categories", []):
        cat_items.append(
            f'<div class="category-item">'
            f'  <span class="category-name">{item["category"]}</span>'
            f'  <span class="category-count">{item["count"]} tickets</span>'
            f'</div>'
        )
    category_list_html = "\n".join(cat_items) if cat_items else '<p style="color: #6b7280; margin: 0; font-size: 14px;">No category data recorded.</p>'

    # Load and format email template
    email_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weekly Helpdesk Digest</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e5e7eb; }}
    .header {{ background: linear-gradient(135deg, #064e3b, #047857); padding: 32px 24px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }}
    .header p {{ margin: 8px 0 0 0; opacity: 0.85; font-size: 14px; }}
    .content {{ padding: 32px 24px; }}
    .ai-summary {{ background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px 20px; border-radius: 4px; margin-bottom: 28px; }}
    .ai-summary h3 {{ margin: 0 0 8px 0; color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }}
    .ai-summary p {{ margin: 0; color: #047857; font-size: 15px; line-height: 1.6; font-style: italic; }}
    .stats-table {{ width: 100%; border-collapse: separate; border-spacing: 12px; margin-bottom: 20px; }}
    .stat-card {{ background: #f3f4f6; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; text-align: center; }}
    .stat-val {{ font-size: 28px; font-weight: 700; color: #111827; line-height: 1; margin-bottom: 4px; }}
    .stat-label {{ font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }}
    .section-title {{ font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; }}
    .category-item {{ display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }}
    .category-name {{ color: #4b5563; }}
    .category-count {{ font-weight: 600; color: #111827; }}
    .footer {{ background: #f9fafb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }}
    .footer a {{ color: #10b981; text-decoration: none; font-weight: 600; }}
    .btn {{ display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; margin-top: 16px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Operations Digest</h1>
      <p>Helpdesk.AI performance insight for the week of {stats['date_range_str']}</p>
    </div>
    <div class="content">
      <div class="ai-summary">
        <h3>🤖 AI-Generated Weekly Insight</h3>
        <p>"{ai_summary}"</p>
      </div>
      
      <div class="section-title">📊 Key Metrics Overview</div>
      <table class="stats-table">
        <tr>
          <td width="50%">
            <div class="stat-card">
              <div class="stat-val">{stats['total_tickets']}</div>
              <div class="stat-label">Tickets Created</div>
            </div>
          </td>
          <td width="50%">
            <div class="stat-card">
              <div class="stat-val">{stats['resolution_rate']}%</div>
              <div class="stat-label">Resolution Rate</div>
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="stat-card">
              <div class="stat-val">{stats['avg_resolution_time_str']}</div>
              <div class="stat-label">Avg Resolution</div>
            </div>
          </td>
          <td>
            <div class="stat-card" style="border-color: {sla_border_color};">
              <div class="stat-val" style="color: {sla_text_color};">{stats['sla_breaches']}</div>
              <div class="stat-label">SLA Breaches</div>
            </div>
          </td>
        </tr>
      </table>

      <div class="section-title" style="margin-top: 24px;">🏆 Top Ticket Categories</div>
      <div style="background: #ffffff; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px;">
        {category_list_html}
      </div>

      <div style="text-align: center; margin-top: 12px;">
        <a href="https://helpdeskaiv1.vercel.app/" class="btn">Launch Admin Dashboard</a>
      </div>
    </div>
    <div class="footer">
      <p>This email was automatically generated and sent to you because you are a company administrator for {stats['company_name']}.</p>
      <p>To opt-out, update your <a href="https://helpdeskaiv1.vercel.app/admin-settings">Admin Settings</a>.</p>
    </div>
  </div>
</body>
</html>
"""

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
