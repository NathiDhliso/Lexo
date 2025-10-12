# Technical Debt Remediation Plan

## Overview
This document tracks technical debt items identified during the comprehensive code review and provides a prioritized remediation plan.

---

## 🔴 Critical Priority (Security & Stability)

### 1. AWS Credentials Security
**Issue**: Hardcoded AWS credentials in `.env` file  
**Risk**: Credentials exposed in version control, potential security breach  
**Status**: ⚠️ IMMEDIATE ACTION REQUIRED  

**Remediation Steps**:
1. Remove `.env` from version control (already in `.gitignore`)
2. Rotate all exposed AWS credentials immediately
3. Implement AWS IAM roles for production environment
4. Use AWS Secrets Manager or environment-specific secret management
5. Update deployment documentation

**Timeline**: 1-2 days  
**Owner**: DevOps/Security Team

---

### 2. Test Coverage - E2E Tests
**Issue**: Only 48% of E2E tests passing (30/62), 52% skipped  
**Risk**: High probability of regressions, unstable application  
**Status**: 🔄 IN PROGRESS  

**Remediation Steps**:
1. **Phase 1** (Week 1-2): Implement skipped tests for core workflow
   - Pro Forma tests (4 skipped)
   - Engagement Agreement tests (4 skipped)
   - Matter Management tests (2 skipped)
   
2. **Phase 2** (Week 3-4): Implement skipped tests for supporting features
   - Retainer & Trust tests (7 skipped)
   - WIP & Scope Amendment tests (5 skipped)
   - Partner Approval tests (6 skipped)
   
3. **Phase 3** (Week 5-6): Implement remaining skipped tests
   - Payment Tracking tests (2 skipped)
   - Invoice Generation tests (2 skipped)

**Timeline**: 6 weeks  
**Owner**: QA/Development Team

**Test Implementation Checklist**:
- [ ] tests/02-proforma.spec.ts - 4 skipped tests
- [ ] tests/03-engagement-agreements.spec.ts - 4 skipped tests
- [ ] tests/04-matter-management.spec.ts - 2 skipped tests
- [ ] tests/05-retainer-trust.spec.ts - 7 skipped tests
- [ ] tests/07-wip-scope-amendments.spec.ts - 5 skipped tests
- [ ] tests/08-partner-approval-billing.spec.ts - 6 skipped tests
- [ ] tests/09-invoice-generation.spec.ts - 2 skipped tests
- [ ] tests/10-payment-tracking.spec.ts - 2 skipped tests

---

### 3. Unit Test Coverage
**Issue**: Minimal unit test coverage  
**Risk**: Business logic not validated, difficult to refactor  
**Status**: 📋 PLANNED  

**Remediation Steps**:
1. Establish unit test coverage baseline (target: 70% for services)
2. Implement unit tests for all service layer files (23+ services)
3. Implement unit tests for utility functions
4. Add unit tests for complex components

**Priority Services for Unit Testing**:
- [ ] src/services/api/matter-api.service.ts (478 lines)
- [ ] src/services/api/engagement-agreement.service.ts (347 lines)
- [ ] src/services/api/billing-readiness.service.ts (358 lines)
- [ ] src/services/api/credit-note.service.ts (335 lines)
- [ ] src/services/api/partner-approval.service.ts (281 lines)
- [ ] src/services/invoice-pdf.service.ts (621 lines)
- [ ] src/services/aws-email.service.ts (610 lines)
- [ ] src/services/aws-document-processing.service.ts (442 lines)
- [ ] src/utils/PricingCalculator.ts
- [ ] src/utils/validation.ts

**Timeline**: 8 weeks  
**Owner**: Development Team

---

## 🟡 High Priority (Maintainability)

### 4. Component Refactoring - Large Files
**Issue**: Components exceed maintainability thresholds  
**Risk**: Difficult to debug, test, and maintain  
**Status**: 📋 PLANNED  

**Files Requiring Refactoring**:

#### 4.1 PDFTemplateEditor.tsx (2,100+ lines)
**Target**: Break into 8-10 smaller components  

**Proposed Structure**:
```
src/components/settings/pdf-template/
├── PDFTemplateEditor.tsx (main orchestrator, ~200 lines)
├── ColorSchemeSelector.tsx (~150 lines)
├── LayoutPresetSelector.tsx (~200 lines)
├── LogoUploadSection.tsx (~150 lines)
├── TitleStyleSection.tsx (~150 lines)
├── TableStyleSection.tsx (~200 lines)
├── FooterCustomization.tsx (~200 lines)
├── AdvancedLayoutControls.tsx (~250 lines)
├── LivePreviewPanel.tsx (~300 lines)
└── types.ts (shared types)
```

**Timeline**: 2 weeks  
**Owner**: Frontend Team

#### 4.2 App.tsx (1,000+ lines)
**Target**: Extract routing and layout logic  

