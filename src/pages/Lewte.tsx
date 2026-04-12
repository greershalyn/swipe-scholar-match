import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Mail, Tag, ClipboardList, Bell, Loader2 } from "lucide-react";
import { useStudentVerification } from "@/hooks/useStudentVerification";
import { LewteVerification } from "@/components/lewte/LewteVerification";
import { LewteCoupons } from "@/components/lewte/LewteCoupons";
import { LewteSurveys } from "@/components/lewte/LewteSurveys";
import { LewteDashboard } from "@/components/lewte/LewteDashboard";
import { LewteNotifications } from "@/components/lewte/LewteNotifications";
import { LewteBadges } from "@/components/lewte/LewteBadges";
import { GradientIcon } from "@/components/ui/gradient-icon";

export default function Lewte() {
  const { isVerified, isLoading } = useStudentVerification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isVerified) {
    return <LewteVerification />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <GradientIcon icon={ShieldCheck} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lewte</h1>
          <p className="text-sm text-muted-foreground">Exclusive student deals & surveys</p>
        </div>
        <Badge variant="outline" className="ml-auto border-green-500 text-green-700">
          <ShieldCheck className="h-3 w-3 mr-1" /> Verified Student
        </Badge>
      </div>

      <LewteNotifications />
      <LewteDashboard />
      <LewteBadges />

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons" className="flex items-center gap-1">
            <Tag className="h-4 w-4" /> Coupons & Deals
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-1">
            <ClipboardList className="h-4 w-4" /> Surveys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          <LewteCoupons />
        </TabsContent>
        <TabsContent value="surveys">
          <LewteSurveys />
        </TabsContent>
      </Tabs>
    </div>
  );
}
