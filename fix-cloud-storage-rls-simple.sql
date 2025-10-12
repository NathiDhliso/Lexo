-- Simple Cloud Storage RLS Fix
-- The advocate_id directly matches auth.uid()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can insert their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can update their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can delete their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can view their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can insert their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can update their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can delete their own cloud storage connections" ON cloud_storage_connections;

-- Create simple policies that match advocate_id to auth.uid()
CREATE POLICY "Users can view their own cloud storage connections" 
ON cloud_storage_connections
FOR SELECT 
USING (advocate_id = auth.uid());

CREATE POLICY "Users can insert their own cloud storage connections" 
ON cloud_storage_connections
FOR INSERT 
WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Users can update their own cloud storage connections" 
ON cloud_storage_connections
FOR UPDATE 
USING (advocate_id = auth.uid());

CREATE POLICY "Users can delete their own cloud storage connections" 
ON cloud_storage_connections
FOR DELETE 
USING (advocate_id = auth.uid());

-- Fix sync log policies
DROP POLICY IF EXISTS "Users can view their own sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "System can insert sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "Advocates can view their own sync logs" ON cloud_storage_sync_log;

CREATE POLICY "Users can view their own sync logs" 
ON cloud_storage_sync_log
FOR SELECT 
USING (
  connection_id IN (
    SELECT id FROM cloud_storage_connections 
    WHERE advocate_id = auth.uid()
  )
);

CREATE POLICY "System can insert sync logs" 
ON cloud_storage_sync_log
FOR INSERT 
WITH CHECK (true);

-- Fix document cloud storage policies
DROP POLICY IF EXISTS "Users can view their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can insert document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can update their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can delete their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can view their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can insert document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can update their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can delete their document cloud storage mappings" ON document_cloud_storage;

CREATE POLICY "Users can view their document cloud storage mappings" 
ON document_cloud_storage
FOR SELECT 
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can insert document cloud storage mappings" 
ON document_cloud_storage
FOR INSERT 
WITH CHECK (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can update their document cloud storage mappings" 
ON document_cloud_storage
FOR UPDATE 
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

CREATE POLICY "Users can delete their document cloud storage mappings" 
ON document_cloud_storage
FOR DELETE 
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

-- Verify policies
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN (
    'cloud_storage_connections',
    'cloud_storage_sync_log',
    'document_cloud_storage'
)
ORDER BY tablename, policyname;

-- Success!
SELECT 'Cloud Storage RLS Policies Fixed!' as status;
