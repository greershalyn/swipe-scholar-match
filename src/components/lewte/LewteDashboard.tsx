import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Gift, TrendingUp, CalendarCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface UserPoints {
  total_points: number;
  reward_points: number;
}

export function LewteDashboard() {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch points and today's check-in status in parallel
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [pointsRes, checkinRes] = await Promise.all([
      supabase
        .from("user_points")
        .select("total_points, reward_points")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("point_transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("transaction_type", "checkin")
        .gte("created_at", todayStart.toISOString())
        .limit(1),
    ]);

    setPoints(pointsRes.data || { total_points: 0, reward_points: 0 });
    setCheckedInToday((checkinRes.data?.length ?? 0) > 0);
    setLoading(false);
  }

  async function handleCheckIn() {
    setCheckingIn(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const checkinPoints = 5;

      // Insert check-in transaction
      await supabase.from("point_transactions").insert({
        user_id: user.id,
        amount: checkinPoints,
        transaction_type: "checkin",
        description: "Daily check-in",
      });

      // Update user points
      const { data: current } = await supabase
        .from("user_points")
        .select("total_points, reward_points")
        .eq("user_id", user.id)
        .maybeSingle();

      if (current) {
        const newTotal = current.total_points + checkinPoints;
        const convertedRewards = Math.floor(newTotal / 100);
        const remainder = newTotal % 100;
        await supabase.from("user_points").update({
          total_points: remainder,
          reward_points: current.reward_points + convertedRewards,
        }).eq("user_id", user.id);
      } else {
        await supabase.from("user_points").insert({
          user_id: user.id,
          total_points: checkinPoints,
          reward_points: 0,
        });
      }

      // Trigger badge check
      supabase.functions.invoke("check-badges").catch(() => {});

      setCheckedInToday(true);
      toast.success(`Daily check-in! +${checkinPoints} points 🎉`);
      fetchData();
    } catch (err) {
      toast.error("Check-in failed. Try again.");
    } finally {
      setCheckingIn(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-32 rounded-lg" />;
  }

  const currentPoints = points?.total_points ?? 0;
  const rewardPoints = points?.reward_points ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Points Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-foreground">{currentPoints}</span>
              <span className="text-sm text-muted-foreground">/ 100 pts</span>
            </div>
            <Progress value={currentPoints} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {100 - currentPoints} more points until your next reward
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Star className="h-4 w-4" /> Reward Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-foreground">{rewardPoints}</span>
            <Badge variant="secondary" className="mb-1">
              {rewardPoints === 1 ? "1 reward" : `${rewardPoints} rewards`}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Earned from completing surveys
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Gift className="h-4 w-4" /> Redeem Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rewardPoints > 0 ? (
            <p className="text-sm text-foreground">
              You have <span className="font-bold">{rewardPoints}</span> reward point{rewardPoints !== 1 ? "s" : ""} available to redeem for free items!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete surveys to earn points and unlock free items.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <CalendarCheck className="h-4 w-4" /> Daily Check-In
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkedInToday ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">✓ Checked in today!</p>
              <p className="text-xs text-muted-foreground">Come back tomorrow for more points.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Earn 5 points daily just for showing up!</p>
              <Button size="sm" onClick={handleCheckIn} disabled={checkingIn} className="w-full">
                {checkingIn ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CalendarCheck className="h-4 w-4 mr-1" />}
                Check In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
