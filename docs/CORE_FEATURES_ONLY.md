# Core Features Only - Streamlined LexoHub

**Date:** 2025-10-06  
**Purpose:** Focus exclusively on Matters → Pro Forma → Invoices workflow  
**Status:** Pre-AWS Migration Cleanup

---

## 🎯 Core Features (KEEP)

### 1. Matters Management
**Purpose:** Create and manage legal matters

**Keep:**
- ✅ `src/pages/MattersPage.tsx`
- ✅ `src/components/matters/NewMatterModal.tsx`
- ✅ `src/components/matters/NewMatterMultiStep.tsx`
- ✅ `src/components/matters/ProFormaLinkModal.tsx`
- ✅ `src/services/api/matters.service.ts` (if exists)
- ✅ Matter CRUD operations
- ✅ Client information
- ✅ Attorney information
- ✅ Matter status tracking
- ✅ Time entries (for billing)
- ✅ Expenses (for billing)

---

### 2. Pro Forma Management
**Purpose:** Generate and manage pro forma invoices

**Keep:**
- ✅ `src/pages/ProFormaPage.tsx`
- ✅ `src/components/proforma/ProFormaCreationModal.tsx`
- ✅ `src/components/proforma/PendingProFormaRequests.tsx`
- ✅ `src/components/proforma/ProFormaLinkModal.tsx`
- ✅ `src/services/api/proforma.service.ts`
- ✅ Pro forma generation
- ✅ Pro forma acceptance workflow
- ✅ Pro forma to invoice conversion
- ✅ Attorney request forms

---

### 3. Invoice Management
**Purpose:** Create, send, and track invoices

**Keep:**
- ✅ `src/pages/InvoicesPage.tsx`
- ✅ `src/components/invoices/InvoiceList.tsx`
- ✅ `src/components/invoices/InvoiceGenerationModal.tsx`
- ✅ `src/components/invoices/PaymentTrackingDashboard.tsx`
- ✅ `src/components/invoices/PaymentModal.tsx`
- ✅ `src/services/api/invoices.service.ts`
- ✅ Invoice generation
- ✅ Payment tracking
- ✅ Invoice status updates
- ✅ PDF generation

---

### 4. Workflow Navigation (Our New Features)
**Purpose:** Navigate between core features

**Keep:**
- ✅ `src/components/workflow/WorkflowPipeline.tsx`
- ✅ `src/components/workflow/NextActionsPanel.tsx`
- ✅ `src/components/workflow/WorkflowTemplateSelector.tsx`
- ✅ `src/hooks/useWorkflowCounts.ts`
- ✅ `src/services/workflow-automation.service.ts`

---

### 5. Common Components (Our New Features)
**Purpose:** Reusable UI components

**Keep:**
- ✅ `src/components/common/ConfirmDialog.tsx`
- ✅ `src/components/common/MultiStepForm.tsx`
- ✅ `src/components/common/StepIndicator.tsx`
- ✅ `src/components/common/InlineEdit.tsx`
- ✅ `src/components/common/DocumentCard.tsx`
- ✅ `src/components/common/StatusPipeline.tsx`
- ✅ `src/components/common/DocumentRelationship.tsx`

---

### 6. Document Processing (KEEP - Helps Workflow)
**Purpose:** Process uploaded documents

**Keep:**
- ✅ `src/components/matters/DocumentProcessingModal.tsx`
- ✅ Document upload functionality
- ✅ AI/OCR extraction (if integrated with AWS)
- ✅ Document storage (S3)

---

### 7. Templates (KEEP - Basic Only)
**Purpose:** Invoice and pro forma templates

**Keep:**
- ✅ Basic invoice templates
- ✅ Basic pro forma templates
- ✅ PDF generation templates
- ✅ Email templates for invoices

**Remove:**
- ❌ Advanced template builder
- ❌ Template marketplace
- ❌ Template sharing features

---

### 8. Authentication & Core Infrastructure
**Purpose:** Essential app functionality

**Keep:**
- ✅ `src/contexts/AuthContext.tsx`
- ✅ `src/lib/supabase.ts`
- ✅ `src/services/api/` (core services only)
- ✅ `src/design-system/` (UI components)
- ✅ Basic user profile
- ✅ Basic permissions (advocate/attorney)

---

### 9. Dashboard (Simplified)
**Purpose:** Overview of core workflow

**Keep:**
- ✅ `src/pages/DashboardPage.tsx` (simplified version)
- ✅ Matter count
- ✅ Pro forma count
- ✅ Invoice count
- ✅ Payment status
- ✅ Recent activity

