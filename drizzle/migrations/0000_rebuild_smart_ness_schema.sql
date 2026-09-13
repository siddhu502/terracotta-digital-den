-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin email can claim admin role" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND role = 'admin'::public.app_role
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'goldsmith.sir@gmail.com'
);

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can add categories" ON public.categories FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 49,
  category text NOT NULL DEFAULT 'Guides',
  image_url text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can add products" ON public.products FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

-- Purchases
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  buyer_name text,
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.purchases
FOR SELECT TO authenticated USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can add own purchases" ON public.purchases
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own purchases" ON public.purchases
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Downloads log
CREATE TABLE public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  product_title text NOT NULL,
  buyer_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX downloads_created_at_idx ON public.downloads (created_at DESC);
GRANT SELECT ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view downloads" ON public.downloads
FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

INSERT INTO public.categories (name) VALUES
  ('Planners'), ('Resumes'), ('Art Prints'), ('Guides'), ('Templates');