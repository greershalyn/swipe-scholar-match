import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has premium access (admin check - you can make this more robust)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: hasAccess } = await adminClient.rpc("has_premium_access", { user_id: user.id });
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, table, data, id } = body;

    if (!action || !table) {
      return new Response(JSON.stringify({ error: "action and table required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const allowedTables = ["allowed_school_domains", "coupons", "surveys", "survey_questions"];
    if (!allowedTables.includes(table)) {
      return new Response(JSON.stringify({ error: "Invalid table" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;
    switch (action) {
      case "list":
        result = await adminClient.from(table).select("*").order("created_at", { ascending: false });
        break;
      case "create":
        result = await adminClient.from(table).insert(data).select();
        break;
      case "update":
        if (!id) return new Response(JSON.stringify({ error: "id required for update" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        result = await adminClient.from(table).update(data).eq("id", id).select();
        break;
      case "delete":
        if (!id) return new Response(JSON.stringify({ error: "id required for delete" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
        result = await adminClient.from(table).delete().eq("id", id);
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: result.data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
