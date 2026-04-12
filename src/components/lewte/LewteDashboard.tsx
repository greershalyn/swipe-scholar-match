import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface UserPoints {
  total_points: number;
  reward_points: number;
}

export function LewteDashboard() {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  async function fetchPoints() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_points")
      .select("total_points, reward_points")
      .eq("user_id", user.id)
      .maybeSingle();

    setPoints(data || { total_points: 0, reward_points: 0 });
    setLoading(false);
  }

  if (loading) {
    return <Skeleton className="h-32 rounded-lg" />;
  }

  const currentPoints = points?.total_points ?? 0;
  const rewardPoints = points?.reward_points ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Survey Progress
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
    </div>
  );
}
