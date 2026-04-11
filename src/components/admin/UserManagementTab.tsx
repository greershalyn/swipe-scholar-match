import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Users, Loader2, UserPlus } from "lucide-react";
import { useAdminManage } from "@/hooks/useAdminManage";
import { toast } from "@/hooks/use-toast";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-500/10 text-red-600 border-red-200" },
  advertiser: { label: "Advertiser", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  school_admin: { label: "School Admin", color: "bg-green-500/10 text-green-600 border-green-200" },
  moderator: { label: "Moderator", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
};

export default function UserManagementTab() {
  const { listUsers, isLoading } = useAdminManage();
  const [admins, setAdmins] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "advertiser" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    const data = await listUsers();
    setAdmins(data || []);
  }

  async function handleCreate() {
    if (!form.email || !form.password || !form.role) {
      toast({ title: "All fields required", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: result, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke("admin-manage", {
        body: { table: "user_roles", action: "create_admin", data: form },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      toast({ title: "Admin created", description: `${form.email} added as ${ROLE_LABELS[form.role]?.label}` });
      setForm({ email: "", password: "", role: "advertiser" });
      setCreateOpen(false);
      loadAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Delete admin account "${email}"? This cannot be undone.`)) return;
    try {
      const { data: result, error } = await (await import("@/integrations/supabase/client")).supabase.functions.invoke("admin-manage", {
        body: { table: "user_roles", action: "delete_admin", data: { user_id: userId } },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      toast({ title: "Admin deleted" });
      loadAdmins();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  // Filter out super_admin (yourself) from the deletable list
  const otherAdmins = admins.filter((a) => !a.roles?.includes("super_admin"));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Admin Accounts
            </CardTitle>
            <CardDescription>Create and manage admin accounts. These are separate from regular users.</CardDescription>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-1" /> Create Admin</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Admin Account</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    placeholder="admin@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Temporary Password</label>
                  <Input
                    type="text"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Share this with the admin so they can log in</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Account Type</label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advertiser">
                        <div className="flex flex-col">
                          <span>Advertiser</span>
                          <span className="text-xs text-muted-foreground">Can create & manage their own coupons, view analytics</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="school_admin">
                        <div className="flex flex-col">
                          <span>School Admin</span>
                          <span className="text-xs text-muted-foreground">Can create surveys for their school's students</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderator">
                        <div className="flex flex-col">
                          <span>Moderator</span>
                          <span className="text-xs text-muted-foreground">Can review content but not create admin accounts</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                  Create Admin Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && admins.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : otherAdmins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No admin accounts yet. Create one to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherAdmins.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.roles?.map((r: string) => (
                        <Badge key={r} variant="outline" className={`text-xs ${ROLE_LABELS[r]?.color || ""}`}>
                          {ROLE_LABELS[r]?.label || r}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id, a.email)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
