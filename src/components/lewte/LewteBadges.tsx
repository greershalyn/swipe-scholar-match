import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Target, Gift, Calendar, CheckCircle, ShoppingBag, Flame, Medal, Heart, Zap, Crown, Gem, Sparkles, Shield, GraduationCap, BookOpen, type LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, LucideIcon> = {
  trophy: Trophy,
  star: Star,
  award: Award,
  medal: Medal,
  crown: Crown,
  gem: Gem,
  heart: Heart,
  zap: Zap,
  flame: Flame,
  sparkles: Sparkles,
  target: Target,
  gift: Gift,
  calendar: Calendar,
  "check-circle": CheckCircle,
  "shopping-bag": ShoppingBag,
  shield: Shield,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
};

export function LewteBadges() {
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  async function loadBadges() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for new badges
    const { data: checkResult } = await supabase.functions.invoke("check-badges");
    if (checkResult?.awarded?.length > 0) {
      for (const b of checkResult.awarded) {
        toast({ title: "🏆 Badge Earned!", description: `${b.name} — +${b.points} points!` });
      }
    }

    // Load all active badges and user's earned badges
    const [{ data: badges }, { data: earned }] = await Promise.all([
      supabase.from("badges").select("*").eq("is_active", true).order("created_at"),
      supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", user.id),
    ]);

    setAllBadges(badges || []);
    setEarnedBadgeIds(new Set((earned || []).map((e: any) => e.badge_id)));
    setLoading(false);
  }

  if (loading) return <Skeleton className="h-32 rounded-lg" />;
  if (allBadges.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <Award className="h-4 w-4" /> Badges & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id);
            const Icon = TRIGGER_ICONS[badge.trigger_type] || Trophy;
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-all ${
                  isEarned
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/30 border-muted opacity-50 grayscale"
                }`}
              >
                <div className={`rounded-full p-2 ${isEarned ? "bg-primary/10" : "bg-muted"}`}>
                  <Icon className={`h-5 w-5 ${isEarned ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className="text-xs font-medium leading-tight">{badge.name}</span>
                {isEarned ? (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Earned</Badge>
                ) : (
                  <span className="text-[10px] text-muted-foreground">{badge.points_value} pts</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
