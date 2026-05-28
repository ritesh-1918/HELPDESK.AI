import os
import resend
from datetime import datetime, timedelta, timezone
from supabase import create_client

# Initialize clients
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
resend.api_key = os.getenv("RESEND_API_KEY")


def get_weekly_stats(company_id: str) -> dict:
    """Query Supabase for last 7 days of ticket stats for a company."""
    now = datetime.now(timezone.utc)
    week_ago = (now - timedelta(days=7)).isoformat()
    two_weeks_ago = (now - timedelta(days=14)).isoformat()

    # This week's tickets
    this_week = (
        supabase.table("tickets")
        .select("*")
        .eq("company_id", company_id)
        .gte("created_at", week_ago)
        .execute()
    )

    # Last week's tickets (for comparison)
    last_week = (
        supabase.table("tickets")
        .select("*")
        .eq("company_id", company_id)
        .gte("created_at", two_weeks_ago)
        .lt("created_at", week_ago)
        .execute()
    )

    tickets = this_week.data or []
    prev_tickets = last_week.data or []

    total = len(tickets)
    prev_total = len(prev_tickets)
    resolved = [t for t in tickets if t.get("status") == "resolved"]
    resolution_rate = round((len(resolved) / total * 100) if total > 0 else 0, 1)

    # Average resolution time (in hours)
    resolution_times = []
    for t in resolved:
        if t.get("created_at") and t.get("updated_at"):
            created = datetime.fromisoformat(t["created_at"].replace("Z", "+00:00"))
            updated = datetime.fromisoformat(t["updated_at"].replace("Z", "+00:00"))
            hours = (updated - created).total_seconds() / 3600
            resolution_times.append(hours)
    avg_resolution_hours = round(sum(resolution_times) / len(resolution_times), 1) if resolution_times else 0

    # Top 3 categories
    category_counts = {}
    for t in tickets:
        cat = t.get("category", "Uncategorized")
        category_counts[cat] = category_counts.get(cat, 0) + 1
    top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:3]

    # SLA breaches
    sla_breaches = len([t for t in tickets if t.get("sla_breached") is True])

    # Week-over-week change
    change = total - prev_total
    change_str = f"+{change}" if change >= 0 else str(change)

    return {
        "total": total,
        "prev_total": prev_total,
        "change_str": change_str,
        "resolved": len(resolved),
        "resolution_rate": resolution_rate,
        "avg_resolution_hours": avg_resolution_hours,
        "top_categories": top_categories,
        "sla_breaches": sla_breaches,
        "week_start": week_ago[:10],
        "week_end": now.strftime("%Y-%m-%d"),
    }


def generate_ai_summary(stats: dict, gemini_model) -> str:
    """Use existing Gemini integration to generate a natural language summary."""
    prompt = f"""You are a professional IT manager assistant. 
Write a concise 3-sentence performance summary for this week's helpdesk report.
Be professional, data-driven, and highlight any concerns or wins.

Data:
- Total tickets this week: {stats['total']} ({stats['change_str']} vs last week)
- Resolution rate: {stats['resolution_rate']}%
- Average resolution time: {stats['avg_resolution_hours']} hours
- SLA breaches: {stats['sla_breaches']}
- Top categories: {', '.join([c[0] for c in stats['top_categories']])}

Write only the 3-sentence summary, no headers or bullet points."""

    try:
        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini summary failed: {e}")
        return f"This week your team handled {stats['total']} tickets with a {stats['resolution_rate']}% resolution rate. Average resolution time was {stats['avg_resolution_hours']} hours. There were {stats['sla_breaches']} SLA breaches this period."


def build_email_html(stats: dict, ai_summary: str, company_name: str) -> str:
    """Build the HTML digest email."""
    top_cats_html = "".join(
        f"<tr><td style='padding:6px 12px;border-bottom:1px solid #f0f0f0'>{cat}</td>"
        f"<td style='padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right'><strong>{count}</strong></td></tr>"
        for cat, count in stats["top_categories"]
    )

    change_color = "#16a34a" if "+" in stats["change_str"] else "#dc2626"
    breach_color = "#dc2626" if stats["sla_breaches"] > 0 else "#16a34a"

    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1e2e,#3b3b6b);padding:32px 40px;text-align:center">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px">HELPDESK.AI</h1>
            <p style="color:#a0a0cc;margin:8px 0 0;font-size:14px">Weekly Digest — {stats['week_start']} to {stats['week_end']}</p>
            <p style="color:#c0c0e0;margin:4px 0 0;font-size:13px">{company_name}</p>
          </td>
        </tr>

        <!-- AI Summary -->
        <tr>
          <td style="padding:28px 40px 20px;background:#fafafa;border-bottom:1px solid #eee">
            <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">🤖 AI Performance Summary</p>
            <p style="margin:0;font-size:15px;color:#333;line-height:1.7;font-style:italic">"{ai_summary}"</p>
          </td>
        </tr>

        <!-- Stats Grid -->
        <tr>
          <td style="padding:28px 40px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" style="background:#f0f4ff;border-radius:10px;padding:20px;text-align:center">
                  <p style="margin:0;font-size:36px;font-weight:bold;color:#3b3b6b">{stats['total']}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#666">Total Tickets</p>
                  <p style="margin:4px 0 0;font-size:12px;color:{change_color}"><strong>{stats['change_str']} vs last week</strong></p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#f0fff4;border-radius:10px;padding:20px;text-align:center">
                  <p style="margin:0;font-size:36px;font-weight:bold;color:#16a34a">{stats['resolution_rate']}%</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#666">Resolution Rate</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#666">{stats['resolved']} of {stats['total']} resolved</p>
                </td>
              </tr>
              <tr><td colspan="3" style="height:16px"></td></tr>
              <tr>
                <td width="48%" style="background:#fffbf0;border-radius:10px;padding:20px;text-align:center">
                  <p style="margin:0;font-size:36px;font-weight:bold;color:#d97706">{stats['avg_resolution_hours']}h</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#666">Avg Resolution Time</p>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#fff5f5;border-radius:10px;padding:20px;text-align:center">
                  <p style="margin:0;font-size:36px;font-weight:bold;color:{breach_color}">{stats['sla_breaches']}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#666">SLA Breaches</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Top Categories -->
        <tr>
          <td style="padding:0 40px 28px">
            <p style="margin:0 0 12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px">📊 Top Ticket Categories</p>
            <table width="100%" style="border:1px solid #eee;border-radius:8px;overflow:hidden">
              <tr style="background:#f8f8f8">
                <th style="padding:8px 12px;text-align:left;font-size:13px;color:#555">Category</th>
                <th style="padding:8px 12px;text-align:right;font-size:13px;color:#555">Count</th>
              </tr>
              {top_cats_html}
            </table>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:0 40px 36px;text-align:center">
            <a href="https://helpdeskaiv1.vercel.app" style="display:inline-block;background:linear-gradient(135deg,#3b3b6b,#6b6bab);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600">View Full Dashboard →</a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee">
            <p style="margin:0;font-size:12px;color:#aaa">This digest was automatically generated by HELPDESK.AI · <a href="#" style="color:#888">Unsubscribe</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


def send_digest_email(to_email: str, company_name: str, stats: dict, ai_summary: str):
    """Send the digest email via Resend."""
    html = build_email_html(stats, ai_summary, company_name)
    params = {
        "from": os.getenv("DIGEST_FROM_EMAIL", "digest@helpdesk.ai"),
        "to": [to_email],
        "subject": f"📊 Weekly Helpdesk Digest — {stats['week_start']} to {stats['week_end']}",
        "html": html,
    }
    response = resend.Emails.send(params)
    return response