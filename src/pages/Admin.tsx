import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Globe, Tag, ClipboardList, Loader2, Settings, Users, BarChart3, Shield, Lock, ArrowUp, ArrowDown, CheckCircle, Ticket, Award, Trophy, Star, Target, Gift, Calendar, ShoppingBag, Flame, Medal, Heart, Zap, Crown, Gem, Sparkles, GraduationCap, BookOpen, type LucideIcon } from "lucide-react";
import { useAdminManage } from "@/hooks/useAdminManage";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import UserManagementTab from "@/components/admin/UserManagementTab";

export default function Admin() {
  const { roles, isLoading: rolesLoading, isSuperAdmin, isAdvertiser, isSchoolAdmin, isModerator, isAnyAdmin } = useUserRole();

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAnyAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Access Denied</h1>
        <p className="text-sm text-muted-foreground">You don't have admin privileges.</p>
      </div>
    );
  }

  const defaultTab = isSuperAdmin ? "admins" : isAdvertiser ? "coupons" : isSchoolAdmin ? "surveys" : "coupons";

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <GradientIcon icon={Shield} className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            {isSuperAdmin ? "Full control — manage users, content, and analytics" :
             isAdvertiser ? "Manage your coupons and view analytics" :
             isSchoolAdmin ? "Manage your surveys" : "Admin panel"}
          </p>
          <div className="flex gap-1 mt-1">
            {roles.map((r) => (
              <Badge key={r} variant="outline" className="text-xs">{r.replace("_", " ")}</Badge>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="flex-wrap">
          {isSuperAdmin && (
            <TabsTrigger value="admins"><Users className="h-4 w-4 mr-1" /> Admin Accounts</TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="domains"><Globe className="h-4 w-4 mr-1" /> Domains</TabsTrigger>
          )}
          {(isSuperAdmin || isAdvertiser) && (
            <TabsTrigger value="coupons"><Tag className="h-4 w-4 mr-1" /> Coupons</TabsTrigger>
          )}
          {(isSuperAdmin || isSchoolAdmin) && (
            <TabsTrigger value="surveys"><ClipboardList className="h-4 w-4 mr-1" /> Surveys</TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="promo"><Ticket className="h-4 w-4 mr-1" /> Promo Codes</TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="badges"><Award className="h-4 w-4 mr-1" /> Badges</TabsTrigger>
          )}
          {(isSuperAdmin || isAdvertiser) && (
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
          )}
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="admins"><UserManagementTab /></TabsContent>
        )}
        {isSuperAdmin && (
          <TabsContent value="domains"><DomainsTab /></TabsContent>
        )}
        {(isSuperAdmin || isAdvertiser) && (
          <TabsContent value="coupons"><CouponsTab /></TabsContent>
        )}
        {(isSuperAdmin || isSchoolAdmin) && (
          <TabsContent value="surveys"><SurveysTab /></TabsContent>
        )}
        {isSuperAdmin && (
          <TabsContent value="promo"><PromoCodesTab /></TabsContent>
        )}
        {isSuperAdmin && (
          <TabsContent value="badges"><BadgesTab /></TabsContent>
        )}
        {(isSuperAdmin || isAdvertiser) && (
          <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function DomainsTab() {
  const { list, create, remove, isLoading } = useAdminManage();
  const [domains, setDomains] = useState<any[]>([]);
  const [domain, setDomain] = useState("");
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => { loadDomains(); }, []);
  async function loadDomains() { setDomains(await list("allowed_school_domains") || []); }

  async function handleAdd() {
    if (!domain || !schoolName) return;
    await create("allowed_school_domains", { domain: domain.toLowerCase(), school_name: schoolName });
    toast({ title: "Domain added" });
    setDomain(""); setSchoolName("");
    loadDomains();
  }

  async function handleDelete(id: string) {
    await remove("allowed_school_domains", id);
    toast({ title: "Domain removed" });
    loadDomains();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allowed School Domains</CardTitle>
        <CardDescription>Manage which school email domains can access Lewte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="university.edu" value={domain} onChange={(e) => setDomain(e.target.value)} />
          <Input placeholder="University Name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          <Button onClick={handleAdd} disabled={isLoading}><Plus className="h-4 w-4 mr-1" /> Add</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>School Name</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-mono text-sm">{d.domain}</TableCell>
                <TableCell>{d.school_name}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CouponsTab() {
  const { list, create, remove, isLoading } = useAdminManage();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", coupon_code: "", discount_value: "",
    merchant_name: "", merchant_url: "", category: "", image_url: "", deal_type: "discount",
    redemption_expiry_days: 30, expires_at: "", reward_points_cost: "", is_physical: false,
  });

  const categories = ["Food & Drink", "Clothing", "Tech", "Entertainment", "Health & Beauty", "Travel", "Education", "Other"];

  useEffect(() => { loadCoupons(); }, []);
  async function loadCoupons() { setCoupons(await list("coupons") || []); }

  async function handleCreate() {
    if (!form.title || !form.merchant_name) return;
    const submitData: any = {
      ...form,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      reward_points_cost: form.reward_points_cost ? parseInt(form.reward_points_cost) : null,
    };
    await create("coupons", submitData);
    toast({ title: "Coupon created" });
    setForm({ title: "", description: "", coupon_code: "", discount_value: "", merchant_name: "", merchant_url: "", category: "", image_url: "", deal_type: "discount", redemption_expiry_days: 30, expires_at: "", reward_points_cost: "", is_physical: false });
    setOpen(false);
    loadCoupons();
  }

  async function handleDelete(id: string) {
    await remove("coupons", id);
    toast({ title: "Coupon deleted" });
    loadCoupons();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Coupons & Deals</CardTitle>
            <CardDescription>Create and manage student coupons</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Coupon</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Deal Type</Label>
                    <Select value={form.deal_type} onValueChange={(v) => setForm({ ...form, deal_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="free_item">Free Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Coupon Code" value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} />
                  <Input placeholder="Discount (e.g. 20% off)" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
                </div>
                <Input placeholder="Merchant Name" value={form.merchant_name} onChange={(e) => setForm({ ...form, merchant_name: e.target.value })} />
                <Input placeholder="Merchant URL" value={form.merchant_url} onChange={(e) => setForm({ ...form, merchant_url: e.target.value })} />
                <Input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
                {form.image_url && (
                  <div className="rounded-md overflow-hidden border h-24 flex items-center justify-center bg-muted">
                    <img src={form.image_url} alt="Preview" className="max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Coupon Expiration</Label>
                    <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Days to Use After Saving</Label>
                    <Input type="number" min={1} max={365} value={form.redemption_expiry_days} onChange={(e) => setForm({ ...form, redemption_expiry_days: parseInt(e.target.value) || 30 })} />
                  </div>
                </div>
                {form.deal_type === "free_item" && (
                  <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
                    <p className="text-xs font-medium text-muted-foreground">Reward Point Redemption (optional)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Reward Points Cost</Label>
                        <Input type="number" min={1} placeholder="e.g. 5" value={form.reward_points_cost} onChange={(e) => setForm({ ...form, reward_points_cost: e.target.value })} />
                      </div>
                      <div className="space-y-1 flex items-end">
                        <div className="flex items-center gap-2 pb-2">
                          <Switch checked={form.is_physical} onCheckedChange={(v) => setForm({ ...form, is_physical: v })} />
                          <Label className="text-xs">Physical Item (needs shipping)</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <Button onClick={handleCreate} className="w-full" disabled={isLoading}>Create Coupon</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {c.image_url ? (
                    <img src={c.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center"><Tag className="h-4 w-4 text-muted-foreground" /></div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.merchant_name}</TableCell>
                <TableCell>
                  <Badge variant={c.deal_type === "free_item" ? "default" : "secondary"} className="text-xs">
                    {c.deal_type === "free_item" ? "Free Item" : "Discount"}
                  </Badge>
                </TableCell>
                <TableCell>{c.category || "—"}</TableCell>
                <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{c.coupon_code || "—"}</code></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SurveysTab() {
  const { list, create, update, remove, isLoading } = useAdminManage();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", points: 0, target_audience: "all" });
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [allDomains, setAllDomains] = useState<any[]>([]);
  const [questionOpen, setQuestionOpen] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qForm, setQForm] = useState({ question_text: "", question_type: "text", options: "", is_required: true, display_order: 0 });

  useEffect(() => { loadSurveys(); loadDomainsList(); }, []);
  async function loadSurveys() { setSurveys(await list("surveys") || []); }
  async function loadDomainsList() { setAllDomains(await list("allowed_school_domains") || []); }

  async function handleCreate() {
    if (!form.title) return;
    const result = await create("surveys", form);
    if (result && result[0]?.id && form.target_audience === "select_schools" && selectedDomains.length > 0) {
      const surveyId = result[0].id;
      for (const domain of selectedDomains) {
        await create("survey_school_targets", { survey_id: surveyId, domain });
      }
      // Send notifications to verified students at those schools
      await sendSurveyNotifications(surveyId, form.title, selectedDomains);
    } else if (result && result[0]?.id && form.target_audience === "all") {
      await sendSurveyNotifications(result[0].id, form.title, []);
    }
    toast({ title: "Survey created" });
    setForm({ title: "", description: "", points: 0, target_audience: "all" });
    setSelectedDomains([]);
    setOpen(false);
    loadSurveys();
  }

  async function sendSurveyNotifications(surveyId: string, surveyTitle: string, domains: string[]) {
    // Get verified student user IDs
    const allVerifications: any[] = await list("student_email_verifications") || [];
    const verified = allVerifications.filter((v: any) => v.verified);
    
    let targetUsers = verified;
    if (domains.length > 0) {
      targetUsers = verified.filter((v: any) => {
        const emailDomain = v.school_email?.split("@")[1];
        return domains.includes(emailDomain);
      });
    }

    // Create notifications for each target user
    for (const v of targetUsers) {
      await create("notifications", {
        user_id: v.user_id,
        title: "New Survey Available",
        message: `"${surveyTitle}" is now available for you to complete.`,
        type: "survey",
        reference_id: surveyId,
      });
    }
  }

  async function handleDelete(id: string) {
    await remove("surveys", id);
    toast({ title: "Survey deleted" });
    loadSurveys();
  }

  async function loadQuestions(surveyId: string) {
    setQuestionOpen(surveyId);
    const data = await list("survey_questions");
    const filtered = (data || []).filter((q: any) => q.survey_id === surveyId);
    filtered.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
    setQuestions(filtered);
  }

  async function moveQuestion(idx: number, direction: "up" | "down") {
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === questions.length - 1)) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const a = questions[idx];
    const b = questions[swapIdx];
    await update("survey_questions", a.id, { display_order: swapIdx });
    await update("survey_questions", b.id, { display_order: idx });
    if (questionOpen) loadQuestions(questionOpen);
  }

  async function addQuestion() {
    if (!questionOpen || !qForm.question_text) return;
    const options = qForm.question_type === "multiple_choice" && qForm.options
      ? { choices: qForm.options.split(",").map((s: string) => s.trim()) }
      : null;
    await create("survey_questions", {
      survey_id: questionOpen,
      question_text: qForm.question_text,
      question_type: qForm.question_type,
      options,
      is_required: qForm.is_required,
      display_order: qForm.display_order,
    });
    toast({ title: "Question added" });
    setQForm({ question_text: "", question_type: "text", options: "", is_required: true, display_order: questions.length });
    loadQuestions(questionOpen);
  }

  async function deleteQuestion(id: string) {
    await remove("survey_questions", id);
    toast({ title: "Question removed" });
    if (questionOpen) loadQuestions(questionOpen);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Surveys</CardTitle>
            <CardDescription>Create and manage student surveys</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Survey</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Survey</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Survey Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="space-y-1">
                  <Label className="text-xs">Points for Completion</Label>
                  <Input type="number" min={0} max={100} placeholder="0" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })} />
                  <p className="text-xs text-muted-foreground">Points earned by students for completing this survey (max 100)</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Target Audience</Label>
                  <Select value={form.target_audience} onValueChange={(v) => { setForm({ ...form, target_audience: v }); if (v === "all") setSelectedDomains([]); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Verified Students</SelectItem>
                      <SelectItem value="select_schools">Select Schools Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.target_audience === "select_schools" && (
                  <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                    <Label className="text-xs font-medium">Select Schools</Label>
                    {allDomains.map((d: any) => (
                      <div key={d.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`domain-${d.id}`}
                          checked={selectedDomains.includes(d.domain)}
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedDomains([...selectedDomains, d.domain]);
                            else setSelectedDomains(selectedDomains.filter((sd) => sd !== d.domain));
                          }}
                        />
                        <Label htmlFor={`domain-${d.id}`} className="text-sm">{d.school_name} ({d.domain})</Label>
                      </div>
                    ))}
                    {allDomains.length === 0 && <p className="text-xs text-muted-foreground">No school domains configured</p>}
                  </div>
                )}
                <Button onClick={handleCreate} className="w-full" disabled={isLoading}>Create Survey</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {surveys.map((s) => (
          <Card key={s.id} className="border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  {s.description && <CardDescription className="text-xs">{s.description}</CardDescription>}
                  <div className="flex gap-1 mt-1">
                    {s.points > 0 && <Badge variant="secondary" className="text-xs">🎯 {s.points} pts</Badge>}
                    <Badge variant="outline" className="text-xs">{s.target_audience === "select_schools" ? "Select Schools" : "All Students"}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => loadQuestions(s.id)}>
                    <Edit className="h-3 w-3 mr-1" /> Questions
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {questionOpen === s.id && (
              <CardContent className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="flex items-center justify-between bg-muted/50 p-2 rounded text-sm">
                      <span>{idx + 1}. {q.question_text} <Badge variant="outline" className="ml-1 text-xs">{q.question_type}</Badge></span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => moveQuestion(idx, "up")} disabled={idx === 0}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => moveQuestion(idx, "down")} disabled={idx === questions.length - 1}>
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t pt-3">
                  <p className="text-sm font-medium">Add Question</p>
                  <Input placeholder="Question text" value={qForm.question_text} onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={qForm.question_type} onValueChange={(v) => setQForm({ ...qForm, question_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="rating">Rating (1-5)</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch checked={qForm.is_required} onCheckedChange={(v) => setQForm({ ...qForm, is_required: v })} />
                      <Label className="text-sm">Required</Label>
                    </div>
                  </div>
                  {qForm.question_type === "multiple_choice" && (
                    <Input placeholder="Options (comma separated)" value={qForm.options} onChange={(e) => setQForm({ ...qForm, options: e.target.value })} />
                  )}
                  <Button size="sm" onClick={addQuestion} disabled={isLoading}>
                    <Plus className="h-3 w-3 mr-1" /> Add Question
                  </Button>
                </div>
                <div className="flex justify-end border-t pt-3">
                  <Button variant="outline" size="sm" onClick={() => setQuestionOpen(null)}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Done
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}

function PromoCodesTab() {
  const { isLoading } = useAdminManage();
  const [codes, setCodes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", description: "", points_value: 100, max_redemptions: "", expires_at: "" });

  useEffect(() => { loadCodes(); }, []);

  async function loadCodes() {
    const { data } = await supabase.functions.invoke("admin-manage", { body: { table: "promo_codes", action: "list" } });
    setCodes(data?.data || []);
  }

  async function handleCreate() {
    if (!form.code || !form.points_value) return;
    const submitData: any = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      points_value: form.points_value,
      max_redemptions: form.max_redemptions ? parseInt(form.max_redemptions) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    const { data } = await supabase.functions.invoke("admin-manage", { body: { table: "promo_codes", action: "create", data: submitData } });
    if (data?.error) {
      toast({ title: "Error", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "Promo code created" });
    setForm({ code: "", description: "", points_value: 100, max_redemptions: "", expires_at: "" });
    setOpen(false);
    loadCodes();
  }

  async function handleDelete(id: string) {
    await supabase.functions.invoke("admin-manage", { body: { table: "promo_codes", action: "delete", id } });
    toast({ title: "Promo code deleted" });
    loadCodes();
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await supabase.functions.invoke("admin-manage", { body: { table: "promo_codes", action: "update", id, data: { is_active: !currentActive } } });
    loadCodes();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Promotional Codes</CardTitle>
            <CardDescription>Create codes that students can redeem for points</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Code</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Promo Code</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Code (what students will enter)</Label>
                  <Input placeholder="e.g. WELCOME50" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="font-mono uppercase" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description (optional)</Label>
                  <Input placeholder="Welcome bonus for new students" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Points Value</Label>
                    <Input type="number" min={1} value={form.points_value} onChange={(e) => setForm({ ...form, points_value: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Max Redemptions (blank = unlimited)</Label>
                    <Input type="number" min={1} placeholder="Unlimited" value={form.max_redemptions} onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Expiration Date (optional)</Label>
                  <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={isLoading}>Create Promo Code</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Redemptions</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {codes.map((c) => (
              <TableRow key={c.id}>
                <TableCell><code className="font-mono text-sm bg-muted px-2 py-1 rounded">{c.code}</code></TableCell>
                <TableCell className="font-semibold">{c.points_value} pts</TableCell>
                <TableCell>{c.current_redemptions}{c.max_redemptions ? ` / ${c.max_redemptions}` : ""}</TableCell>
                <TableCell>{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>
                  <Switch checked={c.is_active} onCheckedChange={() => handleToggle(c.id, c.is_active)} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {codes.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No promo codes yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const TRIGGER_TYPES = [
  { value: "survey_completion", label: "Surveys Completed" },
  { value: "points_milestone", label: "Points Milestone" },
  { value: "scholarship_actions", label: "Scholarships Saved/Applied" },
  { value: "birthday", label: "Birthday", noThreshold: true },
  { value: "coupons_redeemed", label: "Coupons Redeemed" },
  { value: "rewards_redeemed", label: "Rewards Redeemed" },
  { value: "daily_checkin", label: "Daily Check-ins" },
];

const BADGE_ICONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "trophy", label: "Trophy", icon: Trophy },
  { value: "star", label: "Star", icon: Star },
  { value: "award", label: "Award", icon: Award },
  { value: "medal", label: "Medal", icon: Medal },
  { value: "crown", label: "Crown", icon: Crown },
  { value: "gem", label: "Gem", icon: Gem },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "flame", label: "Flame", icon: Flame },
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
  { value: "target", label: "Target", icon: Target },
  { value: "gift", label: "Gift", icon: Gift },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "check-circle", label: "Check", icon: CheckCircle },
  { value: "shopping-bag", label: "Shop", icon: ShoppingBag },
  { value: "shield", label: "Shield", icon: Shield },
  { value: "graduation-cap", label: "Grad Cap", icon: GraduationCap },
  { value: "book-open", label: "Book", icon: BookOpen },
];

function BadgesTab() {
  const { isLoading } = useAdminManage();
  const [badges, setBadges] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "trophy", points_value: 10, trigger_type: "survey_completion", trigger_threshold: 1 });

  useEffect(() => { loadBadges(); }, []);

  async function loadBadges() {
    const { data } = await supabase.functions.invoke("admin-manage", { body: { table: "badges", action: "list" } });
    setBadges(data?.data || []);
  }

  async function handleCreate() {
    if (!form.name || !form.trigger_type) return;
    const triggerInfo = TRIGGER_TYPES.find(t => t.value === form.trigger_type);
    const submitData = {
      ...form,
      trigger_threshold: triggerInfo?.noThreshold ? 1 : form.trigger_threshold,
    };
    const { data } = await supabase.functions.invoke("admin-manage", { body: { table: "badges", action: "create", data: submitData } });
    if (data?.error) {
      toast({ title: "Error", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "Badge created" });
    setForm({ name: "", description: "", icon: "trophy", points_value: 10, trigger_type: "survey_completion", trigger_threshold: 1 });
    setOpen(false);
    loadBadges();
  }

  async function handleDelete(id: string) {
    await supabase.functions.invoke("admin-manage", { body: { table: "badges", action: "delete", id } });
    toast({ title: "Badge deleted" });
    loadBadges();
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await supabase.functions.invoke("admin-manage", { body: { table: "badges", action: "update", id, data: { is_active: !currentActive } } });
    loadBadges();
  }

  const selectedTrigger = TRIGGER_TYPES.find(t => t.value === form.trigger_type);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Badges & Achievements</CardTitle>
            <CardDescription>Create badges that students earn through various activities</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New Badge</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Badge</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Badge Name</Label>
                  <Input placeholder="e.g. Survey Star" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input placeholder="Awarded for completing 5 surveys" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Badge Icon</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {BADGE_ICONS.map((bi) => {
                      const BIcon = bi.icon;
                      return (
                        <button
                          key={bi.value}
                          type="button"
                          onClick={() => setForm({ ...form, icon: bi.value })}
                          className={`flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-all ${
                            form.icon === bi.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:bg-primary/5"
                          }`}
                        >
                          <BIcon className="h-5 w-5" />
                          <span className="truncate w-full text-center text-[10px]">{bi.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trigger Type</Label>
                  <Select value={form.trigger_type} onValueChange={(v) => setForm({ ...form, trigger_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!selectedTrigger?.noThreshold && (
                  <div className="space-y-1">
                    <Label className="text-xs">Threshold (how many to trigger)</Label>
                    <Input type="number" min={1} value={form.trigger_threshold} onChange={(e) => setForm({ ...form, trigger_threshold: parseInt(e.target.value) || 1 })} />
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Points Awarded</Label>
                  <Input type="number" min={0} value={form.points_value} onChange={(e) => setForm({ ...form, points_value: parseInt(e.target.value) || 0 })} />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={isLoading}>Create Badge</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {badges.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(() => { const BIcon = BADGE_ICONS.find(i => i.value === b.icon)?.icon || Trophy; return <BIcon className="h-4 w-4 text-primary" />; })()}
                    <div>
                      <span className="font-medium">{b.name}</span>
                      {b.description && <p className="text-xs text-muted-foreground">{b.description}</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {TRIGGER_TYPES.find(t => t.value === b.trigger_type)?.label || b.trigger_type}
                  </Badge>
                </TableCell>
                <TableCell>{b.trigger_threshold}</TableCell>
                <TableCell className="font-semibold">{b.points_value} pts</TableCell>
                <TableCell>
                  <Switch checked={b.is_active} onCheckedChange={() => handleToggle(b.id, b.is_active)} />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {badges.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No badges yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
