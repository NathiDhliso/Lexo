# Migration Files Analysis & Cleanup Plan

## Current State Analysis (2025-10-10)

### Remote Database Schema (from 20251007074419_remote_commit.sql)
The remote database contains:
- **Core Tables**: advocates, matters, invoices, time_entries, expenses, payments, proforma_requests, user_preferences
- **Missing Tables**: engagement_agreements, retainer_agreements, trust_transactions, partner_approvals
- **Missing Columns**: public_token fields, link tracking fields, billing_status

### Critical Issues Identified

#### 1. **Nuclear Wipe Migration (20251007051658_nuclear_wipe.sql)**
- **Status**: DANGEROUS - Drops entire public schema
- **Action**: Should be REMOVED or archived
- **Reason**: This destroys all data and should never run in production

#### 2. **Duplicate Migrations**
The following migrations appear to be duplicates or redundant:

**Services Tables (Duplicate)**
- `20250107000004_add_services_tables.sql` 
- `20251007200000_fix_services_tables_grants.sql` (just fixes grants)
- **Action**: Keep only the first one

**RLS Policy Fixes (Multiple)**
- `20250107000002_fix_proforma_requests_rls.sql`
- `20251007080000_fix_rls_policies_again.sql`
- `20251007090000_comprehensive_rls_fix.sql`
- `20251009000000_fix_all_rls_permissions.sql`
- **Action**: Consolidate into ONE comprehensive RLS migration

**Rate Cards (Duplicate)**
- `20250107000005_add_rate_cards_tables.sql`
- `20251007194200_fix_rate_cards_rls.sql`
- **Action**: Merge RLS fixes into the main rate cards migration

#### 3. **Missing from Remote Database**
These tables are used in codebase but NOT in remote schema:
- `engagement_agreements` (20250111000000)
- `retainer_agreements` + `trust_transactions` (20250111000004)
- `partner_approvals` (20251010)
- `public_token` columns (20251010)

#### 4. **Chronological Issues**
- Migrations dated 2025-01-XX but then jump to 2025-10-XX
- This suggests the January migrations were never applied to remote
- The 20251007074419_remote_commit.sql represents the ACTUAL remote state

## Recommended Actions

### Phase 1: Remove Dangerous/Obsolete Files
Delete these files:
1. `20251007051658_nuclear_wipe.sql` - DANGEROUS
2. `20251007074419_remote_commit.sql` - This is a snapshot, not a migration

### Phase 2: Consolidate Duplicate Migrations
Create new consolidated migrations:

**A. Consolidated RLS Policies** (replaces 4 separate RLS fixes)
- Merge all RLS policy fixes into one comprehensive file
- File: `20251011000000_consolidated_rls_policies.sql`

**B. Consolidated Services & Rate Cards** (replaces separate files)
- Merge services tables + grants
- Merge rate cards + RLS
- File: `20251011000001_consolidated_services_rate_cards.sql`

### Phase 3: Apply Missing Migrations to Remote
These need to be applied to remote database:
1. `20250111000000_add_engagement_agreements.sql` ✓ (needed)
2. `20250111000001_add_scope_amendments.sql` ✓ (needed)
3. `20250111000002_add_payment_disputes.sql` ✓ (needed)
4. `20250111000003_extend_existing_tables.sql` ✓ (needed)
5. `20250111000004_add_retainer_system.sql` ✓ (needed)
6. `20250111000005_add_attorney_portal.sql` ✓ (needed)
7. `20251010_add_partner_approvals.sql` ✓ (needed)
8. `20251010_add_public_tokens.sql` ✓ (needed)

