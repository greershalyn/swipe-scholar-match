
-- Drop the problematic FOR ALL policy that causes recursion
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;

-- For SELECT: users can see their own roles (already exists), no super_admin check needed
-- For INSERT/UPDATE/DELETE: use the security definer function
CREATE POLICY "Super admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));
