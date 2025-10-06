# Database Cleanup Plan - Remove Non-Core Tables

## 🎯 Core Tables (KEEP)

### Essential for Matters → Pro Forma → Invoices workflow

**Core Tables:**
- ✅ `matters` - Legal matters
- ✅ `pro_forma_requests` - Pro forma requests
- ✅ `invoices` - Invoices
- ✅ `time_entries` - Time tracking (for billing)
- ✅ `expenses` - Expenses (for billing)
- ✅ `services` - Legal services
- ✅ `matter_services` - Link matters to services
- ✅ `advocates` - User profiles
- ✅ `payments` - Payment tracking

**Auth/System Tables:**
- ✅ `auth.users` - Supabase auth
- ✅ `user_preferences` - Basic settings

---

## 🗑️ Non-Core Tables (REMOVE)

Based on migration files, these tables should be removed:

### 1. Document Intelligence (from 20250928080849)
```sql
DROP TABLE IF EXISTS document_analysis CASCADE;
DROP TABLE IF EXISTS document_extractions CASCADE;
DROP TABLE IF EXISTS document_classifications CASCADE;
DROP TABLE IF EXISTS ai_training_data CASCADE;
DROP TABLE IF EXISTS document_processing_queue CASCADE;
DROP TABLE IF EXISTS ocr_results CASCADE;
```

### 2. Practice Growth (from 20250928080850)
```sql
DROP TABLE IF EXISTS client_acquisition CASCADE;
DROP TABLE IF EXISTS referral_tracking CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS lead_management CASCADE;
DROP TABLE IF EXISTS practice_metrics CASCADE;
DROP TABLE IF EXISTS growth_analytics CASCADE;
```

### 3. Strategic Finance (from 20250928080851)
```sql
DROP TABLE IF EXISTS trust_accounts CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;
DROP TABLE IF EXISTS financial_forecasts CASCADE;
DROP TABLE IF EXISTS budget_management CASCADE;
DROP TABLE IF EXISTS cash_flow_analysis CASCADE;
DROP TABLE IF EXISTS strategic_planning CASCADE;
DROP TABLE IF EXISTS practice_benchmarks CASCADE;
```

### 4. Workflow Integrations (from 20250930130517)
```sql
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS integration_logs CASCADE;
DROP TABLE IF EXISTS webhook_endpoints CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS integration_mappings CASCADE;
DROP TABLE IF EXISTS sync_status CASCADE;
DROP TABLE IF EXISTS external_connections CASCADE;
DROP TABLE IF EXISTS oauth_tokens CASCADE;
```

### 5. Advanced Compliance (from 20251005000000)
```sql
DROP TABLE IF EXISTS compliance_rules CASCADE;
DROP TABLE IF EXISTS compliance_violations CASCADE;
DROP TABLE IF EXISTS audit_trails CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS compliance_reports CASCADE;
DROP TABLE IF EXISTS regulatory_requirements CASCADE;
DROP TABLE IF EXISTS ethics_checks CASCADE;
DROP TABLE IF EXISTS conflict_checks CASCADE;
```

### 6. API Integrations (from 20251006000003)
```sql
DROP TABLE IF EXISTS api_integrations CASCADE;
DROP TABLE IF EXISTS api_credentials CASCADE;
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS integration_status CASCADE;
```

### 7. Academy/Learning (from 20251006030000)
```sql
DROP TABLE IF EXISTS academy_courses CASCADE;
DROP TABLE IF EXISTS academy_modules CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS cpd_points CASCADE;
```

### 8. Matter Templates (from 20251006000000)
```sql
DROP TABLE IF EXISTS matter_templates CASCADE;
DROP TABLE IF EXISTS template_categories CASCADE;
DROP TABLE IF EXISTS template_fields CASCADE;
```

### 9. Firm Branding (from 20251006000001)
```sql
DROP TABLE IF EXISTS firm_branding CASCADE;
DROP TABLE IF EXISTS custom_themes CASCADE;
DROP TABLE IF EXISTS logo_uploads CASCADE;
```

### 10. RBAC (from 20251006050000)
```sql
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permission_groups CASCADE;
```

### 11. Documents (if not used for core workflow)
```sql
-- Only if document upload isn't needed
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
```

