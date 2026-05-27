"""
Weekly AI Digest Email Service — Issue #208

Queries last 7 days of ticket data from Supabase, generates a Gemini AI summary,
and sends a formatted HTML digest email via Resend to company admins.
"""

import os
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Resend — lazy import so the app still starts without the SDK installed
# ---------------------------------------------------------------------------
try:
    import resend as _resend_sdk
    _HAS_RESEND = True
except ImportError:
    _resend_sdk = None
    _HAS_RESEND = False


def _resend_api_key() -> Optional[str]:
    return os.environ.get("RESEND_API_KEY")


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

def get_weekly_stats(supabase_client, company_id: Optional[str] = None) -> dict:
    """
    Query Supabase for ticket statistics over the past 7 days.

    Returns a dict with totals, resolution rate, SLA breach count,
    top 3 categories, and a comparison % change vs the prior 7-day window.
    """
    if supabase_client is None:
        raise RuntimeError("Supabase client is not available")

    now = datetime.now(timezone.utc)
    week_start = now - timedelta(days=7)
    prev_week_start = now - timedelta(days=14)

    week_iso = week_start.isoformat()
    prev_iso = prev_week_start.isoformat()
    now_iso = now.isoformat()

    def _query(from_ts: str, to_ts: str):
        q = supabase_client.table("tickets").select(
            "id, status, category, sla_status, created_at"
        ).gte("created_at", from_ts).lt("created_at", to_ts)
        if company_id:
            q = q.eq("company_id", company_id)
        return q.execute().data or []

    this_week = _query(week_iso, now_iso)
    last_week = _query(prev_iso, week_iso)

    def _is_resolved(t: dict) -> bool:
        status = (t.get("status") or "").lower()
        return any(s in status for s in ["resolv", "closed", "auto-resolv"])

    def _is_breached(t: dict) -> bool:
        return (t.get("sla_status") or "").lower() == "breached"

    total_this = len(this_week)
    total_last = len(last_week)
    resolved_this = sum(1 for t in this_week if _is_resolved(t))
    breached_this = sum(1 for t in this_week if _is_breached(t))

    resolution_rate = round(resolved_this / total_this * 100, 1) if total_this else 0.0

    if total_last > 0:
        pct_change = round((total_this - total_last) / total_last * 100, 1)
    else:
        pct_change = 0.0

    # Top 3 categories by ticket count this week
    category_counts: dict[str, int] = {}
    for t in this_week:
        cat = (t.get("category") or "Uncategorized").strip()
        category_counts[cat] = category_counts.get(cat, 0) + 1
    top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:3]

    return {
        "total_tickets": total_this,
        "total_tickets_last_week": total_last,
        "pct_change": pct_change,
        "resolved_count": resolved_this,
        "resolution_rate": resolution_rate,
        "sla_breaches": breached_this,
        "top_categories": top_categories,
        "period_start": week_iso,
        "period_end": now_iso,
    }


# ---------------------------------------------------------------------------
# AI Summary
# ---------------------------------------------------------------------------

def generate_ai_summary(stats: dict, gemini_service=None) -> str:
    """
    Use Gemini to produce a 3-sentence plain-English summary of the week's stats.
    Falls back to a template summary when Gemini is unavailable.
    """
    if gemini_service is None or not getattr(gemini_service, "_initialized", False):
        return _fallback_summary(stats)

    top_cats = ", ".join(c for c, _ in stats["top_categories"]) or "N/A"
    prompt = (
        "You are an IT manager assistant. Summarize this week's helpdesk performance "
        "in exactly 3 concise sentences. Be factual and professional.\n\n"
        f"- Total tickets this week: {stats['total_tickets']} "
        f"({stats['pct_change']:+.1f}% vs last week)\n"
        f"- Resolution rate: {stats['resolution_rate']}%\n"
        f"- SLA breaches: {stats['sla_breaches']}\n"
        f"- Top categories: {top_cats}\n"
    )

    try:
        response = gemini_service.client.models.generate_content(
            model=gemini_service.model_name,
            contents=prompt,
        )
        text = (response.text or "").strip()
        return text if text else _fallback_summary(stats)
    except Exception as exc:
        logger.warning("Gemini summary failed: %s", exc)
        return _fallback_summary(stats)


def _fallback_summary(stats: dict) -> str:
    top_cats = ", ".join(c for c, _ in stats["top_categories"]) or "N/A"
    trend = "up" if stats["pct_change"] >= 0 else "down"
    return (
        f"This week your helpdesk handled {stats['total_tickets']} tickets, "
        f"{trend} {abs(stats['pct_change']):.1f}% compared to last week. "
        f"The resolution rate stood at {stats['resolution_rate']}% with "
        f"{stats['sla_breaches']} SLA breach(es) recorded. "
        f"The most common ticket categories were: {top_cats}."
    )


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------

