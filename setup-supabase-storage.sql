-- ============================================================================
-- SETUP SUPABASE STORAGE FOR DOCUMENTS
-- Run this in Supabase Dashboard > SQL Editor
-- Alternative to AWS S3 (no CORS issues!)
-- ============================================================================

-- Create documents bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their documents" ON storage.objects;

-- Policy: Users can upload documents
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Policy: Users can view documents (all authenticated users)
CREATE POLICY "Users can view their documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Policy: Users can update their own documents
CREATE POLICY "Users can update their documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM matters WHERE advocate_id = auth.uid()
  )
);

-- Policy: Users can delete their own documents
CREATE POLICY "Users can delete their documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM matters WHERE advocate_id = auth.uid()
  )
);

-- Add url column to document_uploads if not exists
ALTER TABLE document_uploads
ADD COLUMN IF NOT EXISTS url TEXT;

-- Verify setup
SELECT 
  '✅ Supabase Storage Setup Complete!' as status,
  'Bucket: documents' as bucket,
  '4 RLS policies created' as policies;

-- Show bucket details
SELECT 
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as max_size_mb,
  array_length(allowed_mime_types, 1) as allowed_types_count
FROM storage.buckets
WHERE id = 'documents';

-- Show policies
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%documents%'
ORDER BY policyname;