**Proposed Structure**:
```
src/
├── App.tsx (main entry, ~100 lines)
├── AppRouter.tsx (already exists, enhance)
├── layouts/
│   ├── MainLayout.tsx (~150 lines)
│   ├── PublicLayout.tsx (~100 lines)
│   └── AttorneyLayout.tsx (~100 lines)
└── routes/
    ├── ProtectedRoutes.tsx
    ├── PublicRoutes.tsx
    └── AttorneyRoutes.tsx
```

**Timeline**: 1 week  
**Owner**: Frontend Team

---

### 5. Database RLS Policy Consolidation
**Issue**: 40 migrations with numerous RLS permission fixes  
**Risk**: Brittle security model, difficult to maintain  
**Status**: 📋 PLANNED  

**Remediation Steps**:
1. **Audit Phase** (Week 1-2):
   - Document all existing RLS policies
   - Identify redundant or conflicting policies
   - Map policy dependencies

2. **Consolidation Phase** (Week 3-4):
   - Create consolidated RLS policy migration
   - Simplify policy logic where possible
   - Standardize policy naming conventions

3. **Testing Phase** (Week 5):
   - Test all CRUD operations
   - Verify security boundaries
   - Performance testing

4. **Documentation Phase** (Week 6):
   - Document RLS policy architecture
   - Create troubleshooting guide
   - Update developer onboarding docs

**Timeline**: 6 weeks  
**Owner**: Backend/Database Team

**Migration Files to Review**:
- 20250107000001_fix_advocates_insert_policy.sql
- 20250107000003_fix_database_issues.sql
- 20250108000002_fix_sequence_permissions.sql
- 20250109000001_fix_matter_services_rls.sql
- 20250109000002_fix_pdf_templates_permissions.sql
- 20250111000020_fix_user_profiles_rls.sql
- 20250111000030_fix_auth_trigger.sql
- 20250111000041_fix_cloud_storage_constraint.sql
- 20250112000000_fix_scope_amendments_permissions.sql
- 20250112000001_fix_schema_issues.sql
- 20251007100000_add_matters_delete_policy.sql
- 20251011000000_consolidated_rls_policies.sql

---

## 🟢 Medium Priority (Code Quality)

### 6. ESLint Rule Enforcement
**Issue**: Many rules set to 'warn' instead of 'error'  
**Risk**: Technical debt accumulation  
**Status**: ✅ COMPLETED  

**Actions Taken**:
- Updated eslint.config.js to enforce strict rules
- Changed all quality rules from 'warn' to 'error'
- Added additional quality rules (no-console, no-debugger, no-alert)

**Next Steps**:
1. Fix all existing linting errors in codebase
2. Add pre-commit hooks to enforce linting
3. Add linting to CI/CD pipeline

**Timeline**: 1 week  
**Owner**: Development Team

---

### 7. File Organization Cleanup
**Issue**: Redundant and misplaced files  
**Status**: ✅ COMPLETED  

**Actions Taken**:
- ✅ Removed test-aws-credentials.html (security risk)
- ✅ Consolidated S3 CORS configs (removed s3-cors.json)
- ✅ Moved sample PDF from src/ to tests/fixtures/samples/

---

## 📊 Progress Tracking

### Overall Status
- **Critical Priority**: 1/3 completed (33%)
- **High Priority**: 0/2 completed (0%)
- **Medium Priority**: 2/2 completed (100%)

### Timeline Summary
- **Immediate** (1-2 days): AWS credential rotation
- **Short-term** (1-2 weeks): Component refactoring, linting fixes
- **Medium-term** (6-8 weeks): Test coverage, RLS consolidation
- **Long-term** (3-6 months): Complete technical debt elimination

---

## 📝 Development Policies (New)

### 1. Test Coverage Policy
- All new services must have ≥80% unit test coverage
- All new features must have E2E test coverage
- No PR merges without passing tests

### 2. Component Size Policy
- Components should not exceed 300 lines
- Files exceeding 500 lines require refactoring plan
- Extract reusable logic into hooks or utilities

### 3. Code Quality Policy
- All ESLint errors must be fixed before PR merge
- No console.log statements in production code
- TypeScript strict mode must be enabled

### 4. Database Migration Policy
- All migrations must include rollback scripts
- RLS policies must be documented
- Performance impact must be assessed

---

## 🔄 Review Schedule

- **Weekly**: Review progress on critical items
- **Bi-weekly**: Update technical debt backlog
- **Monthly**: Report to stakeholders on debt reduction
- **Quarterly**: Comprehensive technical debt audit

---

## 📚 Resources

### Documentation
- [Testing Strategy](./docs/TESTING_STRATEGY.md) - To be created
- [Component Guidelines](./docs/COMPONENT_GUIDELINES.md) - To be created
- [Database Security](./docs/DATABASE_SECURITY.md) - To be created

### Tools
- ESLint: Code quality enforcement
- Playwright: E2E testing
- Vitest: Unit testing
- SonarQube: Code quality metrics (recommended)

---

**Last Updated**: 2025-01-12  
**Next Review**: 2025-01-19
