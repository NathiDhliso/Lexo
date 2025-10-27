# UX Consolidation Tasks

## Phase 1: Modal Consolidation (Weeks 1-3)

### Task 1.1: Create MatterModal (Week 1)
**Priority:** HIGH | **Effort:** 3 days

- [ ] Create `src/components/modals/matter/MatterModal.tsx`
- [ ] Create form components:
  - [ ] `CreateMatterForm.tsx`
  - [ ] `EditMatterForm.tsx`
  - [ ] `QuickAddMatterForm.tsx`
  - [ ] `AcceptBriefForm.tsx`
- [ ] Create view components:
  - [ ] `MatterDetailView.tsx`
  - [ ] `ViewMatterDetails.tsx`
- [ ] Create `useMatterModal.ts` hook
- [ ] Add unit tests for all modes
- [ ] Add Storybook stories
- [ ] Create deprecation wrappers for old modals
- [ ] Update 3 pages to use new modal (pilot)

**Consolidates:**
- MatterCreationModal
- MatterDetailModal
- EditMatterModal
- QuickAddMatterModal
- AcceptBriefModal
- QuickBriefCaptureModal

**Success Criteria:**
- All 6 modes working
- Zero regressions in pilot pages
- Test coverage > 80%

---

### Task 1.2: Create WorkItemModal (Week 1)
**Priority:** HIGH | **Effort:** 2 days

- [ ] Create `src/components/modals/work-item/WorkItemModal.tsx`
- [ ] Create form components:
  - [ ] `ServiceForm.tsx`
  - [ ] `TimeEntryForm.tsx`
  - [ ] `DisbursementForm.tsx`
- [ ] Create `useWorkItemModal.ts` hook
- [ ] Add unit tests
- [ ] Create deprecation wrappers
- [ ] Update MatterWorkbenchPage tabs

**Consolidates:**
- LogServiceModal
- TimeEntryModal
- LogDisbursementModal
- EditDisbursementModal
- QuickDisbursementModal

**Success Criteria:**
- All 3 types × 3 modes working
- Workbench tabs updated
- Test coverage > 80%

---

### Task 1.3: Create PaymentModal (Week 2)
**Priority:** HIGH | **Effort:** 2 days

- [ ] Create `src/components/modals/payment/PaymentModal.tsx`
- [ ] Create form components:
  - [ ] `RecordPaymentForm.tsx`
  - [ ] `EditPaymentForm.tsx`
- [ ] Create view components:
  - [ ] `PaymentDetailsView.tsx`
  - [ ] `InvoiceDetailsView.tsx`
- [ ] Create `usePaymentModal.ts` hook
- [ ] Add unit tests
- [ ] Create deprecation wrappers
- [ ] Update InvoicesPage

**Consolidates:**
- PaymentModal
- RecordPaymentModal
- InvoiceDetailsModal

**Success Criteria:**
- All 4 modes working
- Payment recording flow intact
- Test coverage > 80%

---

### Task 1.4: Create RetainerModal (Week 2)
**Priority:** MEDIUM | **Effort:** 2 days

- [ ] Create `src/components/modals/retainer/RetainerModal.tsx`
- [ ] Create form components:
  - [ ] `CreateRetainerForm.tsx`
  - [ ] `DepositForm.tsx`
  - [ ] `DrawdownForm.tsx`
  - [ ] `RefundForm.tsx`
- [ ] Create `RetainerHistoryView.tsx`
- [ ] Create `useRetainerModal.ts` hook
- [ ] Add unit tests
- [ ] Create deprecation wrappers

**Consolidates:**
- CreateRetainerModal
- DepositFundsModal
- DrawdownModal
- RefundModal

**Success Criteria:**
- All 5 modes working
- Retainer workflows intact
- Test coverage > 80%

---

### Task 1.5: Create ProFormaModal (Week 2)
**Priority:** MEDIUM | **Effort:** 1 day

- [ ] Create `src/components/modals/proforma/ProFormaModal.tsx`
- [ ] Create form components:
  - [ ] `CreateProFormaForm.tsx`
  - [ ] `ReviewProFormaForm.tsx`
  - [ ] `LinkProFormaForm.tsx`
