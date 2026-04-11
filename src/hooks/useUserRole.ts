import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "advertiser" | "school_admin" | "moderator";

export function useUserRole() {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoles() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRoles([]);
        setIsLoading(false);
        return;
      }
      setUserId(user.id);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setRoles((data || []).map((r: any) => r.role as AppRole));
      setIsLoading(false);
    }
    fetchRoles();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = hasRole("super_admin");
  const isAdvertiser = hasRole("advertiser");
  const isSchoolAdmin = hasRole("school_admin");
  const isModerator = hasRole("moderator");
  const isAnyAdmin = roles.length > 0;

  return { roles, isLoading, userId, hasRole, isSuperAdmin, isAdvertiser, isSchoolAdmin, isModerator, isAnyAdmin };
}
