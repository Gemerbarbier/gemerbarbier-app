import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { renderTemplate, type TemplateName, type ReservationPayload } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Retry strategy: 3 attempts with backoff (1m → 5m → 15m)
const RETRY_DELAYS_MIN = [1, 5, 15];
const BATCH_SIZE = 20;
const FROM_ADDRESS = "Gemer Barbier <rezervacie@gemerbarbier.sk>"; // ⚠️ Replace with your verified Resend domain address

interface EmailQueueRow {
  id: string;
  template_name: TemplateName;
  recipient_email: string;
  payload: ReservationPayload;
  attempts: number;
  max_attempts: number;
}

async function sendViaResend(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data?.message || `HTTP ${res.status}` };
  return { ok: true, id: data.id };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key:", RESEND_API_KEY);
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Pull pending, due rows
    const { data: rows, error: fetchErr } = await supabase
      .from("email_queue")
      .select("id, template_name, recipient_email, payload, attempts, max_attempts")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchErr) throw new Error(`Fetch failed: ${fetchErr.message}`);
    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let sent = 0;
    let failed = 0;
    let retried = 0;

    for (const row of rows as EmailQueueRow[]) {
      const nextAttempt = row.attempts + 1;
      try {
        const { subject, html } = renderTemplate(row.template_name, row.payload);
        const result = await sendViaResend(RESEND_API_KEY, row.recipient_email, subject, html);

        if (result.ok) {
          await supabase
            .from("email_queue")
            .update({ status: "sent", sent_at: new Date().toISOString(), attempts: nextAttempt })
            .eq("id", row.id);
          sent++;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const isFinalAttempt = nextAttempt >= row.max_attempts;

        if (isFinalAttempt) {
          await supabase
            .from("email_queue")
            .update({ status: "failed", attempts: nextAttempt, last_error: errMsg })
            .eq("id", row.id);
          failed++;
        } else {
          // Backoff: pick delay for the *next* attempt index
          const delayMin = RETRY_DELAYS_MIN[Math.min(nextAttempt - 1, RETRY_DELAYS_MIN.length - 1)];
          const nextScheduled = new Date(Date.now() + delayMin * 60_000).toISOString();
          await supabase
            .from("email_queue")
            .update({
              attempts: nextAttempt,
              last_error: errMsg,
              scheduled_at: nextScheduled,
            })
            .eq("id", row.id);
          retried++;
        }
      }
    }

    console.log(`Processed: ${rows.length} | sent: ${sent} | retried: ${retried} | failed: ${failed}`);
    return new Response(
      JSON.stringify({ processed: rows.length, sent, retried, failed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error: unknown) {
    console.error("Error in process-email-queue:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
