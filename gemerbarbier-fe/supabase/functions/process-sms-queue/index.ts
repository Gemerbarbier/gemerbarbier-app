import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RETRY_DELAYS_MIN = [1, 5, 15];
const BATCH_SIZE = 20;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/gatewayapi";
const SENDER = "Gemerbarber"; // max 11 alphanumeric chars

interface SmsQueueRow {
  id: string;
  recipient_phone: string;
  message: string;
  attempts: number;
  max_attempts: number;
}

function normalizeMsisdn(raw: string): number | null {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = "421" + digits.slice(1);
  const n = Number(digits);
  if (!Number.isFinite(n) || digits.length < 8) return null;
  return n;
}

async function sendSms(
  lovableKey: string,
  connectionKey: string,
  msisdn: number,
  message: string,
  reference: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const res = await fetch(`${GATEWAY_URL}/mobile/single`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": connectionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: SENDER,
      recipient: msisdn,
      message,
      reference,
    }),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}: ${text}` };
  try {
    const data = JSON.parse(text);
    return { ok: true, id: String(data?.message_id ?? data?.id ?? reference) };
  } catch {
    return { ok: true, id: reference };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GATEWAYAPI_API_KEY = Deno.env.get("GATEWAYAPI_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!GATEWAYAPI_API_KEY) throw new Error("GATEWAYAPI_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: rows, error: fetchErr } = await supabase
      .from("sms_queue")
      .select("id, recipient_phone, message, attempts, max_attempts")
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

    let sent = 0, failed = 0, retried = 0;

    for (const row of rows as SmsQueueRow[]) {
      const nextAttempt = row.attempts + 1;
      try {
        const msisdn = normalizeMsisdn(row.recipient_phone);
        if (!msisdn) throw new Error(`Invalid phone: ${row.recipient_phone}`);

        const result = await sendSms(
          LOVABLE_API_KEY,
          GATEWAYAPI_API_KEY,
          msisdn,
          row.message,
          row.id,
        );

        if (result.ok) {
          await supabase.from("sms_queue").update({
            status: "sent",
            sent_at: new Date().toISOString(),
            attempts: nextAttempt,
            provider_message_id: result.id,
          }).eq("id", row.id);
          sent++;
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        const isFinal = nextAttempt >= row.max_attempts;
        if (isFinal) {
          await supabase.from("sms_queue").update({
            status: "failed", attempts: nextAttempt, last_error: errMsg,
          }).eq("id", row.id);
          failed++;
        } else {
          const delayMin = RETRY_DELAYS_MIN[Math.min(nextAttempt - 1, RETRY_DELAYS_MIN.length - 1)];
          const nextScheduled = new Date(Date.now() + delayMin * 60_000).toISOString();
          await supabase.from("sms_queue").update({
            attempts: nextAttempt, last_error: errMsg, scheduled_at: nextScheduled,
          }).eq("id", row.id);
          retried++;
        }
      }
    }

    console.log(`SMS processed: ${rows.length} | sent: ${sent} | retried: ${retried} | failed: ${failed}`);
    return new Response(
      JSON.stringify({ processed: rows.length, sent, retried, failed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("Error in process-sms-queue:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
