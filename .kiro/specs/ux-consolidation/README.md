# UX Consolidation & Refactoring Spec

## Current State Analysis

### Pages: 22 (Target: 18)
- DashboardPage
- EnhancedDashboardPage ❌ DUPLICATE
- MattersPage
- MatterWorkbenchPage
- InvoicesPage
- CreditNotesPage ❌ CONSOLIDATE
- DisputesPage ❌ CONSOLIDATE
- ProFormaRequestsPage ❌ CONSOLIDATE
- ProFormaRequestPage ❌ CONSOLIDATE
- FirmsPage
- ReportsPage
- SettingsPage
- ProfilePage
- NotificationsPage
- AuditTrailPage
- SubscriptionPage
- SubscriptionCallbackPage
- CloudStorageCallbackPage
- LoginPage
- NewMatterWizardPage
- WIPTrackerPage
- attorney/AttorneyRegisterPage
- attorney/SubmitMatterRequestPage
- partner/PartnerApprovalPage

### Modals: 47 (Target: 30)

#### Matter Management (8 → 1)
- MatterCreationModal
- MatterDetailModal
- EditMatterModal
- QuickAddMatterModal
- AcceptBriefModal
- QuickBriefCaptureModal
- ConvertProFormaModal
- AdvancedFiltersModal

#### Work Tracking (5 → 1)
- LogServiceModal
- TimeEntryModal
- LogDisbursementModal
- EditDisbursementModal
- QuickDisbursementModal

#### Financial (10 → 3)
- GenerateInvoiceModal
- InvoiceDetailsModal
- PaymentModal
- RecordPaymentModal
- IssueCreditNoteModal
- DiscountModal
- MatterSelectionModal
- UnifiedInvoiceWizard
- CreditNoteModal
- DisputeModal

#### Retainer (4 → 1)
- CreateRetainerModal
- DepositFundsModal
- DrawdownModal
- RefundModal

#### Firm & Attorney (4 → 2)
- CreateFirmModal
- AddAttorneyModal
- InviteAttorneyModal
- PartnerApprovalModal

#### Pro Forma (3 → 1)
- SimpleProFormaModal
- ReviewProFormaRequestModal
- ProFormaLinkModal

#### Documents (1 - Keep)
- LinkDocumentModal

#### Scope (2 → 1)
- CreateAmendmentModal
- RequestScopeAmendmentModal

#### Other (10 - Keep)
- ReportModal
- SimpleFeeEntryModal
- ConfirmationDialog
- Modal (base)
- ModalComponents (base)

## Implementation Phases

### Phase 1: Modal Consolidation (Weeks 1-3)
Priority: HIGH | Impact: 40% modal reduction

### Phase 2: Page Consolidation (Weeks 4-5)
Priority: MEDIUM | Impact: 28% page reduction

### Phase 3: Naming Standardization (Week 6)
Priority: HIGH | Impact: Developer experience

### Phase 4: UX Patterns (Weeks 7-8)
Priority: MEDIUM | Impact: User experience

## Success Metrics
- Modal count: 47 → 30 (36% reduction)
- Page count: 22 → 18 (18% reduction)
- Code duplication: -30%
- Naming consistency: 100%