def _build_html(stats: dict, summary: str, app_url: str) -> str:
    top_cat_rows = "".join(
        f"<tr><td style='padding:6px 12px;border-bottom:1px solid #f0f0f0'>{cat}</td>"
        f"<td style='padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700'>{count}</td></tr>"
        for cat, count in stats["top_categories"]
    )
    trend_arrow = "&#9650;" if stats["pct_change"] >= 0 else "&#9660;"
    trend_color = "#e53e3e" if stats["pct_change"] >= 0 else "#38a169"

    period_start = stats["period_start"][:10]
    period_end = stats["period_end"][:10]

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Weekly Helpdesk Digest</title>
</head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:32px 0">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07)">

      <!-- Header -->
      <tr><td style="background:#1e1e2e;padding:32px 40px">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px">
          &#128202; Weekly Helpdesk Digest
        </h1>
        <p style="margin:6px 0 0;color:#a0aec0;font-size:13px">{period_start} &rarr; {period_end}</p>
      </td></tr>

      <!-- Stats grid -->
      <tr><td style="padding:32px 40px 16px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="25%" style="text-align:center;padding:16px;background:#f7f8fa;border-radius:12px;margin:4px">
              <p style="margin:0;font-size:28px;font-weight:900;color:#1e1e2e">{stats['total_tickets']}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:0.05em">Total Tickets</p>
              <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:{trend_color}">{trend_arrow} {abs(stats['pct_change']):.1f}%</p>
            </td>
            <td width="4%"></td>
            <td width="25%" style="text-align:center;padding:16px;background:#f0fff4;border-radius:12px">
              <p style="margin:0;font-size:28px;font-weight:900;color:#276749">{stats['resolution_rate']}%</p>
              <p style="margin:4px 0 0;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:0.05em">&#9989; Resolution Rate</p>
            </td>
            <td width="4%"></td>
            <td width="25%" style="text-align:center;padding:16px;background:#fff5f5;border-radius:12px">
              <p style="margin:0;font-size:28px;font-weight:900;color:#c53030">{stats['sla_breaches']}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#718096;text-transform:uppercase;letter-spacing:0.05em">&#9888; SLA Breaches</p>
            </td>
            <td width="4%"></td>
            <td width="13%"></td>
          </tr>
        </table>
      </td></tr>

      <!-- Top categories -->
      <tr><td style="padding:8px 40px 24px">
        <h2 style="margin:0 0 12px;font-size:14px;font-weight:900;color:#1e1e2e;text-transform:uppercase;letter-spacing:0.08em">
          &#127942; Top Ticket Categories
        </h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <tr style="background:#f7f8fa">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#718096;text-transform:uppercase">Category</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#718096;text-transform:uppercase">Tickets</th>
          </tr>
          {top_cat_rows if top_cat_rows else "<tr><td colspan='2' style='padding:12px;text-align:center;color:#a0aec0'>No data</td></tr>"}
        </table>
      </td></tr>

      <!-- AI Summary -->
      <tr><td style="padding:0 40px 32px">
        <div style="background:#f0f4ff;border-left:4px solid #5a67d8;border-radius:8px;padding:20px 24px">
          <p style="margin:0 0 8px;font-size:12px;font-weight:900;color:#5a67d8;text-transform:uppercase;letter-spacing:0.08em">
            &#129504; AI Performance Summary
          </p>
          <p style="margin:0;font-size:14px;color:#2d3748;line-height:1.7">{summary}</p>
        </div>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding:0 40px 40px;text-align:center">
        <a href="{app_url}" style="display:inline-block;background:#5a67d8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:900;letter-spacing:0.05em">
          &#128279; View Full Dashboard
        </a>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f7f8fa;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center">
        <p style="margin:0;font-size:11px;color:#a0aec0">
          Helpdesk.AI &mdash; Automated weekly digest &bull; To disable, visit your Admin Settings.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""


def send_digest_email(
    admin_email: str,
    stats: dict,
    summary: str,
    app_url: str = "https://helpdeskaiv1.vercel.app",
    from_email: str = "digest@helpdesk.ai",
) -> dict:
    """
    Send the weekly digest HTML email via Resend.

    Returns a dict with ``{"ok": True, "id": "<message-id>"}`` on success or
    ``{"ok": False, "error": "<message>"}`` on failure.
    """
    api_key = _resend_api_key()
    if not api_key:
        return {"ok": False, "error": "RESEND_API_KEY environment variable not set"}

    if not _HAS_RESEND:
        return {"ok": False, "error": "resend package is not installed"}

    period_start = stats.get("period_start", "")[:10]
    period_end = stats.get("period_end", "")[:10]
    subject = f"Helpdesk.AI Weekly Digest — {period_start} to {period_end}"
    html_body = _build_html(stats, summary, app_url)

    try:
        _resend_sdk.api_key = api_key
        response = _resend_sdk.Emails.send({
            "from": from_email,
            "to": [admin_email],
            "subject": subject,
            "html": html_body,
        })
        msg_id = getattr(response, "id", None) or (response.get("id") if isinstance(response, dict) else None)
        logger.info("Digest email sent to %s (id=%s)", admin_email, msg_id)
        return {"ok": True, "id": msg_id}
    except Exception as exc:
        logger.error("Failed to send digest email to %s: %s", admin_email, exc)
        return {"ok": False, "error": str(exc)}


# ---------------------------------------------------------------------------
# Orchestrator — called by the scheduler and the manual-trigger endpoint
# ---------------------------------------------------------------------------

def run_digest_for_company(
    supabase_client,
    company_id: str,
    admin_email: str,
    gemini_service=None,
    app_url: str = "https://helpdeskaiv1.vercel.app",
) -> dict:
    """
    Full pipeline: fetch stats → generate summary → send email.
    Returns a result dict suitable for API responses.
    """
    try:
        stats = get_weekly_stats(supabase_client, company_id)
    except Exception as exc:
        return {"ok": False, "error": f"Stats query failed: {exc}"}

    summary = generate_ai_summary(stats, gemini_service)
    result = send_digest_email(admin_email, stats, summary, app_url=app_url)
    result["stats"] = stats
    result["summary"] = summary
    return result
