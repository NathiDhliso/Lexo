-- Database Cleanup and Maintenance Migration
-- Removes orphaned data and optimizes database performance
-- All operations are conditional to avoid errors when tables don't exist

DO $$ 
BEGIN
    -- Remove orphaned time entries
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM time_entries 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Remove orphaned notes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM notes 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Remove orphaned payments
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DELETE FROM payments 
        WHERE invoice_id NOT IN (SELECT id FROM invoices);
    END IF;

    -- Remove orphaned documents
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM documents 
        WHERE matter_id IS NOT NULL 
        AND matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Remove orphaned court diary entries
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_diary_entries') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_cases') THEN
        DELETE FROM court_diary_entries 
        WHERE court_case_id IS NOT NULL 
        AND court_case_id NOT IN (SELECT id FROM court_cases);
    END IF;

    -- Remove orphaned brief applications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brief_applications') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'overflow_briefs') THEN
        DELETE FROM brief_applications 
        WHERE brief_id NOT IN (SELECT id FROM overflow_briefs);
    END IF;

    -- Remove orphaned precedent usage records
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precedent_usage') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precedent_bank') THEN
        DELETE FROM precedent_usage 
        WHERE precedent_id NOT IN (SELECT id FROM precedent_bank);
    END IF;

    -- Remove orphaned fee narratives
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_fee_narratives') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM generated_fee_narratives 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- Data retention cleanup

    -- Clean up old audit logs (keep 6 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        DELETE FROM audit_log 
        WHERE created_at < NOW() - INTERVAL '6 months';
    END IF;

    -- Clean up old integration logs (keep 3 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_integration_logs') THEN
        DELETE FROM court_integration_logs 
        WHERE created_at < NOW() - INTERVAL '3 months';
    END IF;

    -- Clean up old voice queries (keep 3 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_queries') THEN
        DELETE FROM voice_queries 
        WHERE created_at < NOW() - INTERVAL '3 months';
    END IF;

    -- Clean up old transcriptions (keep 6 months)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transcriptions') THEN
        DELETE FROM transcriptions 
        WHERE created_at < NOW() - INTERVAL '6 months';
    END IF;

    -- Clean up old completed voice sessions (keep 1 year)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'voice_sessions') THEN
        DELETE FROM voice_sessions 
        WHERE status = 'completed' 
        AND completed_at < NOW() - INTERVAL '1 year';
    END IF;
END $$;

-- Update statistics for query optimization (conditional)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        ANALYZE matters;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        ANALYZE invoices;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') THEN
        ANALYZE time_entries;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        ANALYZE documents;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'advocates') THEN
        ANALYZE advocates;
    END IF;
END $$;