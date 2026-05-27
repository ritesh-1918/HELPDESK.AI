import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL =
  Deno.env.get("APPROVAL_FROM_EMAIL") ||
  Deno.env.get("RESEND_FROM_EMAIL") ||
  "HELPDESK.AI <noreply@helpdesk.ai>";
const DASHBOARD_URL =
  Deno.env.get("FRONTEND_DASHBOARD_URL") ||
  Deno.env.get("FRONTEND_URL") ||
  "https://helpdeskaiv1.vercel.app/dashboard";

function buildApprovalHtml(name: string, company: string): string {
  const safeName = name || "there";
  const safeCompany = company || "your organization";
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);">
        <tr>
          <td style="background:linear-gradient(135deg,#059669 0%,#047857 100%);padding:40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:900;">HELPDESK<span style="color:#a7f3d0;">.AI</span></h1>
            <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">Account Approved</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="color:#0f172a;font-size:24px;margin:0 0 16px;">Hello ${safeName},</h2>
            <p style="color:#64748b;font-size:16px;line-height:1.7;margin:0 0 24px;">
              Your account for <strong>${safeCompany}</strong> has been approved by your administrator.
              You can now sign in and access your dashboard.
            </p>
            <div align="center">
              <a href="${DASHBOARD_URL}" style="display:inline-block;background-color:#059669;color:#ffffff;padding:16px 32px;border-radius:12px;text-decoration:none;font-size:14px;font-weight:800;">
                Go to Dashboard →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#f8fafc;padding:24px;text-align:center;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">© 2026 HELPDESK.AI</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { userId, email, name, company } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    if (!RESEND_API_KEY) {
      console.warn(
        `[send-user-approval-email] RESEND_API_KEY missing — cannot send to ${email}`,
      );
      return new Response(
        JSON.stringify({
          success: false,
          error: "RESEND_API_KEY is not configured",
          userId: userId ?? null,
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `[send-user-approval-email] Sending approval email to ${email} (user=${userId ?? "unknown"})`,
    );

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "Account Approved — Welcome to HELPDESK.AI",
        html: buildApprovalHtml(name, company),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[send-user-approval-email] Resend error:", data);
      return new Response(
        JSON.stringify({
          success: false,
          error: data?.message || "Failed to send approval email",
          details: data,
        }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Approval email sent to ${email}`,
        resendId: data?.id ?? null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
