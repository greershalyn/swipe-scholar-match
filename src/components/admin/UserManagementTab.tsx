import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Shield, Loader2 } from "lucide-react";
import { useAdminManage } from "@/hooks/useAdminManage";
import { toast } from "@/hooks/use-toast";
import type { AppRole } from "@/hooks/useUserRole";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-500/10 text-red-600 border-red-200" },
  advertiser: { label: "Advertiser", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  school_admin: { label: "School Admin", color: "bg-green-500/10 text-green-600 border-green-200" },
  moderator: { label: "Moderator", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
};

export default function UserManagementTab() {
  const { listUsers, assignRole, removeRole, isLoading } = useAdminManage();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("advertiser");
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const data = await listUsers();
    setUsers(data || []);
  }

  async function handleAssignRole(userId: string) {
    setAssigningUserId(userId);
    await assignRole(userId, selectedRole);
    toast({ title: "Role assigned", description: `${ROLE_LABELS[selectedRole]?.label} role granted` });
    await loadUsers();
    setAssigningUserId(null);
  }

  async function handleRemoveRole(userId: string, role: string) {
    if (role === "super_admin") {
      toast({ title: "Cannot remove", description: "Super admin role cannot be removed here", variant: "destructive" });
      return;
    }
    await removeRole(userId, role);
    toast({ title: "Role removed" });
    await loadUsers();
  }

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> User & Role Management
        </CardTitle>
        <CardDescription>Assign admin roles to users. Advertisers manage coupons, school admins manage surveys.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Current Roles</TableHead>
              <TableHead>Assign Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-sm">{u.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles?.length > 0 ? u.roles.map((r: string) => (
                      <Badge
                        key={r}
                        variant="outline"
                        className={`text-xs ${ROLE_LABELS[r]?.color || ""} cursor-pointer`}
                        onClick={() => handleRemoveRole(u.id, r)}
                        title="Click to remove"
                      >
                        {ROLE_LABELS[r]?.label || r}
                        {r !== "super_admin" && <Trash2 className="h-2.5 w-2.5 ml-1" />}
                      </Badge>
                    )) : (
                      <span className="text-xs text-muted-foreground">No roles</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-[140px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advertiser">Advertiser</SelectItem>
                        <SelectItem value="school_admin">School Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAssignRole(u.id)}
                      disabled={isLoading && assigningUserId === u.id}
                    >
                      {isLoading && assigningUserId === u.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isLoading && users.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
