import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

/**
 * SLA Notifier — Multi-channel notification dispatcher for SLA breaches.
 *
 * Triggered by Supabase Database webhook when:
 *   1. A ticket's sla_status changes to 'breached' or 'warning'
 *   2. An escalation_logs row is inserted
 *
 * Supported channels:
 *   - Email (via Resend)
 *   - Slack (incoming webhook)
 *   - Microsoft Teams (incoming webhook)
 *   - Generic webhook
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || ""
const FROM_EMAIL = "HELPDESK.AI SLA <bonthalamadhavi1@gmail.com>"

// ── Channel configuration from environment ────────────────────────────────
// Format: JSON array of channel objects
// SLA_CHANNELS=[{"type":"slack","url":"https://hooks.slack.com/...","enabled":true,"min_level":1}]
const SLA_CHANNELS_RAW = Deno.env.get("SLA_CHANNELS") || "[]"
let SLA_CHANNELS: any[] = []
try {
  SLA_CHANNELS = JSON.parse(SLA_CHANNELS_RAW)
} catch { /* use empty */ }

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "OVERDUE"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function getColor(status: string): string {
  if (status === "breached") return "#ef4444"  // red
  if (status === "warning") return "#f59e0b"   // amber
  return "#10b981"  // green
}

// ── Channel dispatchers ────────────────────────────────────────────────────

async function sendEmail(payload: any): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[SLA-Notifier] No RESEND_API_KEY configured — skipping email.")
    return false
  }

  const templateData = payload.template_data || {}
  const recipient = payload.to || "support@helpdeskai.com"

  const themeColor = "#ef4444"
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center;">
              <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:900;">HELPDESK<span style="color:#fca5a5;">.AI</span></h1>
              <p style="color:#fecaca; margin:8px 0 0; font-size:14px;">SLA Alert System</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; border-bottom: 1px solid #f1f5f9; background-color: #fef2f2; text-align: center;">
              <div style="display:inline-block; padding: 8px 16px; background-color: #fef2f2; border-radius: 999px; border: 1px solid #fecaca;">
                <p style="margin:0; color:#991b1b; font-size:12px; font-weight:800; text-transform:uppercase;">${templateData.badge || "SLA NOTIFICATION"}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#0f172a; font-size:24px; margin: 0 0 16px;">${templateData.title || "SLA Alert"}</h2>
              <p style="color:#64748b; font-size:16px; line-height:1.7; margin: 0 0 32px;">${templateData.mainText || ""}</p>
              
              <div style="background-color: #0f172a; border-radius: 20px; padding: 32px; text-align:center; margin-bottom: 32px;">
                <p style="margin:0; color:rgba(255,255,255,0.4); font-size:10px; font-weight:800; text-transform:uppercase;">${templateData.refLabel || "Status"}</p>
                <h2 style="margin:8px 0 0; color:#ffffff; font-size:32px; font-weight:900; letter-spacing:0.1em;">${templateData.refValue || ""}</h2>
              </div>

              <div align="center">
                <a href="${templateData.ctaUrl || "https://helpdeskaiv1.vercel.app/admin/tickets"}" style="display:inline-block; background-color:#dc2626; color:#ffffff; padding: 18px 40px; border-radius: 16px; text-decoration:none; font-size:14px; font-weight:900;">
                  ${templateData.ctaText || "View in Dashboard"} →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc; padding:32px; text-align:center; border-top: 1px solid #f1f5f9;">
              <p style="margin:0; color:#94a3b8; font-size:12px;">© 2026 HELPDESK.AI SLA Engine</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipient],
        subject: payload.subject || "[SLA Alert] HELPDESK.AI",
        html: html,
      }),
    })
    const data = await res.json()
    console.log(`[SLA-Notifier] Email sent to ${recipient}: ${res.status}`, data)
    return res.status < 500
  } catch (err) {
    console.error("[SLA-Notifier] Email send error:", err)
    return false
  }
}

async function sendSlack(payload: any): Promise<boolean> {
  try {
    const res = await fetch(payload.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.body || {}),
    })
    console.log(`[SLA-Notifier] Slack sent: ${res.status}`)
    return res.ok
  } catch (err) {
    console.error("[SLA-Notifier] Slack error:", err)
    return false
  }
}

async function sendTeams(payload: any): Promise<boolean> {
  try {
    const res = await fetch(payload.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.body || {}),
    })
    console.log(`[SLA-Notifier] Teams sent: ${res.status}`)
    return res.ok
  } catch (err) {
    console.error("[SLA-Notifier] Teams error:", err)
    return false
  }
}

async function sendWebhook(payload: any): Promise<boolean> {
  try {
    const res = await fetch(payload.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.body || {}),
    })
    console.log(`[SLA-Notifier] Webhook sent: ${res.status}`)
    return res.ok
  } catch (err) {
    console.error("[SLA-Notifier] Webhook error:", err)
    return false
  }
}

// ── Build a Slack-compatible attachment ────────────────────────────────────

