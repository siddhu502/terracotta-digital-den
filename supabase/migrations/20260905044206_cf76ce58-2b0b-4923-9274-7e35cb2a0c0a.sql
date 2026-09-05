CREATE TABLE IF NOT EXISTS public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_title text NOT NULL,
  buyer_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS downloads_created_at_idx ON public.downloads (created_at DESC);
GRANT SELECT ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view downloads" ON public.downloads;
CREATE POLICY "Admins can view downloads" ON public.downloads
FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));