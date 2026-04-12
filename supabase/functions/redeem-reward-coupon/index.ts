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

    const { coupon_id, shipping_address } = await req.json();
    if (!coupon_id) {
      return new Response(JSON.stringify({ error: "coupon_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the coupon
    const { data: coupon, error: couponError } = await adminClient
      .from("coupons")
      .select("*")
      .eq("id", coupon_id)
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return new Response(JSON.stringify({ error: "Coupon not found or inactive" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!coupon.reward_points_cost || coupon.reward_points_cost <= 0) {
      return new Response(JSON.stringify({ error: "This coupon cannot be redeemed with reward points" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if physical and needs shipping
    if (coupon.is_physical && !shipping_address) {
      return new Response(JSON.stringify({ error: "Shipping address is required for physical items" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This coupon has expired" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already redeemed
    const { data: existing } = await adminClient
      .from("redeemed_coupons")
      .select("id")
      .eq("user_id", user.id)
      .eq("coupon_id", coupon.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ error: "You have already redeemed this coupon" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user has enough reward points
    const { data: userPoints } = await adminClient
      .from("user_points")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const rewardPoints = userPoints?.reward_points || 0;
    if (rewardPoints < coupon.reward_points_cost) {
      return new Response(JSON.stringify({ error: `Not enough reward points. You have ${rewardPoints} but need ${coupon.reward_points_cost}.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduct reward points
    await adminClient
      .from("user_points")
      .update({ reward_points: rewardPoints - coupon.reward_points_cost })
      .eq("user_id", user.id);

    // Calculate personal expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (coupon.redemption_expiry_days || 30));

    // Add to wallet
    const insertData: any = {
      user_id: user.id,
      coupon_id: coupon.id,
      expires_at: expiresAt.toISOString(),
    };
    if (coupon.is_physical && shipping_address) {
      insertData.shipping_address = shipping_address;
    }

    const { error: insertError } = await adminClient
      .from("redeemed_coupons")
      .insert(insertData);

    if (insertError) {
      // Refund points on failure
      await adminClient
        .from("user_points")
        .update({ reward_points: rewardPoints })
        .eq("user_id", user.id);
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the transaction
    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      amount: coupon.reward_points_cost,
      transaction_type: "spent",
      description: `Redeemed: ${coupon.title}`,
      source_id: coupon.id,
    });

    return new Response(JSON.stringify({ success: true, points_spent: coupon.reward_points_cost }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
