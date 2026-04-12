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

    // Check verified student
    const { data: verified } = await adminClient
      .from("student_email_verifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("verified", true)
      .limit(1);

    if (!verified || verified.length === 0) {
      // Allow super admins to bypass
      const { data: adminRole } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .limit(1);
      if (!adminRole || adminRole.length === 0) {
        return new Response(JSON.stringify({ error: "You must be a verified student to scan QR codes" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { code } = await req.json();
    if (!code) {
      return new Response(JSON.stringify({ error: "Code is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up QR code
    const { data: qrCode, error: qrError } = await adminClient
      .from("qr_codes")
      .select("*")
      .eq("code", code.trim())
      .eq("is_active", true)
      .single();

    if (qrError || !qrCode) {
      return new Response(JSON.stringify({ error: "Invalid or inactive QR code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "This QR code has expired" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check global cap
    if (qrCode.max_total_redemptions !== null && qrCode.current_redemptions >= qrCode.max_total_redemptions) {
      return new Response(JSON.stringify({ error: "This QR code has reached its maximum redemptions" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check per-user frequency
    const limitType = qrCode.redemption_limit_type;
    const { data: userRedemptions } = await adminClient
      .from("qr_code_redemptions")
      .select("id, created_at")
      .eq("qr_code_id", qrCode.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const redemptionCount = userRedemptions?.length ?? 0;

    if (limitType === "once") {
      if (redemptionCount > 0) {
        return new Response(JSON.stringify({ error: "You have already scanned this QR code" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (limitType === "daily") {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recent = userRedemptions?.find((r: any) => new Date(r.created_at) > oneDayAgo);
      if (recent) {
        return new Response(JSON.stringify({ error: "You can only scan this QR code once per day" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (limitType === "weekly") {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recent = userRedemptions?.find((r: any) => new Date(r.created_at) > oneWeekAgo);
      if (recent) {
        return new Response(JSON.stringify({ error: "You can only scan this QR code once per week" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (limitType === "monthly") {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recent = userRedemptions?.find((r: any) => new Date(r.created_at) > oneMonthAgo);
      if (recent) {
        return new Response(JSON.stringify({ error: "You can only scan this QR code once per month" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (limitType === "lifetime_limit") {
      if (redemptionCount >= qrCode.redemption_limit_count) {
        return new Response(JSON.stringify({ error: `You have reached the maximum of ${qrCode.redemption_limit_count} scans for this QR code` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // "unlimited" — no check needed

    // Record the redemption
    const { error: insertError } = await adminClient
      .from("qr_code_redemptions")
      .insert({ user_id: user.id, qr_code_id: qrCode.id, points_awarded: qrCode.points_value });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Increment redemption count
    await adminClient
      .from("qr_codes")
      .update({ current_redemptions: qrCode.current_redemptions + 1 })
      .eq("id", qrCode.id);

    // Award points
    const { data: userPoints } = await adminClient
      .from("user_points")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (userPoints) {
      const newTotal = userPoints.total_points + qrCode.points_value;
      const convertedRewards = Math.floor(newTotal / 100);
      const remainder = newTotal % 100;
      await adminClient
        .from("user_points")
        .update({
          total_points: remainder,
          reward_points: userPoints.reward_points + convertedRewards,
        })
        .eq("user_id", user.id);
    } else {
      const convertedRewards = Math.floor(qrCode.points_value / 100);
      const remainder = qrCode.points_value % 100;
      await adminClient
        .from("user_points")
        .insert({ user_id: user.id, total_points: remainder, reward_points: convertedRewards });
    }

    // Log transaction
    await adminClient.from("point_transactions").insert({
      user_id: user.id,
      amount: qrCode.points_value,
      transaction_type: "earned",
      description: `QR code: ${qrCode.name}`,
      source_id: qrCode.id,
    });

    // Send points notification
    await adminClient.from("notifications").insert({
      user_id: user.id,
      title: "Points Earned! 🎉",
      message: `You earned ${qrCode.points_value} points from scanning "${qrCode.name}"!`,
      type: "points",
      reference_id: qrCode.id,
    });

    // Badge check
    let badgeAwarded = null;
    if (qrCode.badge_id && qrCode.badge_scan_threshold) {
      const newRedemptionCount = redemptionCount + 1;
      if (newRedemptionCount === qrCode.badge_scan_threshold) {
        // Check if badge not already earned
        const { data: existingBadge } = await adminClient
          .from("user_badges")
          .select("id")
          .eq("user_id", user.id)
          .eq("badge_id", qrCode.badge_id)
          .limit(1);

        if (!existingBadge || existingBadge.length === 0) {
          // Get badge details
          const { data: badge } = await adminClient
            .from("badges")
            .select("*")
            .eq("id", qrCode.badge_id)
            .single();

          if (badge) {
            // Award badge
            await adminClient.from("user_badges").insert({
              user_id: user.id,
              badge_id: badge.id,
              points_awarded: badge.points_value,
            });

            // Award badge points
            if (badge.points_value > 0) {
              const { data: currentPoints } = await adminClient
                .from("user_points")
                .select("total_points, reward_points")
                .eq("user_id", user.id)
                .maybeSingle();

              if (currentPoints) {
                const newTotal = currentPoints.total_points + badge.points_value;
                const convertedRewards = Math.floor(newTotal / 100);
                const remainder = newTotal % 100;
                await adminClient.from("user_points").update({
                  total_points: remainder,
                  reward_points: currentPoints.reward_points + convertedRewards,
                }).eq("user_id", user.id);
              }

              await adminClient.from("point_transactions").insert({
                user_id: user.id,
                amount: badge.points_value,
                transaction_type: "earned",
                description: `Badge earned: ${badge.name}`,
                source_id: badge.id,
              });
            }

            // Send badge notification
            await adminClient.from("notifications").insert({
              user_id: user.id,
              title: "Badge Earned! 🏆",
              message: `You earned the "${badge.name}" badge and ${badge.points_value} points!`,
              type: "badge",
              reference_id: badge.id,
            });

            badgeAwarded = { name: badge.name, points: badge.points_value };
          }
        }
      }
    }

    return new Response(JSON.stringify({
      points_awarded: qrCode.points_value,
      badge_awarded: badgeAwarded,
      qr_name: qrCode.name,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
