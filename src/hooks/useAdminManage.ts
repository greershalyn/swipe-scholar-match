import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminManage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adminAction = useCallback(async (table: string, action: string, data?: any, id?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("admin-manage", {
        body: { table, action, data, id },
      });
      if (fnError) throw new Error(fnError.message);
      if (result?.error) throw new Error(result.error);
      return result.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const list = useCallback((table: string) => adminAction(table, "list"), [adminAction]);
  const create = useCallback((table: string, data: any) => adminAction(table, "create", data), [adminAction]);
  const update = useCallback((table: string, id: string, data: any) => adminAction(table, "update", data, id), [adminAction]);
  const remove = useCallback((table: string, id: string) => adminAction(table, "delete", undefined, id), [adminAction]);

  // User management (super admin only)
  const listUsers = useCallback(() => adminAction("user_roles", "list_users"), [adminAction]);
  const assignRole = useCallback((userId: string, role: string) => adminAction("user_roles", "assign_role", { user_id: userId, role }), [adminAction]);
  const removeRole = useCallback((userId: string, role: string) => adminAction("user_roles", "remove_role", { user_id: userId, role }), [adminAction]);
  const createAdmin = useCallback((email: string, password: string, role: string) => adminAction("user_roles", "create_admin", { email, password, role }), [adminAction]);
  const deleteAdmin = useCallback((userId: string) => adminAction("user_roles", "delete_admin", { user_id: userId }), [adminAction]);

  return { list, create, update, remove, listUsers, assignRole, removeRole, createAdmin, deleteAdmin, isLoading, error };
}
