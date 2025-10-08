-- ============================================================================
-- DATABASE WIPE AND RESET SCRIPT
-- WARNING: This will DELETE ALL DATA and TABLES
-- ============================================================================
-- 
-- WORKFLOW ORDER: PRO FORMA → MATTER → INVOICE
-- The workflow ALWAYS starts with Pro Forma (quote generation)
-- 
-- ============================================================================

-- Step 1: Drop all existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS matters CASCADE;
DROP TABLE IF EXISTS proforma_requests CASCADE;
DROP TABLE IF EXISTS pro_forma_requests CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS advocates CASCADE;

-- Drop any other tables that might exist
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS matter_services CASCADE;
DROP TABLE IF EXISTS rate_cards CASCADE;
DROP TABLE IF EXISTS rate_card_templates CASCADE;
DROP TABLE IF EXISTS invoice_line_items CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS compliance_alerts CASCADE;
DROP TABLE IF EXISTS compliance_deadlines CASCADE;
DROP TABLE IF EXISTS regulatory_requirements CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS audit_entries CASCADE;
DROP TABLE IF EXISTS account_lockouts CASCADE;
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS auth_attempts CASCADE;
DROP TABLE IF EXISTS api_configurations CASCADE;
DROP TABLE IF EXISTS practice_health_metrics CASCADE;
DROP TABLE IF EXISTS cash_flow_patterns CASCADE;
DROP TABLE IF EXISTS cash_flow_predictions CASCADE;
DROP TABLE IF EXISTS advocate_profiles CASCADE;
DROP TABLE IF EXISTS advocate_specialisations CASCADE;
DROP TABLE IF EXISTS overflow_briefs CASCADE;
DROP TABLE IF EXISTS brief_applications CASCADE;

-- Step 2: Drop all existing enums
DROP TYPE IF EXISTS proforma_request_status CASCADE;
DROP TYPE IF EXISTS pro_forma_status CASCADE;
DROP TYPE IF EXISTS pro_forma_action CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS matter_status CASCADE;
DROP TYPE IF EXISTS fee_type CASCADE;
DROP TYPE IF EXISTS bar_association CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS client_type CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS time_entry_method CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS referral_status CASCADE;
DROP TYPE IF EXISTS brief_status CASCADE;
DROP TYPE IF EXISTS specialisation_category CASCADE;
DROP TYPE IF EXISTS cash_flow_status CASCADE;
DROP TYPE IF EXISTS analysis_type CASCADE;

-- Step 3: Drop all existing functions
DROP FUNCTION IF EXISTS generate_quote_number() CASCADE;
DROP FUNCTION IF EXISTS generate_matter_reference(bar_association) CASCADE;
DROP FUNCTION IF EXISTS generate_invoice_number() CASCADE;
DROP FUNCTION IF EXISTS update_matter_wip() CASCADE;
DROP FUNCTION IF EXISTS set_quote_number_trigger() CASCADE;
DROP FUNCTION IF EXISTS set_matter_reference_trigger() CASCADE;
DROP FUNCTION IF EXISTS set_invoice_number_trigger() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS link_converted_matter_trigger() CASCADE;
DROP FUNCTION IF EXISTS check_conflict(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS calculate_practice_health(uuid) CASCADE;

-- Step 4: Verify cleanup
SELECT 'Tables remaining:' as status;
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

SELECT 'Enums remaining:' as status;
SELECT typname FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;

SELECT 'Functions remaining:' as status;
SELECT proname FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
ORDER BY proname;

-- ============================================================================
-- DATABASE IS NOW CLEAN
-- Next: Run the fresh schema migration
-- File: supabase/migrations/20250101000000_fresh_core_schema.sql
-- 
-- REMEMBER: PRO FORMA → MATTER → INVOICE
-- ============================================================================
