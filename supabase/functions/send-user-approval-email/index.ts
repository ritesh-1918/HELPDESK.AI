import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || 'HelpDesk AI <noreply@helpdesk.ai>';
const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { userId, email, name, company } = await req.json();

        if (!email) {
            throw new Error('Email is required');
        }

        if (!RESEND_API_KEY) {
            console.warn(`RESEND_API_KEY not configured — simulating approval email for ${email}`);
            return new Response(
                JSON.stringify({
                    success: true,
                    simulated: true,
                    message: `Approval email simulated for ${email} (RESEND_API_KEY not set)`
                }),
                {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        console.log(`Sending approval email to ${email} for user ${name} in company ${company}...`);

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: SENDER_EMAIL,
                to: [email],
                subject: 'Account Approved! Welcome to HelpDesk.ai',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #10b981;">Hello ${name},</h2>
                        <p>Your account for <strong>${company}</strong> has been approved by your administrator!</p>
                        <p>You can now log in to the system and access your dashboard.</p>
                        <a href="${FRONTEND_URL}/dashboard"
                           style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px;">
                            Go to Dashboard
                        </a>
                        <p style="color: #64748b; font-size: 14px; margin-top: 16px;">If you have any questions, feel free to reach out.</p>
                        <p>Best regards,<br>HelpDesk.ai Team</p>
                    </div>
                `,
            })
        });

        if (!res.ok) {
            const errorBody = await res.text();
            console.error(`Resend API error: ${res.status} ${errorBody}`);
            throw new Error(`Failed to send email via Resend: ${res.status}`);
        }

        const responseData = await res.json();
        console.log(`Approval email sent successfully to ${email}, id: ${responseData.id}`);

        return new Response(
            JSON.stringify({
                success: true,
                emailId: responseData.id,
                message: `Approval email sent to ${email}`
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error(`Error sending approval email: ${error.message}`);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});