### Phase 4: Clean Migration Directory
Final structure should be:
```
migrations/
├── 20250101000000_fresh_core_schema.sql (base schema)
├── 20250101000001_create_advocate_on_signup.sql
├── 20250107000001_fix_advocates_insert_policy.sql
├── 20250107000003_fix_database_issues.sql
├── 20250107000005_add_document_uploads.sql
├── 20250108000001_make_attorney_fields_nullable.sql
├── 20250108000002_fix_sequence_permissions.sql
├── 20250108000003_add_token_column.sql
├── 20250109000000_create_pdf_templates.sql
├── 20250109000001_fix_matter_services_rls.sql
├── 20250109000002_fix_pdf_templates_permissions.sql
├── 20250110000000_add_invoice_tracking_columns.sql
├── 20250111000000_add_engagement_agreements.sql
├── 20250111000001_add_scope_amendments.sql
├── 20250111000002_add_payment_disputes.sql
├── 20250111000003_extend_existing_tables.sql
├── 20250111000004_add_retainer_system.sql
├── 20250111000005_add_attorney_portal.sql
├── 20251007100000_add_matters_delete_policy.sql
├── 20251009000001_add_invoices_bar_reminders.sql
├── 20251010_add_partner_approvals.sql
├── 20251010_add_public_tokens.sql
├── 20251011000000_consolidated_rls_policies.sql (NEW)
└── 20251011000001_consolidated_services_rate_cards.sql (NEW)
```

## Files to DELETE
1. `20251007051658_nuclear_wipe.sql` ⚠️ DANGEROUS
2. `20251007074419_remote_commit.sql` (snapshot, not migration)
3. `20251007080000_fix_rls_policies_again.sql` (consolidated)
4. `20251007090000_comprehensive_rls_fix.sql` (consolidated)
5. `20251007194200_fix_rate_cards_rls.sql` (consolidated)
6. `20251007200000_fix_services_tables_grants.sql` (consolidated)
7. `20251009000000_fix_all_rls_permissions.sql` (consolidated)
8. `20250107000002_fix_proforma_requests_rls.sql` (consolidated)
9. `20250107000004_add_services_tables.sql` (consolidated)
10. `20250107000005_add_rate_cards_tables.sql` (consolidated)

## Summary
- **Current Files**: 32 migrations
- **Files to Delete**: 10
- **New Consolidated Files**: 2
- **Final Count**: 24 migrations (cleaner, no duplicates)
- **Remote Database Status**: Missing 8 critical tables/features

## ✅ CLEANUP COMPLETED

### Actions Taken
1. ✅ Deleted 10 obsolete/duplicate migration files
2. ✅ Created 2 consolidated migration files
3. ✅ Created `apply-missing-migrations.sql` script for remote database sync

### Final Migration Count
- **Before**: 32 migrations (with duplicates and dangerous files)
- **After**: 24 migrations (clean, no duplicates)

### Files Deleted
1. ✅ `20251007051658_nuclear_wipe.sql` - DANGEROUS (drops entire schema)
2. ✅ `20251007074419_remote_commit.sql` - Snapshot, not a migration
3. ✅ `20251007080000_fix_rls_policies_again.sql` - Consolidated
4. ✅ `20251007090000_comprehensive_rls_fix.sql` - Consolidated
5. ✅ `20251007194200_fix_rate_cards_rls.sql` - Consolidated
6. ✅ `20251007200000_fix_services_tables_grants.sql` - Consolidated
7. ✅ `20251009000000_fix_all_rls_permissions.sql` - Consolidated
8. ✅ `20250107000002_fix_proforma_requests_rls.sql` - Consolidated
9. ✅ `20250107000004_add_services_tables.sql` - Consolidated
10. ✅ `20250107000005_add_rate_cards_tables.sql` - Consolidated

### New Consolidated Files
1. ✅ `20251011000000_consolidated_rls_policies.sql` - All RLS policies in one place
2. ✅ `20251011000001_consolidated_services_rate_cards.sql` - Services & rate cards with RLS

### Next Steps
1. **Apply to Remote Database**: Run `apply-missing-migrations.sql` on your remote database
2. **Test Locally**: Ensure all features work with the new consolidated migrations
3. **Verify Remote Sync**: Check that remote database has all required tables and columns

### How to Apply Missing Migrations
```bash
# Option 1: Using psql
psql -h your-db-host -U postgres -d your-database -f apply-missing-migrations.sql

# Option 2: Using Supabase CLI (if configured)
supabase db push

# Option 3: Copy-paste into Supabase SQL Editor
# Open the apply-missing-migrations.sql file and run it in your Supabase dashboard
```
