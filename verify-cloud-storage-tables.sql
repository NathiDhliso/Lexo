-- Verify cloud storage tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN (
        'cloud_storage_connections',
        'cloud_storage_sync_log',
        'document_cloud_storage'
    )
ORDER BY table_name;

-- Check if any connections exist
SELECT COUNT(*) as connection_count FROM cloud_storage_connections;

-- Check RLS policies
SELECT 
    schemaname,
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
