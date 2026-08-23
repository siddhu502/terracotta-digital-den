CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  image_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can add products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

INSERT INTO public.products (title, description, price, category, image_url, pdf_url) VALUES
('2026 Minimal Life Planner', 'A 120-page undated planner with monthly spreads, habit trackers and reflection prompts. Print at home on A4 or US Letter.', 14.00, 'Planners', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80', NULL),
('Modern Resume Kit', 'Three ATS-friendly resume layouts plus a matching cover letter, delivered as editable PDF templates.', 9.50, 'Resumes', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80', NULL),
('Terracotta Arches Print Set', 'Set of three warm-toned geometric art prints, ready to print at 8x10 and 11x14 inches.', 12.00, 'Art Prints', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80', NULL),
('Freelance Pricing Guide', 'A practical 40-page guide to pricing creative work, with worksheets and rate calculators.', 21.00, 'Guides', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', NULL),
('Small Shop Invoice Templates', 'Ten clean invoice and receipt templates for small product businesses.', 7.00, 'Templates', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80', NULL),
('Weekly Meal Plan Bundle', 'Meal planning sheets, grocery checklists and a pantry inventory tracker.', 8.50, 'Planners', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80', NULL);