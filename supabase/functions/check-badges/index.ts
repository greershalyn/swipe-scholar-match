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
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceKey);
    const userId = user.id;

    // Get all active badges
    const { data: badges } = await adminClient.from("badges").select("*").eq("is_active", true);
    if (!badges || badges.length === 0) {
      return new Response(JSON.stringify({ awarded: [] }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get already earned badges
    const { data: earned } = await adminClient.from("user_badges").select("badge_id").eq("user_id", userId);
    const earnedIds = new Set((earned || []).map((e: any) => e.badge_id));

    // Gather user stats
    const [
      { count: surveyCount },
      { data: pointsData },
      { count: scholarshipCount },
      { count: couponCount },
      { count: rewardCount },
      { data: profileData },
      { count: checkinCount },
    ] = await Promise.all([
      adminClient.from("survey_responses").select("*", { count: "exact", head: true }).eq("user_id", userId),
      adminClient.from("user_points").select("total_points, reward_points").eq("user_id", userId).maybeSingle(),
      adminClient.from("saved_scholarships").select("*", { count: "exact", head: true }).eq("profile_id", userId),
      adminClient.from("redeemed_coupons").select("*", { count: "exact", head: true }).eq("user_id", userId),
      adminClient.from("point_transactions").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("transaction_type", "spent"),
      adminClient.from("profiles").select("birth_date").eq("id", userId).maybeSingle(),
      // daily_checkin: count distinct days of point_transactions
      adminClient.from("point_transactions").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("transaction_type", "checkin"),
    ]);

    const totalPoints = pointsData?.total_points ?? 0;

    // Check birthday
    const isBirthday = (() => {
      if (!profileData?.birth_date) return false;
      const bd = new Date(profileData.birth_date);
      const now = new Date();
      return bd.getMonth() === now.getMonth() && bd.getDate() === now.getDate();
    })();

    const statsMap: Record<string, number | boolean> = {
      survey_completion: surveyCount ?? 0,
      points_milestone: totalPoints,
      scholarship_actions: scholarshipCount ?? 0,
      birthday: isBirthday,
      coupons_redeemed: couponCount ?? 0,
      rewards_redeemed: rewardCount ?? 0,
      daily_checkin: checkinCount ?? 0,
    };

    const awarded: any[] = [];

    for (const badge of badges) {
      if (earnedIds.has(badge.id)) continue;

      const stat = statsMap[badge.trigger_type];
      let qualifies = false;

      if (badge.trigger_type === "birthday") {
        qualifies = stat === true;
      } else if (typeof stat === "number") {
        qualifies = stat >= badge.trigger_threshold;
      }

      if (qualifies) {
        // Award badge
        await adminClient.from("user_badges").insert({
          user_id: userId,
          badge_id: badge.id,
          points_awarded: badge.points_value,
        });

        // Award points
        if (badge.points_value > 0) {
          const { data: currentPoints } = await adminClient
            .from("user_points")
            .select("total_points, reward_points")
            .eq("user_id", userId)
            .maybeSingle();

          if (currentPoints) {
            const newTotal = currentPoints.total_points + badge.points_value;
            const convertedRewards = Math.floor(newTotal / 100);
            const remainder = newTotal % 100;
            await adminClient.from("user_points").update({
              total_points: remainder,
              reward_points: currentPoints.reward_points + convertedRewards,
            }).eq("user_id", userId);
          } else {
            const convertedRewards = Math.floor(badge.points_value / 100);
            const remainder = badge.points_value % 100;
            await adminClient.from("user_points").insert({
              user_id: userId,
              total_points: remainder,
              reward_points: convertedRewards,
            });
          }

          await adminClient.from("point_transactions").insert({
            user_id: userId,
            amount: badge.points_value,
            transaction_type: "earned",
            description: `Badge earned: ${badge.name}`,
            source_id: badge.id,
          });
        }

        // Send notification
        await adminClient.from("notifications").insert({
          user_id: userId,
          title: "Badge Earned! 🏆",
          message: `You earned the "${badge.name}" badge and ${badge.points_value} points!`,
          type: "badge",
          reference_id: badge.id,
        });

        awarded.push({ badge_id: badge.id, name: badge.name, points: badge.points_value });
      }
    }

    return new Response(JSON.stringify({ awarded }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
