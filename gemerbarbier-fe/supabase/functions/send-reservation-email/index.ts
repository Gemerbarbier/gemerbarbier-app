import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import type { ReservationPayload } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const payload = (await req.json()) as ReservationPayload;

    // Basic validation
    const required = ["customerName", "customerEmail", "date", "time", "serviceName", "barberName"];
    for (const f of required) {
      if (!(payload as Record<string, unknown>)[f]) {
        throw new Error(`Missing required field: ${f}`);
      }
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Enqueue confirmation email (sent ASAP)
    const { error: confirmErr } = await supabase.from("email_queue").insert({
      template_name: "reservation_confirmation",
      recipient_email: payload.customerEmail,
      payload,
      scheduled_at: new Date().toISOString(),
    });
    if (confirmErr) throw new Error(`Queue insert failed: ${confirmErr.message}`);

    // Enqueue reminder for 24h before reservation (only if more than 24h away)
    const reservationTime = new Date(`${payload.date.split("T")[0]}T${payload.time}:00`);
    const reminderAt = new Date(reservationTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminderAt.getTime() > Date.now() + 60_000) {
      const { error: remErr } = await supabase.from("email_queue").insert({
        template_name: "reservation_reminder",
        recipient_email: payload.customerEmail,
        payload,
        scheduled_at: reminderAt.toISOString(),
      });
      if (remErr) console.warn("Reminder queue insert failed:", remErr.message);
    }

    return new Response(JSON.stringify({ success: true, queued: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-reservation-email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
