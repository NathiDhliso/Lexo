-- Fix Cloud Storage RLS Policies
-- The 403 error means RLS is blocking access
-- This updates policies to work with your auth setup

-- First, let's check what we're working with
DO $$ 
BEGIN
    RAISE NOTICE 'Fixing Cloud Storage RLS Policies...';
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can insert their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can update their own cloud storage connections" ON cloud_storage_connections;
DROP POLICY IF EXISTS "Users can delete their own cloud storage connections" ON cloud_storage_connections;

-- Create new policies that work with advocates table
-- Policy 1: View own connections
CREATE POLICY "Advocates can view their own cloud storage connections" 
ON cloud_storage_connections
FOR SELECT 
USING (
  advocate_id IN (
    SELECT id FROM advocates WHERE user_id = auth.uid()
  )
  OR advocate_id = auth.uid()
);

-- Policy 2: Insert own connections
CREATE POLICY "Advocates can insert their own cloud storage connections" 
ON cloud_storage_connections
FOR INSERT 
WITH CHECK (
  advocate_id IN (
    SELECT id FROM advocates WHERE user_id = auth.uid()
  )
  OR advocate_id = auth.uid()
);

-- Policy 3: Update own connections
CREATE POLICY "Advocates can update their own cloud storage connections" 
ON cloud_storage_connections
FOR UPDATE 
USING (
  advocate_id IN (
    SELECT id FROM advocates WHERE user_id = auth.uid()
  )
  OR advocate_id = auth.uid()
);

-- Policy 4: Delete own connections
CREATE POLICY "Advocates can delete their own cloud storage connections" 
ON cloud_storage_connections
FOR DELETE 
USING (
  advocate_id IN (
    SELECT id FROM advocates WHERE user_id = auth.uid()
  )
  OR advocate_id = auth.uid()
);

-- Fix sync log policies
DROP POLICY IF EXISTS "Users can view their own sync logs" ON cloud_storage_sync_log;
DROP POLICY IF EXISTS "System can insert sync logs" ON cloud_storage_sync_log;

CREATE POLICY "Advocates can view their own sync logs" 
ON cloud_storage_sync_log
FOR SELECT 
USING (
  connection_id IN (
    SELECT id FROM cloud_storage_connections 
    WHERE advocate_id IN (
      SELECT id FROM advocates WHERE user_id = auth.uid()
    )
    OR advocate_id = auth.uid()
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

CREATE POLICY "Advocates can view their document cloud storage mappings" 
ON document_cloud_storage
FOR SELECT 
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by IN (
      SELECT id FROM advocates WHERE user_id = auth.uid()
    )
    OR uploaded_by = auth.uid()
  )
);

CREATE POLICY "Advocates can insert document cloud storage mappings" 
ON document_cloud_storage
FOR INSERT 
WITH CHECK (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by IN (
      SELECT id FROM advocates WHERE user_id = auth.uid()
    )
    OR uploaded_by = auth.uid()
  )
);

CREATE POLICY "Advocates can update their document cloud storage mappings" 
ON document_cloud_storage
FOR UPDATE 
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by IN (
      SELECT id FROM advocates WHERE user_id = auth.uid()
    )
    OR uploaded_by = auth.uid()
  )
);

CREATE POLICY "Advocates can delete their document cloud storage mappings" 
ON document_cloud_storage
FOR DELETE 
USING (
  document_upload_id IN (
    SELECT id FROM document_uploads 
    WHERE uploaded_by IN (
      SELECT id FROM advocates WHERE user_id = auth.uid()
    )
    OR uploaded_by = auth.uid()
  )
);

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename IN (
    'cloud_storage_connections',
    'cloud_storage_sync_log',
    'document_cloud_storage'
)
ORDER BY tablename, policyname;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Cloud Storage RLS Policies Updated Successfully!';
    RAISE NOTICE 'Policies now work with both direct auth.uid() and advocates table';
END $$;
