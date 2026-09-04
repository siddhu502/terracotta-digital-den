DROP POLICY IF EXISTS "Admin email can claim admin role" ON public.user_roles;
CREATE POLICY "Admin email can claim admin role" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'admin'::app_role
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'goldsmith.sir@gmail.com'
);
INSERT INTO public.user_roles (user_id, role)
VALUES ('61d7cc14-0c31-4302-8f6d-425fac223533', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;