-- ============================================================================
-- FINAL CLOUD STORAGE FIX
-- Run this in Supabase SQL Editor to fix all permissions
-- ============================================================================

-- Step 1: Grant permissions to authenticated role
GRANT ALL ON cloud_storage_connections TO authenticated;
GRANT ALL ON cloud_storage_sync_log TO authenticated;
GRANT ALL ON document_cloud_storage TO authenticated;

-- Step 2: Enable RLS
ALTER TABLE cloud_storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_storage_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_cloud_storage ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies (clean slate)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cloud_storage_connections') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON cloud_storage_connections';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'cloud_storage_sync_log') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON cloud_storage_sync_log';
    END LOOP;
    
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'document_cloud_storage') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON document_cloud_storage';
    END LOOP;
END $$;

-- Step 4: Create simple, working policies
CREATE POLICY "cloud_storage_select" ON cloud_storage_connections
    FOR SELECT TO authenticated
    USING (advocate_id = auth.uid());

CREATE POLICY "cloud_storage_insert" ON cloud_storage_connections
    FOR INSERT TO authenticated
    WITH CHECK (advocate_id = auth.uid());

CREATE POLICY "cloud_storage_update" ON cloud_storage_connections
    FOR UPDATE TO authenticated
    USING (advocate_id = auth.uid());

CREATE POLICY "cloud_storage_delete" ON cloud_storage_connections
    FOR DELETE TO authenticated
    USING (advocate_id = auth.uid());

CREATE POLICY "sync_log_select" ON cloud_storage_sync_log
    FOR SELECT TO authenticated
    USING (connection_id IN (SELECT id FROM cloud_storage_connections WHERE advocate_id = auth.uid()));

CREATE POLICY "sync_log_insert" ON cloud_storage_sync_log
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "doc_storage_select" ON document_cloud_storage
    FOR SELECT TO authenticated
    USING (document_upload_id IN (SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()));

CREATE POLICY "doc_storage_insert" ON document_cloud_storage
    FOR INSERT TO authenticated
    WITH CHECK (document_upload_id IN (SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()));

CREATE POLICY "doc_storage_update" ON document_cloud_storage
    FOR UPDATE TO authenticated
    USING (document_upload_id IN (SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()));

CREATE POLICY "doc_storage_delete" ON document_cloud_storage
    FOR DELETE TO authenticated
    USING (document_upload_id IN (SELECT id FROM document_uploads WHERE uploaded_by = auth.uid()));

-- Step 5: Verify
SELECT 'SUCCESS: Cloud Storage is now configured!' as status;

SELECT 
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename IN ('cloud_storage_connections', 'cloud_storage_sync_log', 'document_cloud_storage')
ORDER BY tablename, policyname;
