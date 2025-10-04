-- Database Maintenance Migration
-- This migration performs database maintenance and cleanup operations
-- Focus: Remove orphaned data and optimize performance
-- All operations are conditional to avoid errors when tables don't exist

DO $$ 
BEGIN
    -- 1. Clean up orphaned time entries without valid matter references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM time_entries 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- 2. Clean up orphaned notes without valid matter references  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM notes 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- 3. Clean up orphaned payments without valid invoice references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
        DELETE FROM payments 
        WHERE invoice_id NOT IN (SELECT id FROM invoices);
    END IF;

    -- 4. Clean up orphaned documents without valid matter references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM documents 
        WHERE matter_id IS NOT NULL 
        AND matter_id NOT IN (SELECT id FROM matters);
    END IF;

    -- 5. Clean up orphaned court diary entries without valid case references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_diary_entries') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'court_cases') THEN
        DELETE FROM court_diary_entries 
        WHERE court_case_id IS NOT NULL 
        AND court_case_id NOT IN (SELECT id FROM court_cases);
    END IF;

    -- 6. Clean up orphaned brief applications without valid brief references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brief_applications') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'overflow_briefs') THEN
        DELETE FROM brief_applications 
        WHERE brief_id NOT IN (SELECT id FROM overflow_briefs);
    END IF;

    -- 7. Clean up orphaned precedent usage records
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precedent_usage') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'precedent_bank') THEN
        DELETE FROM precedent_usage 
        WHERE precedent_id NOT IN (SELECT id FROM precedent_bank);
    END IF;

    -- 8. Clean up orphaned fee narratives without valid matter references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_fee_narratives') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matters') THEN
        DELETE FROM generated_fee_narratives 
        WHERE matter_id NOT IN (SELECT id FROM matters);
    END IF;
END $$;

-- Add comment to track maintenance
COMMENT ON SCHEMA public IS 'LexoHub database schema - maintenance performed on 2025-09-30';