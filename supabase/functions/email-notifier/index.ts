import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

// Standard Supabase Secrets
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// User Defined Secrets
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "HELPDESK.AI <bonthalamadhavi1@gmail.com>";

serve(async (req: Request) => {
  try {
    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");

    const payload = await req.json();
    const { type, record, email, code, link } = payload;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    let recipientEmail = email || "support@helpdeskai.com";
    let subject = "[HELPDESK.AI] Notification";
    let templateData: any = {};

    // 1. Resolve Recipient from Record if available
    if (record?.user_id && !email) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(record.user_id);
      if (!userError && userData?.user?.email) {
        recipientEmail = userData.user.email;
      }
    }

    // 2. Define Email Types & Templates
    if (type === "INSERT") {
      const ticketId = record.id?.toString().slice(0, 8).toUpperCase();
      subject = `[HELPDESK.AI] Support Ticket #${ticketId} Received`;
      templateData = {
        title: "Ticket Received",
        badge: "✨ Request Captured",
        mainText: "Your support request has been successfully captured. Our AI is currently analyzing your issue.",
        refLabel: "Tracking Reference",
        refValue: `#${ticketId}`,
        ctaText: "View Ticket Status",
        ctaUrl: `https://helpdeskaiv1.vercel.app/ticket/${record.id}`
      };
    } else if (type === "OTP") {
      subject = "[HELPDESK.AI] Your Recovery Code";
      templateData = {
        title: "Security Verification",
        badge: "🔐 Recovery Protocol",
        mainText: "You requested a password reset. Use the following 6-digit code to continue.",
        refLabel: "Verification Code",
        refValue: code,
        ctaText: "Continue Reset",
        ctaUrl: "https://helpdeskaiv1.vercel.app/forgot-password"
      };
    } else if (type === "MAGIC_LINK") {
      subject = "[HELPDESK.AI] Login Link";
      templateData = {
        title: "Instant Access",
        badge: "🚀 Magic Link",
        mainText: "Click the button below to sign in instantly without a password.",
        refLabel: "Login Request",
        refValue: "Valid for 60 mins",
        ctaText: "Sign In Now",
        ctaUrl: link
      };
    }

    const themeColor = "#10b981";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px; text-align: center;">
              <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:900;">HELPDESK<span style="color:#10b981;">.AI</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; border-bottom: 1px solid #f1f5f9; background-color: #f8fafc; text-align: center;">
              <div style="display:inline-block; padding: 6px 12px; background-color: #ecfdf5; border-radius: 999px; border: 1px solid #d1fae5;">
                <p style="margin:0; color:#065f46; font-size:12px; font-weight:800; text-transform:uppercase;">${templateData.badge}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color:#0f172a; font-size:24px; margin: 0 0 16px;">${templateData.title}</h2>
              <p style="color:#64748b; font-size:16px; line-height:1.7; margin: 0 0 32px;">${templateData.mainText}</p>
              
              <div style="background-color: #0f172a; border-radius: 20px; padding: 32px; text-align:center; margin-bottom: 32px;">
                 <p style="margin:0; color:rgba(255,255,255,0.4); font-size:10px; font-weight:800; text-transform:uppercase;">${templateData.refLabel}</p>
                 <h2 style="margin:8px 0 0; color:#ffffff; font-size:32px; font-weight:900; letter-spacing:0.1em;">${templateData.refValue}</h2>
              </div>

              <div align="center">
                <a href="${templateData.ctaUrl}" style="display:inline-block; background-color:#10b981; color:#ffffff; padding: 18px 40px; border-radius: 16px; text-decoration:none; font-size:14px; font-weight:900;">
                  ${templateData.ctaText} →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc; padding:32px; text-align:center; border-top: 1px solid #f1f5f9;">
              <p style="margin:0; color:#94a3b8; font-size:12px;">© 2026 HELPDESK.AI. Powered by Neural Support.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send Email
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject: subject,
        html: html,
      }),
    });

    const data = await resendRes.json();
    return new Response(JSON.stringify(data), { status: resendRes.status });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