**Remove from Dashboard:**
- ❌ Practice health metrics
- ❌ Advanced analytics
- ❌ Compliance dashboards
- ❌ Strategic finance widgets

---

## 🗑️ Features to REMOVE

### 1. Academy/Learning Features ❌
**Remove:**
- ❌ `src/pages/AcademyPage.tsx`
- ❌ `src/components/academy/` (entire folder)
- ❌ Learning modules
- ❌ Courses
- ❌ Certifications
- ❌ Knowledge base (beyond basic help)

---

### 2. Advanced Analytics & Reports ❌
**Remove:**
- ❌ `src/pages/ReportsPage.tsx` (keep basic invoice reports only)
- ❌ `src/components/reports/` (advanced reports)
- ❌ `src/services/analytics.service.ts` (keep basic metrics only)
- ❌ Practice health dashboards
- ❌ Performance metrics
- ❌ Business intelligence features
- ❌ Advanced charts/graphs (keep basic ones)

---

### 3. Strategic Finance & Compliance ❌
**Remove:**
- ❌ `src/components/strategic-finance/` (entire folder)
- ❌ `src/services/compliance.service.ts`
- ❌ Compliance monitoring
- ❌ Trust account management
- ❌ Financial forecasting
- ❌ Budget management

---

### 4. Advanced Search & Discovery ❌
**Remove:**
- ❌ Global search (keep basic search in each page)
- ❌ `src/hooks/useFuzzySearch.ts` (if too complex)
- ❌ Advanced filters (keep basic filters)
- ❌ Saved searches
- ❌ Search history

---

### 5. Collaboration Features ❌
**Remove:**
- ❌ Team collaboration tools
- ❌ Comments/notes (unless on matters)
- ❌ Activity feeds
- ❌ Notifications center (keep basic email notifications)
- ❌ Real-time collaboration

---

### 6. Advanced RBAC ❌
**Remove:**
- ❌ `src/types/rbac.ts` (keep basic permissions only)
- ❌ `src/hooks/useRBAC.ts` (simplify to basic checks)
- ❌ Complex permission matrix
- ❌ Role management UI
- ❌ Custom roles

**Keep:**
- ✅ Basic advocate/attorney distinction
- ✅ Basic permission checks

---

### 7. Advanced Settings ❌
**Remove:**
- ❌ Complex settings pages
- ❌ Customization options
- ❌ Theme builder
- ❌ Advanced preferences
- ❌ Integration settings (beyond basic)

**Keep:**
- ✅ Basic user profile
- ✅ Email preferences
- ✅ Password change

---

### 8. Miscellaneous Features ❌
**Remove:**
- ❌ Calendar/scheduling
- ❌ Task management
- ❌ Client portal (unless needed for pro forma)
- ❌ Time tracking UI (keep API for billing)
- ❌ Expense tracking UI (keep API for billing)
- ❌ Document management system (beyond basic upload)
- ❌ Email client integration
- ❌ Mobile app specific features

---

## 📁 Files to DELETE

### Pages to Remove
```
src/pages/
├── AcademyPage.tsx ❌
├── ReportsPage.tsx ❌ (or simplify heavily)
├── SettingsPage.tsx ❌ (or simplify heavily)
├── CalendarPage.tsx ❌
├── TasksPage.tsx ❌
└── Any other non-core pages ❌
```

### Component Folders to Remove
```
src/components/
├── academy/ ❌ (entire folder)
├── strategic-finance/ ❌ (entire folder)
├── reports/ ❌ (keep basic invoice reports)
├── collaboration/ ❌ (if exists)
├── calendar/ ❌ (if exists)
├── tasks/ ❌ (if exists)
└── settings/ ❌ (keep basic profile only)
```

### Services to Remove
```
src/services/
├── compliance.service.ts ❌
├── analytics.service.ts ❌ (keep basic metrics)
├── calendar.service.ts ❌
├── tasks.service.ts ❌
├── collaboration.service.ts ❌
└── advanced-search.service.ts ❌
```

### Hooks to Remove
```
src/hooks/
├── useRBAC.ts ❌ (simplify to basic checks)
├── useFuzzySearch.ts ❌ (if too complex)
├── useCalendar.ts ❌
├── useTasks.ts ❌
└── Any non-core hooks ❌
```

---

## 🔄 Database Tables (Keep Core Only)