- [ ] Create `useProFormaModal.ts` hook
- [ ] Add unit tests
- [ ] Create deprecation wrappers

**Consolidates:**
- SimpleProFormaModal
- ReviewProFormaRequestModal
- ProFormaLinkModal

**Success Criteria:**
- All 3 modes working
- Pro forma workflows intact
- Test coverage > 80%

---

### Task 1.6: Create FirmModal (Week 3)
**Priority:** LOW | **Effort:** 1 day

- [ ] Create `src/components/modals/firm/FirmModal.tsx`
- [ ] Create form components:
  - [ ] `CreateFirmForm.tsx`
  - [ ] `EditFirmForm.tsx`
- [ ] Create `ViewFirmDetails.tsx`
- [ ] Create `useFirmModal.ts` hook
- [ ] Add unit tests
- [ ] Create deprecation wrapper

**Consolidates:**
- CreateFirmModal
- (Future: EditFirmModal, ViewFirmModal)

**Success Criteria:**
- All 3 modes working
- FirmsPage updated
- Test coverage > 80%

---

### Task 1.7: Standardize Specialized Modals (Week 3)
**Priority:** MEDIUM | **Effort:** 1 day

Rename for consistency (no consolidation needed):

- [ ] Rename to `CreateInvoiceModal` (if needed)
- [ ] Rename to `IssueCreditNoteModal` (already correct)
- [ ] Rename to `RequestScopeAmendmentModal` (already correct)
- [ ] Rename to `InviteAttorneyModal` (already correct)
- [ ] Rename to `LinkDocumentModal` (already correct)
- [ ] Update all imports

**Success Criteria:**
- 100% naming consistency
- All imports updated
- No broken references

---

### Task 1.8: Update All Modal Usage (Week 3)
**Priority:** HIGH | **Effort:** 2 days

- [ ] Find all usages of deprecated modals
- [ ] Update to use new consolidated modals
- [ ] Remove deprecation wrappers
- [ ] Update exports in index files
- [ ] Run full test suite
- [ ] Manual QA of all modal flows

**Success Criteria:**
- Zero deprecated modal usages
- All tests passing
- No regressions found in QA

---

## Phase 2: Page Consolidation (Weeks 4-5)

### Task 2.1: Create FinancialPage (Week 4)
**Priority:** HIGH | **Effort:** 3 days

- [ ] Create `src/pages/financial/FinancialPage.tsx`
- [ ] Create tab components:
  - [ ] `InvoicesTab.tsx` (migrate from InvoicesPage)
  - [ ] `CreditNotesTab.tsx` (migrate from CreditNotesPage)
  - [ ] `ProFormasTab.tsx` (migrate from ProFormaRequestsPage)
  - [ ] `DisputesTab.tsx` (migrate from DisputesPage)
  - [ ] `PaymentsTab.tsx` (new)
- [ ] Implement master-detail for ProFormas
- [ ] Create shared components:
  - [ ] `FinancialFilters.tsx`
  - [ ] `FinancialExport.tsx`
- [ ] Add tab navigation with URL sync
- [ ] Add unit tests
- [ ] Update routing in AppRouter

**Consolidates:**
- InvoicesPage
- CreditNotesPage
- ProFormaRequestsPage
- ProFormaRequestPage
- DisputesPage

**Success Criteria:**
- All 5 tabs working
- URL routing correct (/financial?tab=invoices)
- Shared filters working
- Master-detail for pro formas working
- Test coverage > 70%

---

### Task 2.2: Merge Dashboard Pages (Week 4)
**Priority:** MEDIUM | **Effort:** 2 days

- [ ] Create `src/pages/dashboard/DashboardPage.tsx`
- [ ] Create view components:
  - [ ] `EnhancedView.tsx` (migrate from EnhancedDashboardPage)
  - [ ] `ClassicView.tsx` (migrate from DashboardPage)
- [ ] Create `ViewToggle.tsx` component
- [ ] Add user preference persistence
- [ ] Add unit tests
- [ ] Update routing
- [ ] Remove old pages

**Consolidates:**
- DashboardPage
- EnhancedDashboardPage

**Success Criteria:**
- Both views working
- View preference saved
- Smooth transitions
- Test coverage > 70%

---

