# Deployment Preparation: Pre-Launch Financial Features

## Date: January 27, 2025

## Overview
This document outlines the deployment preparation for the five pre-launch financial features. It includes database migration scripts, rollback plans, monitoring configuration, and feature flag setup.

---

## 1. Database Migration Scripts

### Migration Order
Execute migrations in the following order to ensure proper dependencies:

1. **Partial Payments System**
   - `supabase/migrations/20250127000001_partial_payments_system.sql`
   - Adds payment tracking columns to invoices
   - Creates payment calculation functions and triggers
   - Creates invoice_payment_history view

2. **Disbursements System**
   - Already deployed (Feature 2 complete)
   - Disbursements table with VAT calculations
   - WIP calculation updates

3. **Invoice Numbering & VAT Compliance**
   - Already deployed (Feature 3 complete)
   - Invoice settings and numbering audit tables
   - Sequential number generation functions

4. **Enhanced Dashboard**
   - No database migrations required
   - Uses existing tables with new queries

5. **Matter Search & Archiving**
   - `supabase/migrations/20250127000003_matter_search_system.sql`
   - Full-text search indexes
   - Archive columns and functions

### Pre-Deployment Checklist

- [ ] Backup production database
- [ ] Test all migrations on staging environment
- [ ] Verify migration rollback scripts work
- [ ] Check for migration conflicts with existing schema
- [ ] Ensure all RLS policies are in place
- [ ] Verify indexes are created for performance

### Migration Execution Command

```bash
# Run migrations
supabase db push

# Or manually apply specific migrations
psql $DATABASE_URL -f supabase/migrations/20250127000001_partial_payments_system.sql
psql $DATABASE_URL -f supabase/migrations/20250127000003_matter_search_system.sql
```

---

## 2. Rollback Plan

### Rollback Scripts

Create rollback scripts for each migration:

#### Rollback: Partial Payments System
```sql
-- File: supabase/migrations/rollback_20250127000001_partial_payments_system.sql

-- Drop trigger
DROP TRIGGER IF EXISTS payment_status_update ON payments;

-- Drop functions
DROP FUNCTION IF EXISTS update_invoice_payment_status();
DROP FUNCTION IF EXISTS determine_payment_status(UUID);
DROP FUNCTION IF EXISTS calculate_outstanding_balance(UUID);

-- Drop view
DROP VIEW IF EXISTS invoice_payment_history;

-- Remove columns from invoices
ALTER TABLE invoices 
DROP COLUMN IF EXISTS amount_paid,
DROP COLUMN IF EXISTS outstanding_balance,
DROP COLUMN IF EXISTS payment_status;

-- Remove columns from payments
ALTER TABLE payments
DROP COLUMN IF EXISTS payment_type,
DROP COLUMN IF EXISTS allocated_amount,
DROP COLUMN IF EXISTS payment_reference;

-- Drop indexes
DROP INDEX IF EXISTS idx_invoices_payment_status;
DROP INDEX IF EXISTS idx_invoices_outstanding_balance;
DROP INDEX IF EXISTS idx_payments_invoice_id;
DROP INDEX IF EXISTS idx_payments_payment_date;
```

#### Rollback: Matter Search System
```sql
-- File: supabase/migrations/rollback_20250127000003_matter_search_system.sql

-- Drop trigger
DROP TRIGGER IF EXISTS matter_search_vector_update ON matters;

-- Drop functions
DROP FUNCTION IF EXISTS update_matter_search_vector();
DROP FUNCTION IF EXISTS search_matters(UUID, TEXT, BOOLEAN, TEXT, TEXT[], DATE, DATE);

-- Drop indexes
DROP INDEX IF EXISTS idx_matters_search;
DROP INDEX IF EXISTS idx_matters_archived;

-- Remove columns from matters
ALTER TABLE matters
DROP COLUMN IF EXISTS search_vector,
DROP COLUMN IF EXISTS is_archived,
DROP COLUMN IF EXISTS archived_at,
DROP COLUMN IF EXISTS archived_by;
```

### Rollback Procedure

1. **Stop Application Traffic**
   - Enable maintenance mode
   - Redirect users to maintenance page

