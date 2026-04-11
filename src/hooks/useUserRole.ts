import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "advertiser" | "school_admin" | "moderator";

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles(uid: string) {
      setUserId(uid);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      console.log("useUserRole fetch:", { data, error, uid });
      setRoles((data || []).map((r: any) => r.role as AppRole));
      setIsLoading(false);
    }

    // Check current session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchRoles(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchRoles(session.user.id);
      } else {
        setRoles([]);
        setUserId(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = hasRole("super_admin");
  const isAdvertiser = hasRole("advertiser");
  const isSchoolAdmin = hasRole("school_admin");
  const isModerator = hasRole("moderator");
  const isAnyAdmin = roles.length > 0;

  return { roles, isLoading, userId, hasRole, isSuperAdmin, isAdvertiser, isSchoolAdmin, isModerator, isAnyAdmin };
}
