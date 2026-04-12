import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, ExternalLink, Copy, Check, Gift, Percent, WalletIcon } from "lucide-react";
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
  image_url: string | null;
  deal_type: string;
  redemption_expiry_days: number;
}

export function LewteCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("coupons").select("*").eq("is_active", true);
    setCoupons((data as Coupon[]) || []);
    
    // Check which coupons user already saved
    if (user) {
      const { data: redeemed } = await supabase
        .from("redeemed_coupons")
        .select("coupon_id")
        .eq("user_id", user.id);
      if (redeemed) {
        setSavedIds(new Set(redeemed.map((r: any) => r.coupon_id)));
      }
    }
    setLoading(false);
  }

  function copyCode(couponId: string, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(couponId);
    toast({ title: "Coupon code copied!" });
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function saveToWallet(coupon: Coupon) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (coupon.redemption_expiry_days || 30));
    
    const { error } = await supabase.from("redeemed_coupons").insert({
      user_id: user.id,
      coupon_id: coupon.id,
      expires_at: expiresAt.toISOString(),
    });
    
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already saved", description: "This coupon is already in your wallet." });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      setSavedIds(prev => new Set([...prev, coupon.id]));
      toast({ title: "Saved to Wallet!", description: "Find this coupon in your wallet when you're ready to use it." });
    }
  }

  const categories = [...new Set(coupons.map((c) => c.category).filter(Boolean))] as string[];
  const filtered = selectedCategory ? coupons.filter((c) => c.category === selectedCategory) : coupons;

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
    <div className="space-y-4">
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((coupon) => (
          <Card key={coupon.id} className="overflow-hidden">
            {coupon.image_url && (
              <div className="h-36 w-full overflow-hidden bg-muted">
                <img src={coupon.image_url} alt={coupon.title} className="h-full w-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{coupon.title}</CardTitle>
                  <CardDescription>{coupon.merchant_name}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={coupon.deal_type === "free_item"
                      ? "bg-green-500/10 text-green-700 border-green-500/20"
                      : "bg-primary/10 text-primary border-primary/20"}
                  >
                    {coupon.deal_type === "free_item" ? (
                      <><Gift className="h-3 w-3 mr-1" /> Free Item</>
                    ) : (
                      <><Percent className="h-3 w-3 mr-1" /> {coupon.discount_value || "Discount"}</>
                    )}
                  </Badge>
                </div>
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
                <Button
                  variant={savedIds.has(coupon.id) ? "secondary" : "outline"}
                  size="sm"
                  disabled={savedIds.has(coupon.id)}
                  onClick={() => saveToWallet(coupon)}
                >
                  {savedIds.has(coupon.id) ? <><Check className="h-3 w-3 mr-1" /> Saved</> : <><WalletIcon className="h-3 w-3 mr-1" /> Save to Wallet</>}
                </Button>
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
    </div>
  );
}
