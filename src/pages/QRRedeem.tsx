import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, Award, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function QRRedeem() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "auth_required">("loading");
  const [result, setResult] = useState<{ points_awarded: number; badge_awarded: { name: string; points: number } | null; qr_name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    redeem();
  }, [code]);

  async function redeem() {
    if (!code) {
      setErrorMsg("No QR code provided");
      setStatus("error");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus("auth_required");
      return;
    }

    const { data, error } = await supabase.functions.invoke("redeem-qr-code", {
      body: { code },
    });

    if (error || data?.error) {
      setErrorMsg(data?.error || error?.message || "Something went wrong");
      setStatus("error");
      return;
    }

    setResult(data);
    setStatus("success");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Redeeming QR code...</p>
            </>
          )}

          {status === "auth_required" && (
            <>
              <LogIn className="h-12 w-12 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Sign In Required</h2>
              <p className="text-muted-foreground text-sm">You need to be signed in to scan QR codes.</p>
              <Button onClick={() => navigate(`/auth?redirect=/qr/${code}`)} className="w-full">
                Sign In
              </Button>
            </>
          )}

          {status === "success" && result && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-semibold">Points Earned!</h2>
              <p className="text-3xl font-bold text-primary">+{result.points_awarded} pts</p>
              <p className="text-sm text-muted-foreground">From: {result.qr_name}</p>
              {result.badge_awarded && (
                <div className="border rounded-lg p-3 bg-muted/30 space-y-1">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto" />
                  <p className="font-semibold">Badge Earned: {result.badge_awarded.name}</p>
                  <p className="text-xs text-muted-foreground">+{result.badge_awarded.points} bonus points</p>
                </div>
              )}
              <Button onClick={() => navigate("/lewte")} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Oops!</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button onClick={() => navigate("/lewte")} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
