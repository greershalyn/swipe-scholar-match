import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Authenticate user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check verified student
    const { data: verified } = await adminClient
      .from("student_email_verifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("verified", true)
      .limit(1);

    if (!verified || verified.length === 0) {
      return new Response(JSON.stringify({ error: "You must be a verified student to redeem codes" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: "Code is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the promo code
    const { data: promo, error: promoError } = await adminClient
      .from("promo_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .eq("is_active", true)
      .single();

    if (promoError || !promo) {
      return new Response(JSON.stringify({ error: "Invalid or inactive promo code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This promo code has expired" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max redemptions
    if (promo.max_redemptions !== null && promo.current_redemptions >= promo.max_redemptions) {
      return new Response(JSON.stringify({ error: "This promo code has reached its redemption limit" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already redeemed
    const { data: existing } = await adminClient
      .from("promo_code_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("promo_code_id", promo.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: "You have already redeemed this code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record the redemption
    const { error: insertError } = await adminClient
      .from("promo_code_redemptions")
      .insert({ user_id: user.id, promo_code_id: promo.id, points_awarded: promo.points_value });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment redemption count
    await adminClient
      .from("promo_codes")
      .update({ current_redemptions: promo.current_redemptions + 1 })
      .eq("id", promo.id);

    // Award points - add to user_points
    const { data: userPoints } = await adminClient
      .from("user_points")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (userPoints) {
      await adminClient
        .from("user_points")
        .update({ total_points: userPoints.total_points + promo.points_value })
        .eq("user_id", user.id);
    } else {
      await adminClient
        .from("user_points")
        .insert({ user_id: user.id, total_points: promo.points_value, reward_points: 0 });
    }

    // Log the transaction
    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      amount: promo.points_value,
      transaction_type: "earned",
      description: `Promo code: ${promo.code}`,
      source_id: promo.id,
    });

    return new Response(JSON.stringify({ points_awarded: promo.points_value }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
