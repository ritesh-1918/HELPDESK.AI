import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ESCALATION_MAP: Record<string, string> = {
  "IAM Team": "Security Unit",
  "Network Support": "Network Ops",
  "Application Support": "Software Team",
  "Hardware Support": "Hardware Support Tier 2",
  "General Support": "Software Team",
  "Tier 1 Support": "Tier 2 Support",
  "Tier 2 Support": "Engineering Team"
};

function getEscalatedTeam(currentTeam: string | null | undefined): string {
  const team = (currentTeam || "General Support").trim();
  if (ESCALATION_MAP[team]) {
    return ESCALATION_MAP[team];
  }
  
  // Dynamic tier escalation logic
  if (team.toLowerCase().includes("tier 1")) {
    return team.replace(/tier 1/i, "Tier 2");
  }
  if (team.toLowerCase().includes("tier 2")) {
    return team.replace(/tier 2/i, "Tier 3");
  }
  if (team.toLowerCase().includes("support") && !team.toLowerCase().includes("tier")) {
    return `${team} Tier 2`;
  }
  return `${team} Escalated`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error("Missing Supabase URL or Service Role Key environmental variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 1. Fetch non-resolved tickets where sla_breach_at < NOW and sla_status is active or warning
    const nowStr = new Date().toISOString();
    const { data: breachedTickets, error: fetchError } = await supabase
      .from('tickets')
      .select('id, company_id, subject, priority, assigned_team, escalation_level, status')
      .not('status', 'in', '("resolved","closed","auto-resolved","auto resolved","spam")')
      .neq('sla_status', 'BREACHED')
      .lt('sla_breach_at', nowStr);

    if (fetchError) {
      throw fetchError;
    }

    const results = [];

    if (breachedTickets && breachedTickets.length > 0) {
      console.log(`[SLA Monitor] Detected ${breachedTickets.length} breached tickets.`);

      for (const ticket of breachedTickets) {
        try {
          const originalTeam = ticket.assigned_team || "General Support";
          const escalatedTeam = getEscalatedTeam(originalTeam);
          const newEscalationLevel = (ticket.escalation_level || 0) + 1;

          // (A) Update the ticket fields
          const { error: updateError } = await supabase
            .from('tickets')
            .update({
              sla_status: 'BREACHED',
              escalation_level: newEscalationLevel,
              assigned_team: escalatedTeam,
              updated_at: nowStr
            })
            .eq('id', ticket.id);

          if (updateError) throw updateError;

          // (B) Insert row into new sla_escalations table
          const { error: escLogError } = await supabase
            .from('sla_escalations')
            .insert({
              ticket_id: ticket.id,
              breached_at: nowStr,
              team: originalTeam,
              priority: ticket.priority,
              escalation_level: newEscalationLevel
            });

          if (escLogError) {
            console.error(`[SLA Monitor] Failed to write to sla_escalations for ticket ${ticket.id}:`, escLogError);
          }

          // (C) Insert row into audit_logs table
          const { error: auditError } = await supabase
            .from('audit_logs')
            .insert({
              event_type: 'sla_breached',
              ticket_id: ticket.id,
              company_id: ticket.company_id,
              actor_type: 'system',
              message: `SLA breached. Team re-routed from '${originalTeam}' to '${escalatedTeam}'.`,
              metadata: {
                priority: ticket.priority,
                assigned_team: originalTeam,
                escalated_team: escalatedTeam,
                escalation_level: newEscalationLevel
              },
              created_at: nowStr
            });

          if (auditError) {
            console.error(`[SLA Monitor] Failed to write to audit_logs for ticket ${ticket.id}:`, auditError);
          }

          // (D) Insert system message into ticket_messages (chat history)
          const systemMsg = `⚠️ SLA Breach Alert: Ticket has been escalated from '${originalTeam}' to '${escalatedTeam}' (Level ${newEscalationLevel}) for immediate action.`;
          const { error: msgError } = await supabase
            .from('ticket_messages')
            .insert({
              ticket_id: ticket.id,
              sender_id: '00000000-0000-0000-0000-000000000000',
              sender_name: 'SLA Escalation Engine',
              sender_role: 'admin',
              message: systemMsg
            });

          if (msgError) {
            console.error(`[SLA Monitor] Failed to write ticket message for ticket ${ticket.id}:`, msgError);
          }

          // (E) Resolve team lead(s) for email dispatch
          let recipientEmails: string[] = [];
          if (ticket.company_id) {
            const { data: admins } = await supabase
              .from('profiles')
              .select('email')
              .eq('company_id', ticket.company_id)
              .in('role', ['admin', 'super_admin']);

            if (admins && admins.length > 0) {
              recipientEmails = admins.map(a => a.email).filter(Boolean) as string[];
            }
          }

          if (recipientEmails.length === 0) {
            recipientEmails = ["support@helpdeskai.com"];
          }

          // (F) Invoke existing email-notifier edge function for each recipient
          const emailNotifierUrl = `${SUPABASE_URL}/functions/v1/email-notifier`;
          for (const email of recipientEmails) {
            try {
              const emailRes = await fetch(emailNotifierUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                },
                body: JSON.stringify({
                  type: 'SLA_BREACH',
                  record: {
                    ...ticket,
                    assigned_team: escalatedTeam,
                    escalation_level: newEscalationLevel
                  },
                  email: email,
                  code: null,
                  link: `https://helpdeskaiv1.vercel.app/admin/ticket/${ticket.id}`,
                  metadata: {
                    original_team: originalTeam,
                    escalated_team: escalatedTeam
                  }
                })
              });
              
              if (!emailRes.ok) {
                const errText = await emailRes.text();
                console.error(`[SLA Monitor] Email notifier failed for ${email}:`, errText);
              }
            } catch (err) {
              console.error(`[SLA Monitor] Failed calling email-notifier:`, err);
            }
          }

          // (G) Emit Supabase Realtime broadcast on 'sla-alerts' channel
          const channel = supabase.channel('sla-alerts');
          await new Promise<void>((resolveBroadcast) => {
            channel.subscribe(async (status) => {
              if (status === 'SUBSCRIBED') {
                try {
                  await channel.send({
                    type: 'broadcast',
                    event: 'breach',
                    payload: {
                      ticketId: ticket.id,
                      subject: ticket.subject,
                      priority: ticket.priority,
                      originalTeam: originalTeam,
                      escalatedTeam: escalatedTeam,
                      companyId: ticket.company_id,
                      escalationLevel: newEscalationLevel,
                      timestamp: nowStr
                    }
                  });
                } catch (sendErr) {
                  console.error(`[SLA Monitor] Failed to broadcast realtime alert:`, sendErr);
                } finally {
                  await supabase.removeChannel(channel);
                  resolveBroadcast();
                }
              } else {
                resolveBroadcast();
              }
            });
          });

          results.push({ ticketId: ticket.id, status: 'escalated', escalatedTeam });
        } catch (ticketErr: any) {
          console.error(`[SLA Monitor] Failed to process ticket ${ticket.id}:`, ticketErr);
          results.push({ ticketId: ticket.id, status: 'error', error: ticketErr.message });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (err: any) {
    console.error(`[SLA Monitor] Cron loop execution error:`, err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
