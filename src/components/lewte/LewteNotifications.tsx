import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function LewteNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data as Notification[]) || []);
    setLoading(false);
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;
    
    for (const n of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <Skeleton className="h-24 rounded-lg" />;

  if (notifications.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Bell className="h-4 w-4" /> Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs ml-1">{unreadCount}</Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead}>
              <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-48 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
              n.is_read ? "bg-muted/30" : "bg-primary/5 border border-primary/20"
            }`}
            onClick={() => !n.is_read && markRead(n.id)}
          >
            <ClipboardList className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${n.is_read ? "text-muted-foreground" : "font-medium text-foreground"}`}>
                {n.title}
              </p>
              {n.message && <p className="text-xs text-muted-foreground truncate">{n.message}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
