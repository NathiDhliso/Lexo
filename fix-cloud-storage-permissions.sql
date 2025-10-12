-- Complete Cloud Storage Permissions Fix
-- This grants necessary permissions and sets up RLS policies

-- Grant permissions to authenticated users
GRANT ALL ON cloud_storage_connections TO authenticated;
GRANT ALL ON cloud_storage_sync_log TO authenticated;
GRANT ALL ON document_cloud_storage TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make sure RLS is enabled
ALTER TABLE cloud_storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_cloud_storage ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can insert their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can update their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can delete their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can view their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can insert their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can update their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Advocates can delete their own cloud storage connections" ON cloud_storage_connections;

DROP POLICY IF EXISTS "Users can view their own sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "System can insert sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "Advocates can view their own sync logs" ON cloud_storage_sync_log;

DROP POLICY IF EXISTS "Users can view their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can insert document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can update their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Users can delete their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can view their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can insert document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can update their document cloud storage mappings" ON document_cloud_storage;
DROP POLICY IF EXISTS "Advocates can delete their document cloud storage mappings" ON document_cloud_storage;

-- Create new simple policies for cloud_storage_connections
CREATE POLICY "Enable read access for users" 
ON cloud_storage_connections
FOR SELECT 
TO authenticated
USING (advocate_id = auth.uid());

CREATE POLICY "Enable insert for users" 
ON cloud_storage_connections
FOR INSERT 
TO authenticated
WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Enable update for users" 
ON cloud_storage_connections
FOR UPDATE 
TO authenticated
USING (advocate_id = auth.uid())
WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "Enable delete for users" 
ON cloud_storage_connections
FOR DELETE 
TO authenticated
USING (advocate_id = auth.uid());

-- Create policies for cloud_storage_sync_log
CREATE POLICY "Enable read access for sync logs" 
ON cloud_storage_sync_log
FOR SELECT 
TO authenticated
USING (
  connection_id IN (
    SELECT id FROM cloud_storage_connections 
    WHERE advocate_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for sync logs" 
ON cloud_storage_sync_log
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policies for document_cloud_storage
CREATE POLICY "Enable read access for document mappings" 
ON document_cloud_storage
FOR SELECT 
TO authenticated
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

CREATE POLICY "Enable insert for document mappings" 
ON document_cloud_storage
FOR INSERT 
TO authenticated
WITH CHECK (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

CREATE POLICY "Enable update for document mappings" 
ON document_cloud_storage
FOR UPDATE 
TO authenticated
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
)
WITH CHECK (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

CREATE POLICY "Enable delete for document mappings" 
ON document_cloud_storage
FOR DELETE 
TO authenticated
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by = auth.uid()
  )
);

-- Verify setup
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity
FROM pg_tables
WHERE tablename IN (
    'cloud_storage_connections',
    'cloud_storage_sync_log',
    'document_cloud_storage'
)
ORDER BY tablename;

-- Show policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN (
    'cloud_storage_connections',
    'cloud_storage_sync_log',
    'document_cloud_storage'
)
ORDER BY tablename, policyname;

-- Success message
SELECT 'Cloud Storage Permissions and RLS Fixed!' as status;
