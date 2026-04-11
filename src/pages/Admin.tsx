import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Globe, Tag, ClipboardList, Loader2, Settings, Users, BarChart3, Shield, Lock } from "lucide-react";
import { useAdminManage } from "@/hooks/useAdminManage";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { GradientIcon } from "@/components/ui/gradient-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UserManagementTab from "@/components/admin/UserManagementTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";

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

  const defaultTab = isSuperAdmin ? "users" : isAdvertiser ? "coupons" : isSchoolAdmin ? "surveys" : "coupons";

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
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" /> Users</TabsTrigger>
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
          {(isSuperAdmin || isAdvertiser) && (
            <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
          )}
        </TabsList>

        {isSuperAdmin && (
          <TabsContent value="users"><UserManagementTab /></TabsContent>
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
  const [form, setForm] = useState({ title: "", description: "", coupon_code: "", discount_value: "", merchant_name: "", merchant_url: "", category: "" });

  useEffect(() => { loadCoupons(); }, []);
  async function loadCoupons() { setCoupons(await list("coupons") || []); }

  async function handleCreate() {
    if (!form.title || !form.merchant_name) return;
    await create("coupons", form);
    toast({ title: "Coupon created" });
    setForm({ title: "", description: "", coupon_code: "", discount_value: "", merchant_name: "", merchant_url: "", category: "" });
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
            <DialogContent>
              <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Coupon Code" value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} />
                  <Input placeholder="Discount (e.g. 20% off)" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
                </div>
                <Input placeholder="Merchant Name" value={form.merchant_name} onChange={(e) => setForm({ ...form, merchant_name: e.target.value })} />
                <Input placeholder="Merchant URL" value={form.merchant_url} onChange={(e) => setForm({ ...form, merchant_url: e.target.value })} />
                <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
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
              <TableHead>Title</TableHead>
              <TableHead>Merchant</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell>{c.merchant_name}</TableCell>
                <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{c.coupon_code || "—"}</code></TableCell>
                <TableCell>{c.discount_value || "—"}</TableCell>
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
  const { list, create, remove, isLoading } = useAdminManage();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [questionOpen, setQuestionOpen] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qForm, setQForm] = useState({ question_text: "", question_type: "text", options: "", is_required: true, display_order: 0 });

  useEffect(() => { loadSurveys(); }, []);
  async function loadSurveys() { setSurveys(await list("surveys") || []); }

  async function handleCreate() {
    if (!form.title) return;
    await create("surveys", form);
    toast({ title: "Survey created" });
    setForm({ title: "", description: "" });
    setOpen(false);
    loadSurveys();
  }

  async function handleDelete(id: string) {
    await remove("surveys", id);
    toast({ title: "Survey deleted" });
    loadSurveys();
  }

  async function loadQuestions(surveyId: string) {
    setQuestionOpen(surveyId);
    const data = await list("survey_questions");
    setQuestions((data || []).filter((q: any) => q.survey_id === surveyId));
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
                      <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
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
              </CardContent>
            )}
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