### Task 2.3: Update Navigation & Routing (Week 5)
**Priority:** HIGH | **Effort:** 1 day

- [ ] Update NavigationBar links
- [ ] Update AppRouter routes
- [ ] Add redirects from old URLs
- [ ] Update breadcrumbs
- [ ] Update command palette
- [ ] Test all navigation flows

**Success Criteria:**
- All nav links working
- Old URLs redirect correctly
- Breadcrumbs accurate
- Command palette updated

---

### Task 2.4: Remove Deprecated Pages (Week 5)
**Priority:** MEDIUM | **Effort:** 1 day

- [ ] Verify no usages of old pages
- [ ] Remove old page files
- [ ] Update exports
- [ ] Clean up unused imports
- [ ] Run full test suite

**Success Criteria:**
- Old pages deleted
- No broken imports
- All tests passing

---

## Phase 3: Naming Standardization (Week 6)

### Task 3.1: Audit Current Naming (Week 6, Day 1)
**Priority:** HIGH | **Effort:** 0.5 days

- [ ] List all modal names
- [ ] List all page names
- [ ] List all component names
- [ ] Identify inconsistencies
- [ ] Create rename mapping

**Deliverable:** `NAMING_AUDIT.md` with rename plan

---

### Task 3.2: Rename Components (Week 6, Days 2-3)
**Priority:** HIGH | **Effort:** 1.5 days

- [ ] Rename modal files
- [ ] Rename page files
- [ ] Rename component files
- [ ] Update all imports
- [ ] Update tests
- [ ] Update Storybook
- [ ] Update documentation

**Success Criteria:**
- 100% naming consistency
- All imports updated
- All tests passing
- Documentation updated

---

### Task 3.3: Update Documentation (Week 6, Day 4)
**Priority:** MEDIUM | **Effort:** 0.5 days

- [ ] Update README.md
- [ ] Update component documentation
- [ ] Update API documentation
- [ ] Create naming convention guide
- [ ] Update onboarding docs

**Deliverable:** `NAMING_CONVENTIONS.md`

---

## Phase 4: UX Patterns (Weeks 7-8)

### Task 4.1: Implement Empty States (Week 7)
**Priority:** MEDIUM | **Effort:** 2 days

- [ ] Create `EmptyState.tsx` component
- [ ] Add to MattersPage (no matters)
- [ ] Add to InvoicesTab (no invoices)
- [ ] Add to ProFormasTab (no pro formas)
- [ ] Add to all list views
- [ ] Add to search results
- [ ] Add unit tests

**Success Criteria:**
- Empty state component reusable
- All list views have empty states
- Consistent design
- Test coverage > 80%

---

### Task 4.2: Implement Skeleton Loaders (Week 7)
**Priority:** MEDIUM | **Effort:** 2 days

- [ ] Create skeleton components:
  - [ ] `MatterListSkeleton.tsx`
  - [ ] `InvoiceListSkeleton.tsx`
  - [ ] `DashboardSkeleton.tsx`
  - [ ] `TableSkeleton.tsx`
- [ ] Replace spinners with skeletons
- [ ] Add to all async data loads
- [ ] Add unit tests

**Success Criteria:**
- Skeleton loaders on all lists
- No more generic spinners
- Smooth loading experience
- Test coverage > 80%

---

### Task 4.3: Implement Bulk Actions (Week 7)
**Priority:** LOW | **Effort:** 2 days

- [ ] Create `BulkActionBar.tsx` component
- [ ] Create `useSelection.ts` hook (already exists)
- [ ] Add to MattersPage
- [ ] Add to InvoicesTab
- [ ] Add to ProFormasTab
- [ ] Implement bulk operations:
  - [ ] Archive matters
  - [ ] Export invoices
  - [ ] Delete items
- [ ] Add unit tests

**Success Criteria:**
- Bulk actions working on 3+ pages
- Selection state managed correctly
- Confirmation dialogs for destructive actions
- Test coverage > 80%

---

### Task 4.4: Implement Command Palette (Week 8)
**Priority:** LOW | **Effort:** 3 days

