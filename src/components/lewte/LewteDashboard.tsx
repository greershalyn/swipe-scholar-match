import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, TrendingUp, CalendarCheck, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface UserPoints {
  total_points: number;
  reward_points: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
}

export function LewteDashboard() {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  useEffect(() => {
    initDashboard();
  }, []);

  async function initDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [pointsRes, checkinRes] = await Promise.all([
      supabase.from("user_points").select("total_points, reward_points, current_streak, longest_streak, last_checkin_date").eq("user_id", user.id).maybeSingle(),
      supabase.from("point_transactions").select("id").eq("user_id", user.id).eq("transaction_type", "checkin").gte("created_at", todayStart.toISOString()).limit(1),
    ]);

    const defaults: UserPoints = { total_points: 0, reward_points: 0, current_streak: 0, longest_streak: 0, last_checkin_date: null };
    const current = pointsRes.data ? { ...defaults, ...pointsRes.data } : defaults;
    setPoints(current);

    const alreadyCheckedIn = (checkinRes.data?.length ?? 0) > 0;
    setCheckedInToday(alreadyCheckedIn);
    setLoading(false);

    if (!alreadyCheckedIn) {
      await performCheckIn(user.id, current);
    }
  }

  async function performCheckIn(userId: string, current: UserPoints) {
    try {
      const checkinPoints = 5;
      const today = new Date().toISOString().split("T")[0];

      // Calculate streak
      let newStreak = 1;
      if (current.last_checkin_date) {
        const lastDate = new Date(current.last_checkin_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        if (current.last_checkin_date === yesterdayStr) {
          newStreak = current.current_streak + 1;
        }
      }
      const newLongest = Math.max(current.longest_streak, newStreak);

      await supabase.from("point_transactions").insert({
        user_id: userId,
        amount: checkinPoints,
        transaction_type: "checkin",
        description: `Daily check-in (streak: ${newStreak})`,
      });

      const newTotal = current.total_points + checkinPoints;
      const convertedRewards = Math.floor(newTotal / 100);
      const remainder = newTotal % 100;
      const updatedPoints = {
        total_points: remainder,
        reward_points: current.reward_points + convertedRewards,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_checkin_date: today,
      };

      if (current.last_checkin_date !== null || current.total_points > 0) {
        await supabase.from("user_points").update(updatedPoints).eq("user_id", userId);
      } else {
        await supabase.from("user_points").insert({ user_id: userId, ...updatedPoints });
      }

      setPoints({ ...updatedPoints });
      setCheckedInToday(true);

      const streakMsg = newStreak > 1 ? ` 🔥 ${newStreak}-day streak!` : "";
      toast.success(`Daily check-in! +${checkinPoints} points${streakMsg}`);
      supabase.functions.invoke("check-badges").catch(() => {});
    } catch {
      // Silent fail
    }
  }

  if (loading) {
    return <Skeleton className="h-32 rounded-lg" />;
  }

  const currentPoints = points?.total_points ?? 0;
  const rewardPoints = points?.reward_points ?? 0;
  const streak = points?.current_streak ?? 0;
  const longestStreak = points?.longest_streak ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
              You have <span className="font-bold">{rewardPoints}</span> reward point{rewardPoints !== 1 ? "s" : ""} available!
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
            <p className="text-xs text-muted-foreground">Checking in...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Flame className="h-4 w-4" /> Check-In Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-foreground">{streak}</span>
            <span className="text-sm text-muted-foreground mb-0.5">day{streak !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Best: {longestStreak} day{longestStreak !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