function buildSlackMessage(ticket: any, slaResult: any): any {
  const status = slaResult?.sla_status || "breached"
  const level = slaResult?.escalation_level || 1
  const color = getColor(status)
  const ticketId = (ticket?.id || "???").toString().slice(0, 8).toUpperCase()
  const subject = ticket?.subject || ticket?.summary || "Untitled"
  const priority = (ticket?.priority || "medium").toUpperCase()
  const team = ticket?.assigned_team || "Unassigned"

  return {
    attachments: [{
      color,
      title: `[SLA ${status.toUpperCase()}] Ticket #${ticketId}`,
      text: [
        `*Ticket:* #${ticketId} — ${subject}`,
        `*Priority:* ${priority} | *Team:* ${team}`,
        `*Escalation Level:* ${level}`,
        `*Time Remaining:* ${formatDuration(slaResult?.remaining_seconds || 0)}`,
      ].join("\n"),
      footer: "HELPDESK.AI SLA Engine",
      ts: Math.floor(Date.now() / 1000),
    }],
  }
}

function buildTeamsMessage(ticket: any, slaResult: any): any {
  const ticketId = (ticket?.id || "???").toString().slice(0, 8).toUpperCase()
  const color = getColor(slaResult?.sla_status || "breached")
  return {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: `[SLA ${(slaResult?.sla_status || "").toUpperCase()}] Ticket #${ticketId}`,
    themeColor: color,
    sections: [{
      activityTitle: `SLA Alert: Ticket #${ticketId}`,
      activitySubtitle: ticket?.subject || ticket?.summary || "",
      facts: [
        { name: "Status", value: (slaResult?.sla_status || "").toUpperCase() },
        { name: "Priority", value: (ticket?.priority || "medium").toUpperCase() },
        { name: "Level", value: String(slaResult?.escalation_level || 0) },
        { name: "Team", value: ticket?.assigned_team || "Unassigned" },
        { name: "Remaining", value: formatDuration(slaResult?.remaining_seconds || 0) },
      ],
    }],
  }
}

// ── Main handler ───────────────────────────────────────────────────────────

serve(async (req: Request) => {
  try {
    const payload = await req.json()

    // Support both webhook trigger and direct API call
    const { type, record, ticket, sla_result, channel_urls } = payload
    const isWebhook = type === "INSERT" && record?.table === "escalation_logs"

    if (isWebhook || type === "SLA_ALERT") {
      const escalationRecord = isWebhook ? record : payload
      const targetTicket = ticket || escalationRecord

      // Determine which channels to use
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      // Build common notification payload
      const ticketId = (targetTicket.id || targetTicket.ticket_id || "???").toString().slice(0, 8)
      const status = sla_result?.sla_status || escalationRecord.sla_status || "breached"
      const level = sla_result?.escalation_level || escalationRecord.escalation_level || 1
      const subject = targetTicket.subject || targetTicket.ticket_subject || "Untitled"

      // Dispatch to configured channels
      const results: string[] = []

      for (const channel of SLA_CHANNELS) {
        if (!channel.enabled) continue
        if ((channel.min_level || 0) > level) continue

        const channelType = channel.type || "webhook"
        let success = false

        switch (channelType) {
          case "email": {
            const emailPayload = {
              to: channel.to || "support@helpdeskai.com",
              subject: `[SLA ${status.toUpperCase()}] Ticket #${ticketId}`,
              template_data: {
                title: `${status.toUpperCase()}: Ticket #${ticketId}`,
                badge: `🚨 Escalation Level ${level}`,
                mainText: `Priority ${(targetTicket.priority || "medium").toUpperCase()} ticket "${subject}" has reached SLA status: ${status}.`,
                refLabel: "Time Remaining",
                refValue: formatDuration(sla_result?.remaining_seconds || 0),
                ctaText: "View Ticket",
                ctaUrl: `https://helpdeskaiv1.vercel.app/admin/ticket/${targetTicket.id || ""}`,
              },
            }
            success = await sendEmail(emailPayload)
            break
          }
          case "slack":
            success = await sendSlack({
              url: channel.url,
              body: buildSlackMessage(targetTicket, sla_result),
            })
            break
          case "teams":
            success = await sendTeams({
              url: channel.url,
              body: buildTeamsMessage(targetTicket, sla_result),
            })
            break
          case "webhook":
          default:
            success = await sendWebhook({
              url: channel.url,
              body: {
                type: "sla_alert",
                ticket_id: targetTicket.id || targetTicket.ticket_id,
                sla_status: status,
                escalation_level: level,
                subject,
                remaining_seconds: sla_result?.remaining_seconds || 0,
                timestamp: new Date().toISOString(),
              },
            })
            break
        }

        results.push(`${channelType}:${success ? "OK" : "FAIL"}`)
      }

      // Log dispatched channels back to the escalation_logs record
      if (isWebhook && escalationRecord.id) {
        try {
          await supabase
            .from("escalation_logs")
            .update({ notification_channels: results })
            .eq("id", escalationRecord.id)
        } catch { /* non-fatal */ }
      }

      return new Response(JSON.stringify({
        status: "dispatched",
        channels: results,
        ticket_id: targetTicket.id || targetTicket.ticket_id,
      }), { status: 200 })
    }

    // Health check
    if (type === "HEALTH") {
      return new Response(JSON.stringify({
        status: "ok",
        channels_configured: SLA_CHANNELS.length,
      }), { status: 200 })
    }

    return new Response(JSON.stringify({ status: "ignored", reason: "unknown_type" }), { status: 200 })
  } catch (err: any) {
    console.error("[SLA-Notifier] Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
