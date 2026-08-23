CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
CREATE POLICY "Read product files" ON storage.objects FOR SELECT USING (bucket_id = 'product-files');
CREATE POLICY "Upload product files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-files');
CREATE POLICY "Delete product files" ON storage.objects FOR DELETE USING (bucket_id = 'product-files');