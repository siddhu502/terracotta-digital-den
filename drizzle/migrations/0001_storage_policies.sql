CREATE POLICY "Authenticated can read product images" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'product-images');
CREATE POLICY "Anon can read product images" ON storage.objects
FOR SELECT TO anon USING (bucket_id = 'product-images');
CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product images" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload product files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-files' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update product files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-files' AND private.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-files' AND private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-files' AND private.has_role(auth.uid(), 'admin'));