import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'HelpDesk.ai <noreply@yourdomain.com>';
        const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://your-frontend-url.com';

        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY environment variable is not configured');
        }

        console.log(`Sending approval email to ${email} for user ${name} in company ${company}...`);

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [email],
                subject: 'Account Approved! Welcome to HelpDesk.ai',
                html: `
                    <h2>Hello ${name},</h2>
                    <p>Your account for <strong>${company}</strong> has been approved by your administrator!</p>
                    <p>You can now log in to the system and access your dashboard.</p>
                    <a href="${FRONTEND_URL}/dashboard" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Go to Dashboard</a>
                `
            })
        });

        if (!res.ok) {
            const errorData = await res.text();
            throw new Error(`Resend API error (${res.status}): ${errorData}`);
        }

        const data = await res.json();

        return new Response(
            JSON.stringify({
                success: true,
                message: `Approval email sent to ${email}`,
                emailId: data.id
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error sending approval email:', error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
});
