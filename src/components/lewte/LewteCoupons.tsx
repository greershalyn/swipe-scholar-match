import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag, ExternalLink, Copy, Check, Gift, Percent, Wallet as WalletIcon, Star, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  reward_points_cost: number | null;
  is_physical: boolean;
}

export function LewteCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [rewardPoints, setRewardPoints] = useState(0);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  // Shipping dialog state
  const [shippingCoupon, setShippingCoupon] = useState<Coupon | null>(null);
  const [shippingAddress, setShippingAddress] = useState({ name: "", street: "", city: "", state: "", zip: "" });
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("coupons").select("*").eq("is_active", true);
    setCoupons((data as Coupon[]) || []);
    
    if (user) {
      const { data: redeemed } = await supabase
        .from("redeemed_coupons")
        .select("coupon_id")
        .eq("user_id", user.id);
      if (redeemed) {
        setSavedIds(new Set(redeemed.map((r: any) => r.coupon_id)));
      }
      // Fetch reward points
      const { data: pts } = await supabase
        .from("user_points")
        .select("reward_points")
        .eq("user_id", user.id)
        .single();
      setRewardPoints(pts?.reward_points || 0);
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

  async function redeemWithPoints(coupon: Coupon, address?: string) {
    setRedeemingId(coupon.id);
    try {
      const body: any = { coupon_id: coupon.id };
      if (address) body.shipping_address = address;

      const { data, error } = await supabase.functions.invoke("redeem-reward-coupon", { body });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      
      setSavedIds(prev => new Set([...prev, coupon.id]));
      setRewardPoints(prev => prev - (coupon.reward_points_cost || 0));
      toast({ title: "Redeemed!", description: `Spent ${coupon.reward_points_cost} reward points. Check your wallet!` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setRedeemingId(null);
    }
  }

  function handleRedeemClick(coupon: Coupon) {
    if (coupon.is_physical) {
      setShippingCoupon(coupon);
      setShippingAddress({ name: "", street: "", city: "", state: "", zip: "" });
    } else {
      redeemWithPoints(coupon);
    }
  }

  async function handleShippingSubmit() {
    if (!shippingCoupon) return;
    const { name, street, city, state, zip } = shippingAddress;
    if (!name || !street || !city || !state || !zip) {
      toast({ title: "Missing info", description: "Please fill in all address fields.", variant: "destructive" });
      return;
    }
    setShippingLoading(true);
    const fullAddress = `${name}\n${street}\n${city}, ${state} ${zip}`;
    await redeemWithPoints(shippingCoupon, fullAddress);
    setShippingLoading(false);
    setShippingCoupon(null);
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
        {filtered.map((coupon) => {
          const isRewardRedeemable = coupon.deal_type === "free_item" && coupon.reward_points_cost && coupon.reward_points_cost > 0;
          const canAfford = rewardPoints >= (coupon.reward_points_cost || 0);
          const alreadySaved = savedIds.has(coupon.id);

          return (
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
                    {isRewardRedeemable && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" /> {coupon.reward_points_cost} reward pts
                      </Badge>
                    )}
                    {coupon.is_physical && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="h-3 w-3 mr-1" /> Ships to you
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {coupon.description && <p className="text-sm text-muted-foreground">{coupon.description}</p>}
                {coupon.category && <Badge variant="outline" className="text-xs">{coupon.category}</Badge>}
                <div className="flex items-center gap-2 flex-wrap">
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
                  {/* Reward point redemption button */}
                  {isRewardRedeemable && !alreadySaved && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={!canAfford || redeemingId === coupon.id}
                      onClick={() => handleRedeemClick(coupon)}
                      title={!canAfford ? `You need ${coupon.reward_points_cost} reward points (you have ${rewardPoints})` : ""}
                    >
                      {redeemingId === coupon.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Star className="h-3 w-3 mr-1" />
                      )}
                      {canAfford ? `Redeem (${coupon.reward_points_cost} pts)` : `Need ${coupon.reward_points_cost} pts`}
                    </Button>
                  )}
                  {/* Regular save to wallet (for non-reward coupons) */}
                  {!isRewardRedeemable && (
                    <Button
                      variant={alreadySaved ? "secondary" : "outline"}
                      size="sm"
                      disabled={alreadySaved}
                      onClick={() => saveToWallet(coupon)}
                    >
                      {alreadySaved ? <><Check className="h-3 w-3 mr-1" /> Saved</> : <><WalletIcon className="h-3 w-3 mr-1" /> Save to Wallet</>}
                    </Button>
                  )}
                  {isRewardRedeemable && alreadySaved && (
                    <Badge variant="secondary" className="text-xs"><Check className="h-3 w-3 mr-1" /> Redeemed</Badge>
                  )}
                </div>
                {coupon.expires_at && (
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Shipping Address Dialog */}
      <Dialog open={!!shippingCoupon} onOpenChange={(open) => !open && setShippingCoupon(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Shipping Address
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This is a physical item. Please provide your shipping address so we can send it to you.
          </p>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input placeholder="John Doe" value={shippingAddress.name} onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Street Address</Label>
              <Input placeholder="123 Main St, Apt 4" value={shippingAddress.street} onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">City</Label>
                <Input placeholder="City" value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">State</Label>
                <Input placeholder="TX" value={shippingAddress.state} onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ZIP Code</Label>
                <Input placeholder="75001" value={shippingAddress.zip} onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })} />
              </div>
            </div>
            {shippingCoupon && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                <span>{shippingCoupon.title}</span>
                <Badge><Star className="h-3 w-3 mr-1" /> {shippingCoupon.reward_points_cost} pts</Badge>
              </div>
            )}
            <Button onClick={handleShippingSubmit} className="w-full" disabled={shippingLoading}>
              {shippingLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Star className="h-4 w-4 mr-1" />}
              Confirm & Redeem
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
