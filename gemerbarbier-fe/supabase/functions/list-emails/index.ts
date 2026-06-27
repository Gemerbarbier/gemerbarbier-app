import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const template = url.searchParams.get("template");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);

    let query = supabase
      .from("email_queue")
      .select("id, template_name, recipient_email, status, attempts, last_error, sent_at, created_at, scheduled_at, payload")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status && status !== "all") query = query.eq("status", status);
    if (template && template !== "all") query = query.eq("template_name", template);

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate counts
    const { data: allRows } = await supabase
      .from("email_queue")
      .select("status, template_name");

    const counts = { total: 0, sent: 0, pending: 0, failed: 0 };
    const templates = new Set<string>();
    (allRows || []).forEach((r: { status: string; template_name: string }) => {
      counts.total++;
      if (r.status === "sent") counts.sent++;
      else if (r.status === "pending") counts.pending++;
      else if (r.status === "failed") counts.failed++;
      templates.add(r.template_name);
    });

    return new Response(
      JSON.stringify({ emails: data, counts, templates: Array.from(templates) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