---

## 📝 Cleanup Script

Create this file: `database/cleanup_non_core_tables.sql`

```sql
-- Database Cleanup - Remove Non-Core Tables
-- Run this to remove all tables not needed for core workflow

BEGIN;

-- Document Intelligence
DROP TABLE IF EXISTS document_analysis CASCADE;
DROP TABLE IF EXISTS document_extractions CASCADE;
DROP TABLE IF EXISTS document_classifications CASCADE;
DROP TABLE IF EXISTS ai_training_data CASCADE;
DROP TABLE IF EXISTS document_processing_queue CASCADE;
DROP TABLE IF EXISTS ocr_results CASCADE;

-- Practice Growth
DROP TABLE IF EXISTS client_acquisition CASCADE;
DROP TABLE IF EXISTS referral_tracking CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS lead_management CASCADE;
DROP TABLE IF EXISTS practice_metrics CASCADE;
DROP TABLE IF EXISTS growth_analytics CASCADE;

-- Strategic Finance
DROP TABLE IF EXISTS trust_accounts CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;
DROP TABLE IF EXISTS financial_forecasts CASCADE;
DROP TABLE IF EXISTS budget_management CASCADE;
DROP TABLE IF EXISTS cash_flow_analysis CASCADE;
DROP TABLE IF EXISTS strategic_planning CASCADE;
DROP TABLE IF EXISTS practice_benchmarks CASCADE;

-- Workflow Integrations
DROP TABLE IF EXISTS integration_configs CASCADE;
DROP TABLE IF EXISTS integration_logs CASCADE;
DROP TABLE IF EXISTS webhook_endpoints CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS integration_mappings CASCADE;
DROP TABLE IF EXISTS sync_status CASCADE;
DROP TABLE IF EXISTS external_connections CASCADE;
DROP TABLE IF EXISTS oauth_tokens CASCADE;

-- Advanced Compliance
DROP TABLE IF EXISTS compliance_rules CASCADE;
DROP TABLE IF EXISTS compliance_violations CASCADE;
DROP TABLE IF EXISTS audit_trails CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS compliance_reports CASCADE;
DROP TABLE IF EXISTS regulatory_requirements CASCADE;
DROP TABLE IF EXISTS ethics_checks CASCADE;
DROP TABLE IF EXISTS conflict_checks CASCADE;

-- API Integrations
DROP TABLE IF EXISTS api_integrations CASCADE;
DROP TABLE IF EXISTS api_credentials CASCADE;
DROP TABLE IF EXISTS integration_events CASCADE;
DROP TABLE IF EXISTS api_rate_limits CASCADE;
DROP TABLE IF EXISTS integration_status CASCADE;

-- Academy
DROP TABLE IF EXISTS academy_courses CASCADE;
DROP TABLE IF EXISTS academy_modules CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS learning_progress CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS cpd_points CASCADE;

-- Templates
DROP TABLE IF EXISTS matter_templates CASCADE;
DROP TABLE IF EXISTS template_categories CASCADE;
DROP TABLE IF EXISTS template_fields CASCADE;

-- Branding
DROP TABLE IF EXISTS firm_branding CASCADE;
DROP TABLE IF EXISTS custom_themes CASCADE;
DROP TABLE IF EXISTS logo_uploads CASCADE;

-- Complex RBAC
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permission_groups CASCADE;

COMMIT;

-- Verify remaining tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## ⚠️ Before Running

1. **Backup your database first!**
```bash
pg_dump -h your-host -U postgres your-db > backup.sql
```

2. **Test in development first**

3. **Review the list of tables to keep**

---

## 🚀 How to Run

```bash
# Connect to your Supabase database
psql -h your-supabase-host -U postgres -d your-database

# Run the cleanup script
\i database/cleanup_non_core_tables.sql
```

Or via Supabase dashboard:
1. Go to SQL Editor
2. Paste the cleanup script
3. Run it

---

## ✅ Result

After cleanup, you'll have only:
- matters
- pro_forma_requests
- invoices
- time_entries
- expenses
- services
- matter_services
- advocates
- payments
- user_preferences
- auth tables (Supabase managed)

**Clean, focused, ready to scale!** 🚀
