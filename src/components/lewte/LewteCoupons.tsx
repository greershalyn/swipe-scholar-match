import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

interface Coupon {
  id: string;
  title: string;
  description: string | null;
  coupon_code: string | null;
  discount_value: string | null;
  merchant_name: string;
  merchant_url: string | null;
  category: string | null;
  expires_at: string | null;
}

export function LewteCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const { data } = await supabase.from("coupons").select("*").eq("is_active", true);
    setCoupons((data as Coupon[]) || []);
    setLoading(false);
  }

  function copyCode(couponId: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(couponId);
    toast({ title: "Coupon code copied!" });
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No coupons available yet. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {coupons.map((coupon) => (
        <Card key={coupon.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{coupon.title}</CardTitle>
                <CardDescription>{coupon.merchant_name}</CardDescription>
              </div>
              {coupon.discount_value && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {coupon.discount_value}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {coupon.description && <p className="text-sm text-muted-foreground">{coupon.description}</p>}
            {coupon.category && <Badge variant="outline" className="text-xs">{coupon.category}</Badge>}
            <div className="flex items-center gap-2">
              {coupon.coupon_code && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyCode(coupon.id, coupon.coupon_code!)}
                  className="font-mono"
                >
                  {copiedId === coupon.id ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {coupon.coupon_code}
                </Button>
              )}
              {coupon.merchant_url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={coupon.merchant_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Visit
                  </a>
                </Button>
              )}
            </div>
            {coupon.expires_at && (
              <p className="text-xs text-muted-foreground">
                Expires: {new Date(coupon.expires_at).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
