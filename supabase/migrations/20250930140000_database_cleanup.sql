-- Database Cleanup Migration
-- This migration performs database maintenance and cleanup operations
-- without removing any actively used tables
-- All operations are conditional to avoid errors when tables don't exist

-- 1. Clean up any orphaned records or inconsistent data
-- 2. Optimize indexes and constraints
-- 3. Update any deprecated configurations

DO $$ 
BEGIN
    -- Clean up any orphaned time entries without valid matter references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM time_entries 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Clean up any orphaned notes without valid matter references  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM notes 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Clean up any orphaned payments without valid invoice references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DELETE FROM payments 
        WHERE invoice_id NOT IN (SELECT id FROM invoices);
    END IF;

    -- Clean up any orphaned documents without valid matter references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM documents 
        WHERE matter_id IS NOT NULL 
        AND matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Clean up any orphaned court diary entries without valid case references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_diary_entries') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_cases') THEN
        DELETE FROM court_diary_entries 
        WHERE court_case_id IS NOT NULL 
        AND court_case_id NOT IN (SELECT id FROM court_cases);
    END IF;

    -- Clean up any orphaned brief applications without valid brief references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brief_applications') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'overflow_briefs') THEN
        DELETE FROM brief_applications 
        WHERE brief_id NOT IN (SELECT id FROM overflow_briefs);
    END IF;

    -- Clean up any orphaned precedent usage records
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precedent_usage') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precedent_bank') THEN
        DELETE FROM precedent_usage 
        WHERE precedent_id NOT IN (SELECT id FROM precedent_bank);
    END IF;

    -- Clean up any orphaned fee narratives without valid matter references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_fee_narratives') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM generated_fee_narratives 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Update any deprecated voice service configurations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_service_config') THEN
        UPDATE voice_service_config 
        SET updated_at = NOW() 
        WHERE updated_at < NOW() - INTERVAL '30 days';
    END IF;

    -- Clean up old audit log entries (keep last 6 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        DELETE FROM audit_log 
        WHERE created_at < NOW() - INTERVAL '6 months';
    END IF;

    -- Clean up old court integration logs (keep last 3 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_integration_logs') THEN
        DELETE FROM court_integration_logs 
        WHERE created_at < NOW() - INTERVAL '3 months';
    END IF;

    -- Clean up old voice queries (keep last 3 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_queries') THEN
        DELETE FROM voice_queries 
        WHERE created_at < NOW() - INTERVAL '3 months';
    END IF;

    -- Clean up old transcriptions (keep last 6 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transcriptions') THEN
        DELETE FROM transcriptions 
        WHERE created_at < NOW() - INTERVAL '6 months';
    END IF;

    -- Clean up completed voice sessions older than 1 year
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_sessions') THEN
        DELETE FROM voice_sessions 
        WHERE status = 'completed' 
        AND completed_at < NOW() - INTERVAL '1 year';
    END IF;
END $$;

-- Optimize indexes by reindexing frequently used tables (conditional)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        REINDEX TABLE matters;
        ANALYZE matters;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        REINDEX TABLE invoices;
        ANALYZE invoices;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') THEN
        REINDEX TABLE time_entries;
        ANALYZE time_entries;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        REINDEX TABLE documents;
        ANALYZE documents;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'advocates') THEN
        ANALYZE advocates;
    END IF;
END $$;

-- Add comment to track cleanup
COMMENT ON SCHEMA public IS 'LexoHub database schema - cleaned up on 2025-09-30';