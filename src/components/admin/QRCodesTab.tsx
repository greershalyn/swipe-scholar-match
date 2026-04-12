import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Download, QrCode, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAdminManage } from "@/hooks/useAdminManage";
import { toast } from "@/hooks/use-toast";

const LIMIT_TYPES = [
  { value: "once", label: "Once (ever)" },
  { value: "daily", label: "Once per day" },
  { value: "weekly", label: "Once per week" },
  { value: "monthly", label: "Once per month" },
  { value: "lifetime_limit", label: "X times total" },
  { value: "unlimited", label: "Unlimited" },
];

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export default function QRCodesTab() {
  const { list, create, update, remove, isLoading } = useAdminManage();
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    points_value: 10,
    redemption_limit_type: "once",
    redemption_limit_count: 1,
    max_total_redemptions: "",
    expires_at: "",
    badge_id: "",
    badge_scan_threshold: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [qr, b] = await Promise.all([list("qr_codes"), list("badges")]);
    setQrCodes(qr || []);
    setBadges(b || []);
  }

  async function handleCreate() {
    if (!form.name) return;
    const code = generateCode();
    const data: any = {
      code,
      name: form.name,
      points_value: form.points_value,
      redemption_limit_type: form.redemption_limit_type,
      redemption_limit_count: form.redemption_limit_count,
      max_total_redemptions: form.max_total_redemptions ? parseInt(form.max_total_redemptions) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      badge_id: form.badge_id || null,
      badge_scan_threshold: form.badge_scan_threshold ? parseInt(form.badge_scan_threshold) : null,
    };
    await create("qr_codes", data);
    toast({ title: "QR code created", description: `Code: ${code}` });
    setForm({ name: "", points_value: 10, redemption_limit_type: "once", redemption_limit_count: 1, max_total_redemptions: "", expires_at: "", badge_id: "", badge_scan_threshold: "" });
    setOpen(false);
    loadData();
  }

  async function handleToggle(id: string, isActive: boolean) {
    await update("qr_codes", id, { is_active: !isActive });
    loadData();
  }

  async function handleDelete(id: string) {
    await remove("qr_codes", id);
    toast({ title: "QR code deleted" });
    loadData();
  }

  function getQRUrl(code: string) {
    return `https://swipe-scholar-match.lovable.app/qr/${code}`;
  }

  function handleDownload(code: string) {
    const svg = document.getElementById(`qr-${code}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `qr-${code}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }

  function handleCopyUrl(code: string) {
    navigator.clipboard.writeText(getQRUrl(code));
    toast({ title: "URL copied to clipboard" });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>QR Codes</CardTitle>
            <CardDescription>Create QR codes that award points when scanned</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1" /> New QR Code</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create QR Code</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name / Label</Label>
                  <Input placeholder="e.g. Career Fair Check-in" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Points Per Scan</Label>
                  <Input type="number" min={1} value={form.points_value} onChange={(e) => setForm({ ...form, points_value: parseInt(e.target.value) || 0 })} />
                </div>

                {/* Per-User Limits */}
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Per-User Limits</p>
                  <p className="text-xs text-muted-foreground">How often each individual student can scan this code</p>
                  <div className="space-y-1">
                    <Label className="text-xs">Frequency</Label>
                    <Select value={form.redemption_limit_type} onValueChange={(v) => setForm({ ...form, redemption_limit_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LIMIT_TYPES.map((lt) => (
                          <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.redemption_limit_type === "lifetime_limit" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Max Scans Per User</Label>
                      <Input type="number" min={1} value={form.redemption_limit_count} onChange={(e) => setForm({ ...form, redemption_limit_count: parseInt(e.target.value) || 1 })} />
                    </div>
                  )}
                </div>

                {/* Global Limits */}
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                  <p className="text-xs font-semibold text-foreground">Global Limits (All Users)</p>
                  <p className="text-xs text-muted-foreground">Limits that apply across all students combined</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Max Total Redemptions</Label>
                      <Input type="number" min={1} placeholder="Unlimited" value={form.max_total_redemptions} onChange={(e) => setForm({ ...form, max_total_redemptions: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Expiration Date</Label>
                      <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-3 bg-muted/30 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Badge Reward (optional)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Badge</Label>
                      <Select value={form.badge_id} onValueChange={(v) => setForm({ ...form, badge_id: v === "none" ? "" : v })}>
                        <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {badges.filter((b: any) => b.is_active).map((b: any) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {form.badge_id && (
                      <div className="space-y-1">
                        <Label className="text-xs">Scans to Earn Badge</Label>
                        <Input type="number" min={1} placeholder="e.g. 5" value={form.badge_scan_threshold} onChange={(e) => setForm({ ...form, badge_scan_threshold: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={isLoading}>Create QR Code</Button>
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
              <TableHead>Points</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Scans</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qrCodes.map((qr) => (
              <TableRow key={qr.id}>
                <TableCell className="font-medium">{qr.name}</TableCell>
                <TableCell>{qr.points_value}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {LIMIT_TYPES.find((lt) => lt.value === qr.redemption_limit_type)?.label || qr.redemption_limit_type}
                    {qr.redemption_limit_type === "lifetime_limit" && ` (${qr.redemption_limit_count})`}
                  </Badge>
                </TableCell>
                <TableCell>
                  {qr.current_redemptions}{qr.max_total_redemptions ? `/${qr.max_total_redemptions}` : ""}
                </TableCell>
                <TableCell>
                  {qr.badge_id ? (
                    <Badge variant="secondary" className="text-xs">
                      {badges.find((b: any) => b.id === qr.badge_id)?.name || "Badge"}
                      {qr.badge_scan_threshold && ` @${qr.badge_scan_threshold}`}
                    </Badge>
                  ) : "—"}
                </TableCell>
                <TableCell>
                  <Switch checked={qr.is_active} onCheckedChange={() => handleToggle(qr.id, qr.is_active)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setPreviewCode(previewCode === qr.code ? null : qr.code)}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyUrl(qr.code)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(qr.code)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(qr.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {qrCodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No QR codes yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Hidden QR SVGs for download */}
        <div className="sr-only">
          {qrCodes.map((qr) => (
            <QRCodeSVG key={qr.code} id={`qr-${qr.code}`} value={getQRUrl(qr.code)} size={512} />
          ))}
        </div>

        {/* Preview modal */}
        {previewCode && (
          <div className="mt-4 flex flex-col items-center gap-2 border rounded-lg p-4">
            <QRCodeSVG value={getQRUrl(previewCode)} size={200} />
            <p className="text-xs text-muted-foreground font-mono">{getQRUrl(previewCode)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
