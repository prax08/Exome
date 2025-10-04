-- Create a new storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Policy for users to upload their own receipts
CREATE POLICY "Allow authenticated users to upload their own receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to view their own receipts
CREATE POLICY "Allow authenticated users to view their own receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to delete their own receipts
CREATE POLICY "Allow authenticated users to delete their own receipts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy for authenticated users to update their own receipts (e.g., replace)
CREATE POLICY "Allow authenticated users to update their own receipts"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);