2. **Execute Rollback Scripts**
   ```bash
   psql $DATABASE_URL -f supabase/migrations/rollback_20250127000003_matter_search_system.sql
   psql $DATABASE_URL -f supabase/migrations/rollback_20250127000001_partial_payments_system.sql
   ```

3. **Deploy Previous Application Version**
   - Revert to last stable git tag
   - Deploy previous version

4. **Verify System Functionality**
   - Test critical user flows
   - Check database integrity

5. **Re-enable Application Traffic**
   - Disable maintenance mode
   - Monitor error logs

---

## 3. Monitoring and Alerts

### Application Performance Monitoring

#### Key Metrics to Monitor

1. **Payment Operations**
   - Payment recording success rate (target: >99%)
   - Payment calculation time (target: <100ms)
   - Payment history query time (target: <500ms)

2. **Report Generation**
   - Outstanding Fees Report generation time (target: <2s)
   - Revenue Report generation time (target: <2s)
   - Report export success rate (target: >99%)

3. **Dashboard Performance**
   - Dashboard load time (target: <2s)
   - Metrics calculation time (target: <1s)
   - Cache hit rate (target: >80%)

4. **Matter Search**
   - Search query response time (target: <1s)
   - Full-text search accuracy
   - Archive/unarchive success rate (target: >99%)

### Database Monitoring

#### Queries to Monitor

1. **Slow Query Detection**
   ```sql
   -- Monitor queries taking longer than 1 second
   SELECT 
     query,
     calls,
     total_time,
     mean_time,
     max_time
   FROM pg_stat_statements
   WHERE mean_time > 1000
   ORDER BY mean_time DESC
   LIMIT 20;
   ```

2. **Index Usage**
   ```sql
   -- Check if new indexes are being used
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read,
     idx_tup_fetch
   FROM pg_stat_user_indexes
   WHERE indexname IN (
     'idx_invoices_payment_status',
     'idx_invoices_outstanding_balance',
     'idx_payments_invoice_id',
     'idx_matters_search',
     'idx_matters_archived'
   );
   ```

3. **Table Growth**
   ```sql
   -- Monitor table sizes
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE tablename IN ('invoices', 'payments', 'disbursements', 'matters')
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

### Alert Configuration

#### Critical Alerts (Immediate Response)

- Payment recording failure rate > 5%
- Database connection pool exhausted
- Migration rollback required
- RLS policy violation detected

#### Warning Alerts (Monitor Closely)

- Dashboard load time > 3 seconds
- Report generation time > 5 seconds
- Search query time > 2 seconds
- Cache hit rate < 70%

#### Info Alerts (Track Trends)

- Daily payment volume
- Report generation frequency
- Search query patterns
- Archive/unarchive activity

### Monitoring Tools Setup

```javascript
// Example: Application monitoring with error tracking
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  }
});

// Track payment operations
Sentry.addBreadcrumb({
  category: 'payment',
  message: 'Payment recorded',
  level: 'info',
  data: {
    invoice_id: invoiceId,
    amount: amount
  }
});
```

---

## 4. Feature Flags for Gradual Rollout

### Feature Flag Configuration

Create feature flags to enable gradual rollout and quick rollback:

```typescript
// src/config/feature-flags.ts

export interface FeatureFlags {
  partialPayments: boolean;
  disbursements: boolean;
  invoiceNumbering: boolean;
  enhancedDashboard: boolean;
  matterSearch: boolean;
}

export const getFeatureFlags = async (): Promise<FeatureFlags> => {
  // Fetch from environment or feature flag service
  return {
    partialPayments: process.env.VITE_FEATURE_PARTIAL_PAYMENTS === 'true',
    disbursements: process.env.VITE_FEATURE_DISBURSEMENTS === 'true',
    invoiceNumbering: process.env.VITE_FEATURE_INVOICE_NUMBERING === 'true',
    enhancedDashboard: process.env.VITE_FEATURE_ENHANCED_DASHBOARD === 'true',
    matterSearch: process.env.VITE_FEATURE_MATTER_SEARCH === 'true',
  };
};

// Usage in components
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