- [ ] Create `CommandPalette.tsx` component
- [ ] Add keyboard shortcut (Cmd/Ctrl + K)
- [ ] Add commands:
  - [ ] Create matter
  - [ ] Record payment
  - [ ] Generate invoice
  - [ ] Quick brief
  - [ ] Search matters
  - [ ] Navigate to pages
- [ ] Add fuzzy search
- [ ] Add recent commands
- [ ] Add unit tests
- [ ] Add to navigation

**Success Criteria:**
- Command palette opens with Cmd+K
- All major actions accessible
- Fuzzy search working
- Recent commands tracked
- Test coverage > 80%

---

### Task 4.5: Implement Slide-Out Panels (Week 8)
**Priority:** LOW | **Effort:** 2 days

- [ ] Create `SlideOutPanel.tsx` component
- [ ] Convert detail views to slide-outs:
  - [ ] Matter detail
  - [ ] Invoice detail
  - [ ] Firm detail
- [ ] Add animations
- [ ] Add keyboard shortcuts
- [ ] Add unit tests

**Success Criteria:**
- Slide-out panels working
- Smooth animations
- Can see list behind panel
- Test coverage > 80%

---

## Testing & QA

### Task 5.1: Unit Tests
**Priority:** HIGH | **Ongoing**

- [ ] All new modals have tests
- [ ] All new pages have tests
- [ ] All new components have tests
- [ ] Coverage > 80% for new code

---

### Task 5.2: Integration Tests
**Priority:** HIGH | **Week 8**

- [ ] Test modal mode switching
- [ ] Test tab navigation
- [ ] Test master-detail interactions
- [ ] Test bulk actions
- [ ] Test command palette

---

### Task 5.3: E2E Tests
**Priority:** MEDIUM | **Week 8**

- [ ] Test complete matter creation flow
- [ ] Test complete invoicing flow
- [ ] Test complete payment flow
- [ ] Test navigation between pages
- [ ] Test keyboard shortcuts

---

### Task 5.4: Manual QA
**Priority:** HIGH | **Week 8**

- [ ] Test all modal modes
- [ ] Test all page tabs
- [ ] Test all navigation flows
- [ ] Test on mobile
- [ ] Test accessibility
- [ ] Test keyboard navigation
- [ ] Performance testing

---

## Documentation

### Task 6.1: Component Documentation
**Priority:** MEDIUM | **Week 8**

- [ ] Document MatterModal API
- [ ] Document WorkItemModal API
- [ ] Document PaymentModal API
- [ ] Document FinancialPage API
- [ ] Create usage examples
- [ ] Create migration guide

---

### Task 6.2: User Documentation
**Priority:** LOW | **Week 8**

- [ ] Update user guide
- [ ] Create video tutorials
- [ ] Update help center
- [ ] Create release notes

---

## Deployment

### Task 7.1: Feature Flags
**Priority:** HIGH | **Week 3, 5**

- [ ] Add feature flag for new modals
- [ ] Add feature flag for new pages
- [ ] Add gradual rollout config
- [ ] Add rollback mechanism

---

### Task 7.2: Gradual Rollout
**Priority:** HIGH | **Week 8**

- [ ] Deploy to staging
- [ ] Internal testing (1 day)
- [ ] Beta users (3 days)
- [ ] 25% rollout (2 days)
- [ ] 50% rollout (2 days)
- [ ] 100% rollout

---

### Task 7.3: Monitoring
**Priority:** HIGH | **Week 8+**

- [ ] Set up error tracking
- [ ] Set up performance monitoring
- [ ] Set up user analytics
- [ ] Monitor support tickets
- [ ] Collect user feedback

---

## Success Metrics

### Quantitative
- [ ] Modal count: 47 → 30 (36% reduction) ✅
- [ ] Page count: 22 → 18 (18% reduction) ✅
- [ ] Code duplication: -30% ✅
- [ ] Bundle size: -15% ✅
- [ ] Test coverage: >80% ✅

### Qualitative
- [ ] Naming consistency: 100% ✅
- [ ] Developer satisfaction: Survey ✅
- [ ] User satisfaction: Survey ✅
- [ ] Support ticket reduction: 20% ✅

### Performance
- [ ] Modal open time: <100ms ✅
- [ ] Tab switch time: <50ms ✅
- [ ] Page load time: <1s ✅
- [ ] No layout shift ✅
