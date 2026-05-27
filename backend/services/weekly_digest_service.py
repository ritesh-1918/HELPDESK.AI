"""
Weekly Digest Email Service: Generates AI-powered weekly performance digest for admins.

Features:
- Aggregates ticket volume, resolution rates, SLA compliance stats per company
- Uses Gemini LLM to generate executive insights and recommendations
- Sends digest email via Supabase Edge Function (Resend API)
- Respects company notification settings via NotificationRoutingMiddleware
- Tracks digest send history to prevent duplicates
- Configurable per-company via system_settings (digest_frequency)

Usage:
- Triggered via POST /admin/weekly-digest endpoint
- Can also be scheduled via external cron (e.g., Supabase pg_cron, GitHub Actions)
"""

import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, List, Any

import httpx
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

handler = logging.StreamHandler()
formatter = logging.Formatter("[WeeklyDigestService] %(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


class WeeklyDigestService:
    """Service for generating and sending weekly performance digest emails."""

    def __init__(self):
        """Initialize the weekly digest service."""
        self.supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        )
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.gemini_service = None  # Injected via set_gemini_service()

    def set_gemini_service(self, gemini_service) -> None:
        """Inject the GeminiService instance for AI-powered insights."""
        self.gemini_service = gemini_service

    def _get_all_companies(self) -> List[Dict]:
        """
        Fetch all companies that have system_settings configured.

        Returns:
            List of dicts with company_id and settings
        """
        try:
            response = self.supabase.table("system_settings").select(
                "company_id, email_notifications, digest_frequency"
            ).execute()

            companies = response.data if response.data else []
            logger.info(f"Found {len(companies)} companies with system_settings")
            return companies
        except Exception as e:
            logger.error(f"Error fetching companies: {str(e)}")
            return []

    def _get_company_admins(self, company_id: str) -> List[Dict]:
        """
        Fetch admin users for a company.

        Args:
            company_id: UUID of the company

        Returns:
            List of admin user dicts with email and full_name
        """
        try:
            response = self.supabase.table("profiles").select(
                "id, full_name, email, role"
            ).eq("company_id", company_id).eq("role", "admin").execute()

            admins = response.data if response.data else []

            # Also try to get emails from auth if not in profiles
            for admin in admins:
                if not admin.get("email"):
                    try:
                        user_res = self.supabase.auth.admin.getUserById(admin["id"])
                        if user_res and hasattr(user_res, "user") and user_res.user:
                            admin["email"] = user_res.user.email
                    except Exception:
                        pass

            return [a for a in admins if a.get("email")]
        except Exception as e:
            logger.error(f"Error fetching admins for company {company_id}: {str(e)}")
            return []

    def _fetch_ticket_stats(self, company_id: str, since: datetime) -> Dict[str, Any]:
        """
        Aggregate ticket statistics for a company over a given time period.

        Args:
            company_id: UUID of the company
            since: Start datetime for the period

        Returns:
            Dict with ticket volume, resolution rates, SLA stats, category breakdown
        """
        since_iso = since.isoformat()

        stats = {
            "total_created": 0,
            "total_resolved": 0,
            "total_closed": 0,
            "total_open": 0,
            "total_in_progress": 0,
            "resolution_rate": 0.0,
            "avg_resolution_hours": None,
            "sla_breached": 0,
            "sla_compliant": 0,
            "sla_compliance_rate": 0.0,
            "by_priority": {"Critical": 0, "High": 0, "Medium": 0, "Low": 0},
            "by_category": {},
            "by_team": {},
            "auto_resolved_count": 0,
            "duplicate_count": 0,
            "top_categories": [],
            "top_teams": [],
        }

        try:
            # Fetch all tickets created in the period
            created_response = self.supabase.table("tickets").select(
                "id, status, priority, category, subcategory, assigned_team, "
                "created_at, updated_at, closed_at, auto_closed, sla_breach_at, "
                "auto_resolve, is_duplicate"
            ).eq("company_id", company_id).gte("created_at", since_iso).execute()

            tickets = created_response.data if created_response.data else []
            stats["total_created"] = len(tickets)

            if not tickets:
                return stats

            resolution_hours_list = []

            for ticket in tickets:
                status = ticket.get("status", "open")
                priority = ticket.get("priority", "Medium")
                category = ticket.get("category", "Unknown")
                team = ticket.get("assigned_team", "General Support")

                # Status counts
                if status == "resolved":
                    stats["total_resolved"] += 1
                elif status == "closed":
                    stats["total_closed"] += 1
                elif status == "in_progress":
                    stats["total_in_progress"] += 1
                else:
                    stats["total_open"] += 1

                # Priority breakdown
                if priority in stats["by_priority"]:
                    stats["by_priority"][priority] += 1

                # Category breakdown
                stats["by_category"][category] = stats["by_category"].get(category, 0) + 1

                # Team breakdown
                stats["by_team"][team] = stats["by_team"].get(team, 0) + 1

                # Auto-resolve count
                if ticket.get("auto_resolve"):
                    stats["auto_resolved_count"] += 1

                # Duplicate count
                if ticket.get("is_duplicate"):
                    stats["duplicate_count"] += 1

                # Resolution time calculation
                if status in ("resolved", "closed"):
                    created_at_str = ticket.get("created_at")
                    resolved_at_str = ticket.get("closed_at") or ticket.get("updated_at")
                    if created_at_str and resolved_at_str:
                        try:
                            created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                            resolved_dt = datetime.fromisoformat(resolved_at_str.replace("Z", "+00:00"))
                            delta = resolved_dt - created_dt
                            resolution_hours_list.append(delta.total_seconds() / 3600)
                        except (ValueError, TypeError):
                            pass

                # SLA compliance check
                sla_breach_at = ticket.get("sla_breach_at")
                if sla_breach_at:
                    if status in ("resolved", "closed"):
                        resolved_at_str = ticket.get("closed_at") or ticket.get("updated_at")
                        if resolved_at_str:
                            try:
                                breach_dt = datetime.fromisoformat(sla_breach_at.replace("Z", "+00:00"))
                                resolved_dt = datetime.fromisoformat(resolved_at_str.replace("Z", "+00:00"))
                                if resolved_dt <= breach_dt:
                                    stats["sla_compliant"] += 1
                                else:
                                    stats["sla_breached"] += 1
                            except (ValueError, TypeError):
                                stats["sla_compliant"] += 1
                        else:
                            stats["sla_compliant"] += 1
                    else:
                        # Still open — check if current time exceeds SLA
                        try:
                            breach_dt = datetime.fromisoformat(sla_breach_at.replace("Z", "+00:00"))
                            now_utc = datetime.now(timezone.utc)
                            if now_utc > breach_dt:
                                stats["sla_breached"] += 1
                            else:
                                stats["sla_compliant"] += 1
                        except (ValueError, TypeError):
                            stats["sla_compliant"] += 1
                else:
                    stats["sla_compliant"] += 1

            # Compute derived metrics
            total_sla = stats["sla_compliant"] + stats["sla_breached"]
            if total_sla > 0:
                stats["sla_compliance_rate"] = round(
                    (stats["sla_compliant"] / total_sla) * 100, 1
                )

            resolved_total = stats["total_resolved"] + stats["total_closed"]
            if stats["total_created"] > 0:
                stats["resolution_rate"] = round(
                    (resolved_total / stats["total_created"]) * 100, 1
                )

            if resolution_hours_list:
                stats["avg_resolution_hours"] = round(
                    sum(resolution_hours_list) / len(resolution_hours_list), 1
                )

            # Top categories (sorted by count descending)
            stats["top_categories"] = sorted(
                stats["by_category"].items(), key=lambda x: x[1], reverse=True
            )[:5]

            # Top teams (sorted by count descending)
            stats["top_teams"] = sorted(
                stats["by_team"].items(), key=lambda x: x[1], reverse=True
            )[:5]

        except Exception as e:
            logger.error(f"Error fetching ticket stats for company {company_id}: {str(e)}")

        return stats

    def _generate_ai_insights(self, stats: Dict[str, Any], company_name: str) -> Dict[str, str]:
        """
        Use Gemini LLM to generate executive insights from ticket statistics.

        Args:
            stats: Aggregated ticket statistics
            company_name: Name of the company for context

        Returns:
            Dict with 'summary', 'insights', and 'recommendations' strings
        """
        if not self.gemini_service or not self.gemini_service._initialized:
            return {
                "summary": f"Weekly helpdesk report for {company_name}.",
                "insights": "AI insights unavailable (Gemini service not configured).",
                "recommendations": "Review ticket metrics manually for optimization opportunities."
            }

        try:
            # Format stats into a readable context for the LLM
            top_cats = ", ".join([f"{cat} ({count})" for cat, count in stats.get("top_categories", [])])
            top_teams = ", ".join([f"{team} ({count})" for team, count in stats.get("top_teams", [])])
            priorities = ", ".join([f"{p}: {c}" for p, c in stats.get("by_priority", {}).items() if c > 0])

            prompt = (
                f"You are an expert IT helpdesk analyst generating a weekly executive digest for {company_name}.\n\n"
                f"## Weekly Metrics\n"
                f"- Total tickets created: {stats['total_created']}\n"
                f"- Resolved: {stats['total_resolved']} | Closed: {stats['total_closed']} | "
                f"Open: {stats['total_open']} | In Progress: {stats['total_in_progress']}\n"
                f"- Resolution rate: {stats['resolution_rate']}%\n"
                f"- Average resolution time: {stats.get('avg_resolution_hours', 'N/A')} hours\n"
                f"- SLA compliance rate: {stats['sla_compliance_rate']}% "
                f"({stats['sla_compliant']} compliant, {stats['sla_breached']} breached)\n"
                f"- Auto-resolved by AI: {stats['auto_resolved_count']}\n"
                f"- Duplicates detected: {stats['duplicate_count']}\n"
                f"- Priority breakdown: {priorities}\n"
                f"- Top categories: {top_cats or 'None'}\n"
                f"- Top teams: {top_teams or 'None'}\n\n"
                "Please provide:\n"
                "1. SUMMARY: A 2-3 sentence executive summary of this week's helpdesk performance.\n"
                "2. INSIGHTS: 3-4 bullet points highlighting notable trends, patterns, or anomalies.\n"
                "3. RECOMMENDATIONS: 2-3 actionable recommendations for improving support operations.\n\n"
                "Format strictly as:\n"
                "SUMMARY: <text>\n"
                "INSIGHTS:\n- <point1>\n- <point2>\n- <point3>\n"
                "RECOMMENDATIONS:\n- <rec1>\n- <rec2>\n- <rec3>"
            )

            response = self.gemini_service.client.models.generate_content(
                model=self.gemini_service.model_name,
                contents=prompt
            )
            text_response = response.text.strip()

            # Parse the response
            import re
            summary_match = re.search(r"SUMMARY:\s*(.*?)(?=INSIGHTS:|$)", text_response, re.DOTALL | re.IGNORECASE)
            insights_match = re.search(r"INSIGHTS:\s*(.*?)(?=RECOMMENDATIONS:|$)", text_response, re.DOTALL | re.IGNORECASE)
            recommendations_match = re.search(r"RECOMMENDATIONS:\s*(.*)", text_response, re.DOTALL | re.IGNORECASE)

            return {
                "summary": summary_match.group(1).strip() if summary_match else f"Weekly report for {company_name}.",
                "insights": insights_match.group(1).strip() if insights_match else "No specific insights generated.",
                "recommendations": recommendations_match.group(1).strip() if recommendations_match else "No specific recommendations."
            }

        except Exception as e:
            logger.error(f"Gemini AI insight generation error: {str(e)}")
            return {
                "summary": f"Weekly helpdesk report for {company_name}.",
                "insights": f"AI insight generation failed: {str(e)}",
                "recommendations": "Review metrics manually."
            }

    def _build_email_html(
        self,
        company_name: str,
        stats: Dict[str, Any],
        ai_insights: Dict[str, str],
        week_start: str,
        week_end: str
    ) -> str:
        """
        Build the HTML email body for the weekly digest.

        Args:
            company_name: Display name of the company
            stats: Aggregated ticket statistics
            ai_insights: AI-generated insights from Gemini
            week_start: Formatted start date string
            week_end: Formatted end date string

        Returns:
            HTML string for the email body
        """
        priority_rows = ""
        for priority, count in stats.get("by_priority", {}).items():
            color = {"Critical": "#ef4444", "High": "#f97316", "Medium": "#eab308", "Low": "#22c55e"}.get(priority, "#94a3b8")
            priority_rows += f"""
            <tr>
              <td style="padding:8px 16px;border-bottom:1px solid #1e293b;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:{color};margin-right:8px;"></span>
                {priority}
              </td>
              <td style="padding:8px 16px;border-bottom:1px solid #1e293b;text-align:right;font-weight:700;color:#f8fafc;">{count}</td>
            </tr>"""

        category_rows = ""
        for cat, count in stats.get("top_categories", [])[:5]:
            category_rows += f"""
            <tr>
              <td style="padding:8px 16px;border-bottom:1px solid #1e293b;color:#cbd5e1;">{cat}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #1e293b;text-align:right;font-weight:700;color:#f8fafc;">{count}</td>
            </tr>"""

        team_rows = ""
        for team, count in stats.get("top_teams", [])[:5]:
            team_rows += f"""
            <tr>
              <td style="padding:8px 16px;border-bottom:1px solid #1e293b;color:#cbd5e1;">{team}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #1e293b;text-align:right;font-weight:700;color:#f8fafc;">{count}</td>
            </tr>"""

        # Convert markdown-style bullets to HTML
        insights_html = ai_insights.get("insights", "").replace("\n- ", "\n<li>").replace("\n- ", "\n<li>")
        if insights_html.startswith("- "):
            insights_html = "<li>" + insights_html[2:]
        insights_html = insights_html.replace("\n", "<br>") if "<li>" not in insights_html else f"<ul style='padding-left:20px;color:#cbd5e1;'>{insights_html}</ul>"

        recommendations_html = ai_insights.get("recommendations", "").replace("\n- ", "\n<li>").replace("\n- ", "\n<li>")
        if recommendations_html.startswith("- "):
            recommendations_html = "<li>" + recommendations_html[2:]
        recommendations_html = recommendations_html.replace("\n", "<br>") if "<li>" not in recommendations_html else f"<ul style='padding-left:20px;color:#cbd5e1;'>{recommendations_html}</ul>"

        sla_color = "#22c55e" if stats["sla_compliance_rate"] >= 90 else "#eab308" if stats["sla_compliance_rate"] >= 75 else "#ef4444"
        resolution_color = "#22c55e" if stats["resolution_rate"] >= 80 else "#eab308" if stats["resolution_rate"] >= 60 else "#ef4444"

        html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
              <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:900;">HELPDESK<span style="color:#10b981;">.AI</span></h1>
              <p style="color:#94a3b8; margin:8px 0 0; font-size:14px;">Weekly Performance Digest</p>
            </td>
          </tr>

          <!-- Badge -->
          <tr>
            <td style="padding: 24px 40px; border-bottom: 1px solid #f1f5f9; background-color: #f8fafc; text-align: center;">
              <div style="display:inline-block; padding: 6px 12px; background-color: #ecfdf5; border-radius: 999px; border: 1px solid #d1fae5;">
                <p style="margin:0; color:#065f46; font-size:12px; font-weight:800; text-transform:uppercase;">📊 {company_name} &mdash; {week_start} to {week_end}</p>
              </div>
            </td>
          </tr>

          <!-- AI Summary -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <h2 style="color:#0f172a; font-size:20px; margin:0 0 12px;">AI Executive Summary</h2>
              <p style="color:#64748b; font-size:15px; line-height:1.7; margin:0;">{ai_insights.get('summary', 'N/A')}</p>
            </td>
          </tr>

          <!-- Key Metrics Grid -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#0f172a;border-radius:16px;padding:20px;text-align:center;width:25%;">
                    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;font-weight:800;text-transform:uppercase;">Created</p>
                    <h2 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:900;">{stats['total_created']}</h2>
                  </td>
                  <td width="12"></td>
                  <td style="background:#0f172a;border-radius:16px;padding:20px;text-align:center;width:25%;">
                    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;font-weight:800;text-transform:uppercase;">Resolved</p>
                    <h2 style="margin:8px 0 0;color:#10b981;font-size:28px;font-weight:900;">{stats['total_resolved'] + stats['total_closed']}</h2>
                  </td>
                  <td width="12"></td>
                  <td style="background:#0f172a;border-radius:16px;padding:20px;text-align:center;width:25%;">
                    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;font-weight:800;text-transform:uppercase;">Open</p>
                    <h2 style="margin:8px 0 0;color:#eab308;font-size:28px;font-weight:900;">{stats['total_open']}</h2>
                  </td>
                  <td width="12"></td>
                  <td style="background:#0f172a;border-radius:16px;padding:20px;text-align:center;width:25%;">
                    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:10px;font-weight:800;text-transform:uppercase;">In Progress</p>
                    <h2 style="margin:8px 0 0;color:#3b82f6;font-size:28px;font-weight:900;">{stats['total_in_progress']}</h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Performance Rates -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">Resolution Rate</p>
                    <h2 style="margin:6px 0 0;color:{resolution_color};font-size:32px;font-weight:900;">{stats['resolution_rate']}%</h2>
                  </td>
                  <td width="12"></td>
                  <td style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">SLA Compliance</p>
                    <h2 style="margin:6px 0 0;color:{sla_color};font-size:32px;font-weight:900;">{stats['sla_compliance_rate']}%</h2>
                  </td>
                  <td width="12"></td>
                  <td style="background:#f8fafc;border-radius:16px;padding:20px;text-align:center;border:1px solid #e2e8f0;">
                    <p style="margin:0;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">Avg Resolution</p>
                    <h2 style="margin:6px 0 0;color:#0f172a;font-size:32px;font-weight:900;">{stats.get('avg_resolution_hours', 'N/A')}h</h2>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Priority Breakdown -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;">Priority Breakdown</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#0f172a;border-radius:12px;overflow:hidden;">
                {priority_rows if priority_rows else '<tr><td style="padding:16px;color:#94a3b8;text-align:center;">No tickets this period</td></tr>'}
              </table>
            </td>
          </tr>

          <!-- Top Categories -->
          {"" if not stats.get("top_categories") else f'''
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;">Top Categories</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#0f172a;border-radius:12px;overflow:hidden;">
                {category_rows}
              </table>
            </td>
          </tr>'''}

          <!-- Top Teams -->
          {"" if not stats.get("top_teams") else f'''
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;">Team Workload</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#0f172a;border-radius:12px;overflow:hidden;">
                {team_rows}
              </table>
            </td>
          </tr>'''}

          <!-- AI Insights -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;">AI Insights</h3>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;color:#166534;font-size:14px;line-height:1.7;">
                {insights_html}
              </div>
            </td>
          </tr>

          <!-- AI Recommendations -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <h3 style="color:#0f172a;font-size:16px;margin:0 0 12px;">AI Recommendations</h3>
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;color:#1e40af;font-size:14px;line-height:1.7;">
                {recommendations_html}
              </div>
            </td>
          </tr>

          <!-- Additional Stats Footer -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background:#f8fafc;border-radius:12px;padding:16px;border:1px solid #e2e8f0;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="text-align:center;">
                      <p style="margin:0;color:#64748b;font-size:11px;font-weight:600;">AI Auto-Resolved</p>
                      <p style="margin:4px 0 0;color:#10b981;font-size:20px;font-weight:900;">{stats['auto_resolved_count']}</p>
                    </td>
                    <td style="text-align:center;">
                      <p style="margin:0;color:#64748b;font-size:11px;font-weight:600;">Duplicates Detected</p>
                      <p style="margin:4px 0 0;color:#8b5cf6;font-size:20px;font-weight:900;">{stats['duplicate_count']}</p>
                    </td>
                    <td style="text-align:center;">
                      <p style="margin:0;color:#64748b;font-size:11px;font-weight:600;">SLA Breached</p>
                      <p style="margin:4px 0 0;color:#ef4444;font-size:20px;font-weight:900;">{stats['sla_breached']}</p>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; padding:32px; text-align:center; border-top: 1px solid #f1f5f9;">
              <p style="margin:0; color:#94a3b8; font-size:12px;">This is an automated weekly digest generated by HELPDESK.AI</p>
              <p style="margin:4px 0 0; color:#94a3b8; font-size:12px;">Powered by Gemini AI &bull; © 2026 HELPDESK.AI</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

        return html

    async def _send_email(self, recipient_email: str, subject: str, html: str) -> Dict:
        """
        Send email via Supabase Edge Function (email-notifier).

        Args:
            recipient_email: Email address of the recipient
            subject: Email subject line
            html: HTML body of the email

        Returns:
            Dict with send result
        """
        try:
            # Invoke the Supabase Edge Function for sending emails
            response = self.supabase.functions.invoke(
                "email-notifier",
                invoke_options={
                    "body": {
                        "type": "DIGEST",
                        "email": recipient_email,
                        "subject": subject,
                        "html": html
                    }
                }
            )
            logger.info(f"Email sent to {recipient_email}: {response}")
            return {"status": "sent", "recipient": recipient_email}
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
            # Fallback: try direct Resend API call if edge function fails
            return await self._send_email_resend_fallback(recipient_email, subject, html)

    async def _send_email_resend_fallback(self, recipient_email: str, subject: str, html: str) -> Dict:
        """
        Fallback email sending via Resend API directly.

        Args:
            recipient_email: Email address of the recipient
            subject: Email subject line
            html: HTML body of the email

        Returns:
            Dict with send result
        """
        resend_api_key = os.getenv("RESEND_API_KEY")
        if not resend_api_key:
            logger.error("RESEND_API_KEY not set, cannot send fallback email")
            return {"status": "error", "message": "No email transport configured"}

        from_email = os.getenv("DIGEST_FROM_EMAIL", "HELPDESK.AI <noreply@helpdeskai.com>")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": from_email,
                        "to": [recipient_email],
                        "subject": subject,
                        "html": html
                    },
                    timeout=30.0
                )
                result = response.json()
                logger.info(f"Fallback email sent to {recipient_email}: {result}")
                return {"status": "sent", "recipient": recipient_email, "provider_response": result}
        except Exception as e:
            logger.error(f"Fallback email failed for {recipient_email}: {str(e)}")
            return {"status": "error", "message": str(e)}

    def _log_digest_sent(self, company_id: str, recipient_count: int) -> None:
        """
        Log that a digest was sent to prevent duplicate sends.

        Args:
            company_id: UUID of the company
            recipient_count: Number of recipients who received the digest
        """
        try:
            self.supabase.table("weekly_digest_log").insert({
                "company_id": company_id,
                "sent_at": datetime.now(timezone.utc).isoformat(),
                "recipient_count": recipient_count
            }).execute()
            logger.info(f"Digest log recorded for company {company_id}")
        except Exception as e:
            # Table might not exist yet — log warning but don't fail
            logger.warning(f"Could not log digest (table may not exist): {str(e)}")

    def _check_already_sent(self, company_id: str) -> bool:
        """
        Check if a digest was already sent for this company this week.

        Args:
            company_id: UUID of the company

        Returns:
            True if already sent this week, False otherwise
        """
        try:
            week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
            response = self.supabase.table("weekly_digest_log").select("id").eq(
                "company_id", company_id
            ).gte("sent_at", week_ago).limit(1).execute()

            return bool(response.data)
        except Exception:
            # Table might not exist — allow sending
            return False

    async def generate_and_send_digest(
        self,
        company_id: Optional[str] = None,
        force: bool = False
    ) -> Dict[str, Any]:
        """
        Generate and send weekly digest emails.

        If company_id is provided, processes only that company.
        Otherwise, processes all companies with digest_frequency='weekly'.

        Args:
            company_id: Optional UUID of specific company to process
            force: If True, skip duplicate check

        Returns:
            Dict with processing results and statistics
        """
        results = {
            "companies_processed": 0,
            "emails_sent": 0,
            "errors": [],
            "details": []
        }

        now_utc = datetime.now(timezone.utc)
        week_ago = now_utc - timedelta(days=7)
        week_start_str = week_ago.strftime("%b %d, %Y")
        week_end_str = now_utc.strftime("%b %d, %Y")

        # Determine which companies to process
        if company_id:
            companies = [{"company_id": company_id, "digest_frequency": "weekly"}]
        else:
            all_companies = self._get_all_companies()
            companies = [
                c for c in all_companies
                if c.get("digest_frequency") in ("weekly", "daily")
            ]

        for company in companies:
            cid = company["company_id"]
            try:
                # Check if already sent this week
                if not force and self._check_already_sent(cid):
                    logger.info(f"Digest already sent this week for company {cid}, skipping")
                    results["details"].append({
                        "company_id": cid,
                        "status": "skipped",
                        "reason": "Already sent this week"
                    })
                    continue

                # Check notification settings
                settings = company
                if not settings.get("email_notifications", True):
                    logger.info(f"Email notifications disabled for company {cid}, skipping")
                    results["details"].append({
                        "company_id": cid,
                        "status": "skipped",
                        "reason": "Email notifications disabled"
                    })
                    continue

                # Fetch stats
                stats = self._fetch_ticket_stats(cid, week_ago)

                # Get company name from profiles
                company_name = "Your Company"
                try:
                    profile_res = self.supabase.table("profiles").select(
                        "company"
                    ).eq("company_id", cid).limit(1).execute()
                    if profile_res.data and profile_res.data[0].get("company"):
                        company_name = profile_res.data[0]["company"]
                except Exception:
                    pass

                # Generate AI insights
                ai_insights = self._generate_ai_insights(stats, company_name)

                # Build email HTML
                html = self._build_email_html(
                    company_name, stats, ai_insights, week_start_str, week_end_str
                )

                # Get admin recipients
                admins = self._get_company_admins(cid)
                if not admins:
                    logger.warning(f"No admin emails found for company {cid}")
                    results["details"].append({
                        "company_id": cid,
                        "status": "skipped",
                        "reason": "No admin recipients found"
                    })
                    continue

                # Send to each admin
                subject = f"[HELPDESK.AI] Weekly Digest — {company_name} ({week_start_str} – {week_end_str})"
                sent_count = 0
                for admin in admins:
                    result = await self._send_email(admin["email"], subject, html)
                    if result.get("status") == "sent":
                        sent_count += 1
                    else:
                        results["errors"].append({
                            "company_id": cid,
                            "email": admin["email"],
                            "error": result.get("message", "Unknown error")
                        })

                # Log the digest send
                if sent_count > 0:
                    self._log_digest_sent(cid, sent_count)

                results["companies_processed"] += 1
                results["emails_sent"] += sent_count
                results["details"].append({
                    "company_id": cid,
                    "company_name": company_name,
                    "status": "sent",
                    "recipients": sent_count,
                    "stats_summary": {
                        "total_tickets": stats["total_created"],
                        "resolution_rate": stats["resolution_rate"],
                        "sla_compliance": stats["sla_compliance_rate"]
                    }
                })

                logger.info(f"Digest sent for {company_name} ({cid}): {sent_count} emails")

            except Exception as e:
                logger.error(f"Error processing digest for company {cid}: {str(e)}")
                results["errors"].append({
                    "company_id": cid,
                    "error": str(e)
                })

        logger.info(
            f"Digest run complete. Companies: {results['companies_processed']}, "
            f"Emails: {results['emails_sent']}, Errors: {len(results['errors'])}"
        )
        return results

    async def get_digest_preview(self, company_id: str) -> Dict[str, Any]:
        """
        Generate a preview of the weekly digest without sending emails.
        Useful for admin dashboard preview.

        Args:
            company_id: UUID of the company

        Returns:
            Dict with stats and AI insights (no email sent)
        """
        now_utc = datetime.now(timezone.utc)
        week_ago = now_utc - timedelta(days=7)
        week_start_str = week_ago.strftime("%b %d, %Y")
        week_end_str = now_utc.strftime("%b %d, %Y")

        stats = self._fetch_ticket_stats(company_id, week_ago)

        company_name = "Your Company"
        try:
            profile_res = self.supabase.table("profiles").select(
                "company"
            ).eq("company_id", company_id).limit(1).execute()
            if profile_res.data and profile_res.data[0].get("company"):
                company_name = profile_res.data[0]["company"]
        except Exception:
            pass

        ai_insights = self._generate_ai_insights(stats, company_name)

        return {
            "company_name": company_name,
            "period": {"start": week_start_str, "end": week_end_str},
            "stats": stats,
            "ai_insights": ai_insights
        }


# Singleton instance
_instance: Optional[WeeklyDigestService] = None


def load() -> WeeklyDigestService:
    """Load and return singleton instance of WeeklyDigestService."""
    global _instance
    if _instance is None:
        _instance = WeeklyDigestService()
        logger.info("WeeklyDigestService loaded")
    return _instance


def get_instance() -> Optional[WeeklyDigestService]:
    """Get the singleton instance if already loaded."""
    return _instance