const InvoiceDetailsModal = () => {
  const partialPaymentsEnabled = useFeatureFlag('partialPayments');
  
  return (
    <>
      {partialPaymentsEnabled && (
        <RecordPaymentModal />
      )}
    </>
  );
};
```

### Rollout Strategy

#### Phase 1: Internal Testing (Week 1)
- Enable all features for internal users only
- Monitor error rates and performance
- Gather feedback from team

**Feature Flags:**
```env
VITE_FEATURE_PARTIAL_PAYMENTS=true
VITE_FEATURE_DISBURSEMENTS=true
VITE_FEATURE_INVOICE_NUMBERING=true
VITE_FEATURE_ENHANCED_DASHBOARD=true
VITE_FEATURE_MATTER_SEARCH=true
VITE_INTERNAL_TESTING_MODE=true
```

#### Phase 2: Beta Users (Week 2)
- Enable for 10% of users
- Monitor metrics closely
- Collect user feedback

**Feature Flags:**
```env
VITE_FEATURE_PARTIAL_PAYMENTS=true
VITE_FEATURE_DISBURSEMENTS=true
VITE_FEATURE_INVOICE_NUMBERING=true
VITE_FEATURE_ENHANCED_DASHBOARD=true
VITE_FEATURE_MATTER_SEARCH=true
VITE_ROLLOUT_PERCENTAGE=10
```

#### Phase 3: Gradual Rollout (Weeks 3-4)
- Increase to 25%, then 50%, then 100%
- Monitor each increase for 2-3 days
- Be ready to rollback if issues arise

**Feature Flags:**
```env
# Week 3, Day 1-3
VITE_ROLLOUT_PERCENTAGE=25

# Week 3, Day 4-7
VITE_ROLLOUT_PERCENTAGE=50

# Week 4
VITE_ROLLOUT_PERCENTAGE=100
```

#### Phase 4: Full Deployment
- All features enabled for all users
- Remove feature flags from code
- Monitor for 1 week post-deployment

### Quick Rollback via Feature Flags

If issues are detected, disable features immediately:

```bash
# Disable specific feature
VITE_FEATURE_PARTIAL_PAYMENTS=false

# Or rollback to previous percentage
VITE_ROLLOUT_PERCENTAGE=25
```

---

## 5. Environment Variables

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_FEATURE_PARTIAL_PAYMENTS=true
VITE_FEATURE_DISBURSEMENTS=true
VITE_FEATURE_INVOICE_NUMBERING=true
VITE_FEATURE_ENHANCED_DASHBOARD=true
VITE_FEATURE_MATTER_SEARCH=true

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
VITE_ENABLE_ANALYTICS=true

# Rollout Control
VITE_ROLLOUT_PERCENTAGE=100
VITE_INTERNAL_TESTING_MODE=false
```

---

## 6. Deployment Steps

### Pre-Deployment

1. **Code Review**
   - [ ] All PRs reviewed and approved
   - [ ] Code merged to main branch
   - [ ] All tests passing

2. **Database Preparation**
   - [ ] Backup production database
   - [ ] Test migrations on staging
   - [ ] Prepare rollback scripts

3. **Documentation**
   - [ ] Update user guide
   - [ ] Update API documentation
   - [ ] Create release notes

### Deployment

1. **Enable Maintenance Mode**
   ```bash
   # Set maintenance mode
   cf set-env app MAINTENANCE_MODE true
   cf restage app
   ```

2. **Run Database Migrations**
   ```bash
   # Apply migrations
   supabase db push
   
   # Verify migrations
   supabase db diff
   ```

3. **Deploy Application**
   ```bash
   # Build application
   npm run build
   
   # Deploy to production
   npm run deploy:production
   ```

4. **Verify Deployment**
   - [ ] Check application health endpoint
   - [ ] Verify database connections
   - [ ] Test critical user flows
   - [ ] Check error logs

5. **Disable Maintenance Mode**
   ```bash
   cf set-env app MAINTENANCE_MODE false
   cf restage app
   ```

### Post-Deployment

1. **Monitor for 24 Hours**
   - Watch error rates
   - Monitor performance metrics
   - Check user feedback

