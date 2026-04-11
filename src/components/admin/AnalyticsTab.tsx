import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Eye, MousePointerClick, ShoppingBag, Loader2, TrendingUp } from "lucide-react";
import { useAdminManage } from "@/hooks/useAdminManage";

export default function AnalyticsTab() {
  const { list, isLoading } = useAdminManage();
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [analyticsData, couponsData] = await Promise.all([
      list("coupon_analytics"),
      list("coupons"),
    ]);
    setAnalytics(analyticsData || []);
    setCoupons(couponsData || []);
  }

  const filteredAnalytics = useMemo(() => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return analytics.filter((a) => new Date(a.created_at) >= cutoff);
  }, [analytics, timeRange]);

  const stats = useMemo(() => {
    const views = filteredAnalytics.filter((a) => a.event_type === "view").length;
    const clicks = filteredAnalytics.filter((a) => a.event_type === "click").length;
    const redemptions = filteredAnalytics.filter((a) => a.event_type === "redemption").length;
    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0";
    return { views, clicks, redemptions, ctr };
  }, [filteredAnalytics]);

  const couponStats = useMemo(() => {
    const map = new Map<string, { views: number; clicks: number; redemptions: number; title: string }>();
    coupons.forEach((c) => map.set(c.id, { views: 0, clicks: 0, redemptions: 0, title: c.title }));
    filteredAnalytics.forEach((a) => {
      const entry = map.get(a.coupon_id);
      if (entry) {
        if (a.event_type === "view") entry.views++;
        if (a.event_type === "click") entry.clicks++;
        if (a.event_type === "redemption") entry.redemptions++;
      }
    });
    return Array.from(map.entries())
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => b.views + b.clicks + b.redemptions - (a.views + a.clicks + a.redemptions));
  }, [filteredAnalytics, coupons]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Coupon Analytics
        </h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="Views" value={stats.views} color="text-blue-500" />
        <StatCard icon={MousePointerClick} label="Clicks" value={stats.clicks} color="text-green-500" />
        <StatCard icon={ShoppingBag} label="Redemptions" value={stats.redemptions} color="text-purple-500" />
        <StatCard icon={TrendingUp} label="CTR" value={`${stats.ctr}%`} color="text-amber-500" />
      </div>

      {/* Per-Coupon Breakdown */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Per-Coupon Performance</CardTitle>
          <CardDescription className="text-xs">Breakdown by individual coupon</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : couponStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No analytics data yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coupon</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Redemptions</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couponStats.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell className="text-right">{c.views}</TableCell>
                    <TableCell className="text-right">{c.clicks}</TableCell>
                    <TableCell className="text-right">{c.redemptions}</TableCell>
                    <TableCell className="text-right">
                      {c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(1) : "0"}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
