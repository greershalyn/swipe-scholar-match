import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, X, ArrowLeft, Wallet as WalletIcon, Tag, History, Gift, Percent, Clock, Check, AlertTriangle, Ticket, Loader2, QrCode, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SavedScholarship {
  id: string;
  scholarship: {
    id: string;
    title: string;
    amount: number;
    deadline: string;
    url: string;
    provider: string;
  };
  applied: boolean;
}

interface RedeemedCoupon {
  id: string;
  coupon_id: string;
  redeemed_at: string;
  expires_at: string;
  is_used: boolean;
  coupon: {
    id: string;
    title: string;
    description: string | null;
    coupon_code: string | null;
    discount_value: string | null;
    merchant_name: string;
    merchant_url: string | null;
    deal_type: string;
    image_url: string | null;
  };
}

interface PointTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const WalletPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: savedScholarships, isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('saved_scholarships')
        .select(`id, applied, scholarship:scholarships (id, title, amount, deadline, url, provider)`)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const now = new Date();
      return (data as SavedScholarship[]).filter(s => new Date(s.scholarship.deadline) > now);
    },
  });

  const { data: redeemedCoupons, isLoading: couponsLoading } = useQuery({
    queryKey: ['redeemed-coupons'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('redeemed_coupons')
        .select(`id, coupon_id, redeemed_at, expires_at, is_used, coupon:coupons (id, title, description, coupon_code, discount_value, merchant_name, merchant_url, deal_type, image_url)`)
        .eq('user_id', user.id)
        .order('redeemed_at', { ascending: false });
      if (error) throw error;
      return data as unknown as RedeemedCoupon[];
    },
  });

  const { data: pointTransactions, isLoading: pointsLoading } = useQuery({
    queryKey: ['point-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PointTransaction[];
    },
  });

  const handleRemoveScholarship = async (scholarshipId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('saved_scholarships').delete().eq('scholarship_id', scholarshipId).eq('profile_id', user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
      toast({ title: "Scholarship removed" });
    } catch {
      toast({ title: "Error", description: "Failed to remove scholarship.", variant: "destructive" });
    }
  };

  const handleMarkUsed = async (id: string) => {
    const { error } = await supabase.from('redeemed_coupons').update({ is_used: true }).eq('id', id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['redeemed-coupons'] });
      toast({ title: "Coupon marked as used" });
    }
  };

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { formatted: format(deadline, 'MMM d, yyyy'), daysLeft };
  };

  const activeCoupons = redeemedCoupons?.filter(c => !c.is_used && !isPast(new Date(c.expires_at))) || [];
  const expiredOrUsed = redeemedCoupons?.filter(c => c.is_used || isPast(new Date(c.expires_at))) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <WalletIcon className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">My Wallet</h1>
      </div>

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons" className="flex items-center gap-1">
            <Tag className="h-4 w-4" /> Coupons
            {activeCoupons.length > 0 && <Badge variant="secondary" className="text-xs ml-1">{activeCoupons.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="flex items-center gap-1">
            <ExternalLink className="h-4 w-4" /> Scholarships
          </TabsTrigger>
          <TabsTrigger value="points" className="flex items-center gap-1">
            <History className="h-4 w-4" /> Points History
          </TabsTrigger>
        </TabsList>

        {/* Redeemed Coupons Tab */}
        <TabsContent value="coupons" className="space-y-6">
          {couponsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {activeCoupons.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-foreground">Active Coupons</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeCoupons.map((rc) => (
                      <CouponWalletCard key={rc.id} rc={rc} onMarkUsed={handleMarkUsed} />
                    ))}
                  </div>
                </div>
              )}
              {expiredOrUsed.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">Used / Expired</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {expiredOrUsed.map((rc) => (
                      <CouponWalletCard key={rc.id} rc={rc} onMarkUsed={handleMarkUsed} disabled />
                    ))}
                  </div>
                </div>
              )}
              {(activeCoupons.length === 0 && expiredOrUsed.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No redeemed coupons yet. Save coupons from Lewte to use later!</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships">
          {scholarshipsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !savedScholarships?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved scholarships yet. Swipe right on scholarships to save them!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savedScholarships.map((saved) => {
                const deadline = formatDeadline(saved.scholarship.deadline);
                return (
                  <Card key={saved.id} className="relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 hover:bg-destructive hover:text-destructive-foreground rounded-full" onClick={() => handleRemoveScholarship(saved.scholarship.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm pr-8">{saved.scholarship.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{saved.scholarship.provider}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">${saved.scholarship.amount.toLocaleString()}</Badge>
                        <Badge variant={deadline.daysLeft <= 7 ? "destructive" : "outline"}>
                          {deadline.daysLeft} days left
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(saved.scholarship.url, '_blank')}>
                        Apply Now <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Points History Tab */}
        <TabsContent value="points" className="space-y-6">
          {/* QR Code Scanner */}
          <QRCodeScanner onScanned={() => queryClient.invalidateQueries({ queryKey: ['point-transactions'] })} />

          {/* Promo Code Redemption */}
          <PromoCodeRedeemer onRedeemed={() => queryClient.invalidateQueries({ queryKey: ['point-transactions'] })} />

          {pointsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !pointTransactions?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No point activity yet. Complete surveys or redeem promo codes to start earning!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pointTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.transaction_type === "spent" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                      {tx.transaction_type === "spent" ? "−" : "+"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description || (tx.transaction_type === "spent" ? "Points Spent" : "Points Earned")}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${tx.transaction_type === "spent" ? "text-orange-700" : "text-green-700"}`}>
                    {tx.transaction_type === "spent" ? "−" : "+"}{tx.amount} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function CouponWalletCard({ rc, onMarkUsed, disabled }: { rc: RedeemedCoupon; onMarkUsed: (id: string) => void; disabled?: boolean }) {
  const expired = isPast(new Date(rc.expires_at));
  const daysLeft = Math.ceil((new Date(rc.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`overflow-hidden ${disabled ? "opacity-60" : ""}`}>
      {rc.coupon.image_url && (
        <div className="h-24 w-full overflow-hidden bg-muted">
          <img src={rc.coupon.image_url} alt={rc.coupon.title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{rc.coupon.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{rc.coupon.merchant_name}</p>
          </div>
          <Badge className={rc.coupon.deal_type === "free_item" ? "bg-green-500/10 text-green-700 border-green-500/20" : "bg-primary/10 text-primary border-primary/20"}>
            {rc.coupon.deal_type === "free_item" ? <><Gift className="h-3 w-3 mr-1" /> Free</> : <><Percent className="h-3 w-3 mr-1" /> {rc.coupon.discount_value || "Discount"}</>}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {rc.coupon.coupon_code && (
          <code className="block text-center bg-muted px-3 py-2 rounded text-sm font-mono">{rc.coupon.coupon_code}</code>
        )}
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {expired ? (
            <span className="text-destructive">Expired {format(new Date(rc.expires_at), 'MMM d, yyyy')}</span>
          ) : rc.is_used ? (
            <span className="text-muted-foreground">Used</span>
          ) : daysLeft <= 3 ? (
            <span className="text-destructive flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</span>
          ) : (
            <span className="text-muted-foreground">Expires {format(new Date(rc.expires_at), 'MMM d, yyyy')}</span>
          )}
        </div>
        {!disabled && (
          <div className="flex gap-2">
            {rc.coupon.merchant_url && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={rc.coupon.merchant_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" /> Use Now
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onMarkUsed(rc.id)}>
              <Check className="h-3 w-3 mr-1" /> Mark Used
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PromoCodeRedeemer({ onRedeemed }: { onRedeemed: () => void }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleRedeem() {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("redeem-promo-code", {
        body: { code: trimmed },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      toast({ title: "Code Redeemed!", description: `You earned ${data.points_awarded} points!` });
      setCode("");
      onRedeemed();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Ticket className="h-4 w-4" /> Redeem Promo Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono uppercase"
            onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
          />
          <Button onClick={handleRedeem} disabled={loading || !code.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redeem"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export RedeemedCoupon type for use elsewhere
export type { RedeemedCoupon };

export default WalletPage;
