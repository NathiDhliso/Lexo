-- ============================================
-- Database Cleanup - Remove Non-Core Tables
-- ============================================
-- Purpose: Remove all tables not needed for core workflow
-- Core: Matters → Pro Forma → Invoices
-- Date: 2025-10-06
-- ============================================

BEGIN;

-- ============================================
-- 1. Document Intelligence Tables
-- ============================================
DROP TABLE IF EXISTS document_analysis CASCADE;
DROP TABLE IF EXISTS document_extractions CASCADE;
DROP TABLE IF EXISTS document_classifications CASCADE;
DROP TABLE IF EXISTS ai_training_data CASCADE;
DROP TABLE IF EXISTS document_processing_queue CASCADE;
DROP TABLE IF EXISTS ocr_results CASCADE;

-- ============================================
-- 2. Practice Growth Tables
-- ============================================
DROP TABLE IF EXISTS client_acquisition CASCADE;
DROP TABLE IF EXISTS referral_tracking CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS lead_management CASCADE;
DROP TABLE IF EXISTS practice_metrics CASCADE;
DROP TABLE IF EXISTS growth_analytics CASCADE;

-- ============================================
-- 3. Strategic Finance Tables
-- ============================================
DROP TABLE IF EXISTS trust_accounts CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;
DROP TABLE IF EXISTS financial_forecasts CASCADE;
DROP TABLE IF EXISTS budget_management CASCADE;
DROP TABLE IF EXISTS cash_flow_analysis CASCADE;
DROP TABLE IF EXISTS strategic_planning CASCADE;
DROP TABLE IF EXISTS practice_benchmarks CASCADE;

-- ============================================
-- 4. Workflow Integration Tables
-- ============================================
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS integration_logs CASCADE;
DROP TABLE IF EXISTS webhook_endpoints CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS integration_mappings CASCADE;
DROP TABLE IF EXISTS sync_status CASCADE;
DROP TABLE IF EXISTS external_connections CASCADE;
DROP TABLE IF EXISTS oauth_tokens CASCADE;

-- ============================================
-- 5. Advanced Compliance Tables
-- ============================================
DROP TABLE IF EXISTS compliance_rules CASCADE;
DROP TABLE IF EXISTS compliance_violations CASCADE;
DROP TABLE IF EXISTS audit_trails CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS compliance_reports CASCADE;
DROP TABLE IF EXISTS regulatory_requirements CASCADE;
DROP TABLE IF EXISTS ethics_checks CASCADE;
DROP TABLE IF EXISTS conflict_checks CASCADE;

-- ============================================
-- 6. API Integration Tables
-- ============================================
DROP TABLE IF EXISTS api_integrations CASCADE;
DROP TABLE IF EXISTS api_credentials CASCADE;
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS integration_status CASCADE;

-- ============================================
-- 7. Academy/Learning Tables
-- ============================================
DROP TABLE IF EXISTS academy_courses CASCADE;
DROP TABLE IF EXISTS academy_modules CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS cpd_points CASCADE;

-- ============================================
-- 8. Template System Tables
-- ============================================
DROP TABLE IF EXISTS matter_templates CASCADE;
DROP TABLE IF EXISTS template_categories CASCADE;
DROP TABLE IF EXISTS template_fields CASCADE;

-- ============================================
-- 9. Firm Branding Tables
-- ============================================
DROP TABLE IF EXISTS firm_branding CASCADE;
DROP TABLE IF EXISTS custom_themes CASCADE;
DROP TABLE IF EXISTS logo_uploads CASCADE;

-- ============================================
-- 10. Complex RBAC Tables
-- ============================================
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permission_groups CASCADE;

COMMIT;

-- ============================================
-- Verify Remaining Tables
-- ============================================
SELECT 
    tablename,
    schemaname
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- Expected Core Tables:
-- ============================================
-- ✅ advocates
-- ✅ expenses
-- ✅ invoices
-- ✅ matters
-- ✅ matter_services
-- ✅ payments
-- ✅ pro_forma_requests
-- ✅ services
-- ✅ time_entries
-- ✅ user_preferences
-- ============================================