2. **Gradual Feature Rollout**
   - Start with 10% of users
   - Increase gradually over 2 weeks
   - Monitor each phase

3. **Documentation Updates**
   - Update changelog
   - Notify users of new features
   - Provide training materials

---

## 7. Rollback Triggers

### Automatic Rollback Conditions

- Error rate > 10% for any feature
- Database migration failure
- Critical security vulnerability detected
- Payment processing failure rate > 5%

### Manual Rollback Conditions

- User complaints > 20% of active users
- Performance degradation > 50%
- Data integrity issues detected
- Compliance violation identified

### Rollback Procedure

1. **Immediate Actions**
   - Disable feature flags
   - Enable maintenance mode
   - Alert team

2. **Execute Rollback**
   - Run rollback scripts
   - Deploy previous version
   - Verify system stability

3. **Post-Rollback**
   - Analyze root cause
   - Fix issues
   - Plan re-deployment

---

## 8. Success Criteria

### Technical Metrics

- [ ] All migrations applied successfully
- [ ] Zero data loss during deployment
- [ ] Application uptime > 99.9%
- [ ] Error rate < 1%
- [ ] Performance targets met

### Business Metrics

- [ ] Payment recording success rate > 99%
- [ ] Report generation time < 2 seconds
- [ ] Dashboard load time < 2 seconds
- [ ] Search response time < 1 second
- [ ] User satisfaction > 90%

### Compliance Metrics

- [ ] SARS-compliant invoice numbering
- [ ] VAT calculations accurate
- [ ] Audit trail complete
- [ ] RLS policies enforced

---

## 9. Support Plan

### Support Team Preparation

1. **Training**
   - Train support team on new features
   - Provide troubleshooting guides
   - Create FAQ document

2. **Escalation Path**
   - Level 1: Support team (user questions)
   - Level 2: Development team (technical issues)
   - Level 3: Database admin (data issues)

3. **Communication Channels**
   - User support email
   - In-app chat support
   - Emergency hotline

### Known Issues and Workarounds

Document any known issues and their workarounds:

1. **Issue**: Payment modal slow on large invoices
   - **Workaround**: Refresh page before recording payment
   - **Fix**: Scheduled for next release

2. **Issue**: Search results may be delayed for archived matters
   - **Workaround**: Use advanced filters
   - **Fix**: Index optimization in progress

---

## 10. Checklist Summary

### Pre-Deployment
- [ ] Code reviewed and merged
- [ ] Database backed up
- [ ] Migrations tested on staging
- [ ] Rollback scripts prepared
- [ ] Feature flags configured
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Support team trained

### Deployment
- [ ] Maintenance mode enabled
- [ ] Migrations executed
- [ ] Application deployed
- [ ] Health checks passed
- [ ] Maintenance mode disabled

### Post-Deployment
- [ ] Monitoring active
- [ ] Error rates normal
- [ ] Performance metrics met
- [ ] User feedback positive
- [ ] Gradual rollout proceeding

### Rollback Ready
- [ ] Rollback scripts tested
- [ ] Previous version available
- [ ] Rollback procedure documented
- [ ] Team trained on rollback

---

## Contact Information

### Deployment Team
- **Lead Developer**: [Name]
- **Database Admin**: [Name]
- **DevOps Engineer**: [Name]

### Emergency Contacts
- **On-Call Developer**: [Phone]
- **Database Emergency**: [Phone]
- **Management**: [Phone]

---

## Appendix

### A. Migration Scripts Location
- `supabase/migrations/20250127000001_partial_payments_system.sql`
- `supabase/migrations/20250127000003_matter_search_system.sql`

### B. Rollback Scripts Location
- `supabase/migrations/rollback_20250127000001_partial_payments_system.sql`
- `supabase/migrations/rollback_20250127000003_matter_search_system.sql`

### C. Feature Flag Configuration
- `src/config/feature-flags.ts`
- `.env.production`

### D. Monitoring Dashboards
- Application Performance: [URL]
- Database Metrics: [URL]
- Error Tracking: [URL]

---

**Document Version**: 1.0  
**Last Updated**: January 27, 2025  
**Next Review**: Before deployment