### Keep These Tables
```sql
✅ matters
✅ pro_forma_requests
✅ invoices
✅ time_entries (for billing)
✅ expenses (for billing)
✅ users
✅ advocates
✅ services (legal services)
✅ matter_services (linking)
```

### Remove or Archive These Tables
```sql
❌ academy_courses
❌ academy_modules
❌ certifications
❌ compliance_logs
❌ trust_accounts
❌ tasks
❌ calendar_events
❌ notifications (keep basic email queue)
❌ activity_logs (keep basic audit only)
```

---

## 🎨 Navigation Simplification

### Current Navigation (Too Complex)
```
- Dashboard
- Matters
- Pro Forma
- Invoices
- Reports
- Academy
- Settings
- Calendar
- Tasks
```

### New Navigation (Streamlined)
```
- Dashboard (simplified)
- Matters
- Pro Forma
- Invoices
- Profile (basic settings)
```

---

## 📊 Simplified Dashboard

### Keep on Dashboard
- ✅ Total matters (active)
- ✅ Pending pro formas
- ✅ Draft invoices
- ✅ Unpaid invoices
- ✅ Recent activity (last 5 items)
- ✅ Quick actions (create matter, pro forma, invoice)
- ✅ Workflow pipeline

### Remove from Dashboard
- ❌ Practice health score
- ❌ Compliance status
- ❌ Advanced analytics
- ❌ Performance metrics
- ❌ Financial forecasting
- ❌ Complex charts

---

## 🚀 Benefits of Streamlining

### Before Cleanup
- 50+ components
- 20+ pages
- Complex navigation
- Multiple workflows
- Hard to maintain

### After Cleanup
- ~25 core components
- 5 main pages
- Simple navigation
- One focused workflow
- Easy to maintain and scale

### AWS Migration Benefits
- ✅ Smaller codebase = faster deployment
- ✅ Fewer services to migrate
- ✅ Lower AWS costs
- ✅ Easier to optimize
- ✅ Faster load times
- ✅ Better performance

---

## 📝 Migration Steps

### Phase 1: Documentation (Complete)
- [x] Create this document
- [ ] Update end-to-end workflow doc
- [ ] Create backup of current codebase

### Phase 2: Remove Files (Next)
1. Delete academy components
2. Delete strategic finance components
3. Delete advanced analytics
4. Remove complex RBAC
5. Simplify dashboard
6. Clean up navigation

### Phase 3: Database Cleanup
1. Archive unused tables
2. Remove unused columns
3. Simplify relationships
4. Update migrations

### Phase 4: Testing
1. Test core workflow
2. Verify no broken imports
3. Check all pages load
4. Test matter → proforma → invoice flow

### Phase 5: AWS Migration
1. Deploy streamlined app
2. Set up AWS services
3. Migrate data
4. Go live

---

## 🎯 Success Criteria

### Must Work After Cleanup
- ✅ Create matter
- ✅ Generate pro forma from matter
- ✅ Attorney can submit pro forma request
- ✅ Convert pro forma to invoice
- ✅ Send invoice
- ✅ Track payment
- ✅ View workflow pipeline
- ✅ Smart action suggestions
- ✅ Document upload/processing

### Can Be Broken (Will Remove)
- ❌ Academy features
- ❌ Advanced reports
- ❌ Compliance dashboards
- ❌ Calendar
- ❌ Tasks
- ❌ Advanced search

---

## 📋 Checklist

### Before Starting
- [ ] Backup entire codebase
- [ ] Create git branch: `feature/streamline-core-features`
- [ ] Document current state
- [ ] Get user approval

### During Cleanup
- [ ] Remove academy folder
- [ ] Remove strategic-finance folder
- [ ] Simplify dashboard
- [ ] Update navigation
- [ ] Remove unused services
- [ ] Clean up database
- [ ] Update documentation

### After Cleanup
- [ ] Run type check
- [ ] Test core workflow
- [ ] Update README
- [ ] Deploy to staging
- [ ] Get user approval
- [ ] Merge to main

---

## 🔮 Future Features (Document Only)

These features can be added back later:

### Phase 2 (Post-AWS Migration)
- Advanced analytics
- Detailed reports
- Enhanced search
- Email integration

### Phase 3 (Future)
- Academy/learning
- Compliance tools
- Strategic finance
- Advanced RBAC
- Collaboration tools
- Mobile app

---

**Status:** Ready to begin cleanup  
**Next Step:** Create backup and start removing files  
**Estimated Time:** 2-3 hours  
**Risk Level:** Low (we have backups and git)

---

**Ready to proceed with file deletion?** 🚀
