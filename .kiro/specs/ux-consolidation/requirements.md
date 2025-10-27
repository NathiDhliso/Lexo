# UX Consolidation Requirements

## Business Requirements

### BR-1: Reduce Cognitive Load
Users should encounter fewer distinct UI patterns and naming conventions.

### BR-2: Improve Development Velocity
Developers should spend less time searching for the right component.

### BR-3: Maintain Feature Parity
All existing functionality must be preserved during consolidation.

### BR-4: Zero Downtime
Refactoring must be done incrementally without breaking production.

## Functional Requirements

### FR-1: Unified Modal Components

#### FR-1.1: MatterModal
**Modes:** create | edit | view | quick-add | accept-brief | detail

```typescript
interface MatterModalProps {
  mode: 'create' | 'edit' | 'view' | 'quick-add' | 'accept-brief' | 'detail';
  matterId?: string;
  firmId?: string;
  onSuccess?: (matter: Matter) => void;
  onClose: () => void;
}
```

**Consolidates:**
- MatterCreationModal
- MatterDetailModal
- EditMatterModal
- QuickAddMatterModal
- AcceptBriefModal
- QuickBriefCaptureModal

#### FR-1.2: WorkItemModal
**Types:** service | time | disbursement
**Modes:** create | edit | quick

```typescript
interface WorkItemModalProps {
  type: 'service' | 'time' | 'disbursement';
  mode: 'create' | 'edit' | 'quick';
  itemId?: string;
  matterId: string;
  onSuccess?: () => void;
  onClose: () => void;
}
```

**Consolidates:**
- LogServiceModal
- TimeEntryModal
- LogDisbursementModal
- EditDisbursementModal
- QuickDisbursementModal

#### FR-1.3: PaymentModal
**Modes:** record | view | edit | invoice-details

```typescript
interface PaymentModalProps {
  mode: 'record' | 'view' | 'edit' | 'invoice-details';
  paymentId?: string;
  invoiceId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}
```

**Consolidates:**
- PaymentModal
- RecordPaymentModal
- InvoiceDetailsModal

#### FR-1.4: RetainerModal
**Modes:** create | deposit | drawdown | refund | history

```typescript
interface RetainerModalProps {
  mode: 'create' | 'deposit' | 'drawdown' | 'refund' | 'history';
  retainerId?: string;
  matterId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}
```

**Consolidates:**
- CreateRetainerModal
- DepositFundsModal
- DrawdownModal
- RefundModal

#### FR-1.5: ProFormaModal
**Modes:** create | review | link

```typescript
interface ProFormaModalProps {
  mode: 'create' | 'review' | 'link';
  proFormaId?: string;
  matterId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}
```

**Consolidates:**
- SimpleProFormaModal
- ReviewProFormaRequestModal
- ProFormaLinkModal

#### FR-1.6: FirmModal
**Modes:** create | edit | view

```typescript
interface FirmModalProps {
  mode: 'create' | 'edit' | 'view';
  firmId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}
```

**Consolidates:**
- CreateFirmModal
- (Future: EditFirmModal, ViewFirmModal)

### FR-2: Unified Page Components

#### FR-2.1: FinancialPage
**Tabs:** invoices | credits | proformas | disputes | payments

```typescript
interface FinancialPageProps {
  defaultTab?: 'invoices' | 'credits' | 'proformas' | 'disputes' | 'payments';
}
```

**Consolidates:**
- InvoicesPage
- CreditNotesPage
- ProFormaRequestsPage
- ProFormaRequestPage (as detail panel)
- DisputesPage

#### FR-2.2: DashboardPage
**Views:** enhanced | classic

```typescript
interface DashboardPageProps {
  defaultView?: 'enhanced' | 'classic';
}
```

**Consolidates:**
- DashboardPage
- EnhancedDashboardPage

### FR-3: Naming Conventions

#### FR-3.1: Modal Naming Pattern
**Format:** `{Action}{Entity}Modal`

**Examples:**
- CreateMatterModal
- EditMatterModal
- RecordPaymentModal
- IssueCreditNoteModal
- InviteAttorneyModal

#### FR-3.2: Page Naming Pattern
**Format:** `{Entity}Page` or `{Feature}Page`

**Examples:**
- MattersPage
- FinancialPage
- DashboardPage
- SettingsPage

## Non-Functional Requirements

### NFR-1: Performance
- Modal switching should be < 100ms
- Tab switching should be < 50ms
- No layout shift during transitions

### NFR-2: Accessibility
- All modals must support keyboard navigation
- Focus management must be preserved
- ARIA labels must be accurate

### NFR-3: Backward Compatibility
- Old modal names should be aliased during transition
- Deprecation warnings should be logged
- Migration guide must be provided

### NFR-4: Testing
- All consolidated modals must have unit tests
- Integration tests must cover mode switching
- E2E tests must verify user workflows

## Constraints

### C-1: Timeline
- Phase 1 must be completed within 3 weeks
- Full consolidation within 8 weeks

### C-2: Resources
- Maximum 2 developers assigned
- No external dependencies

### C-3: Risk Mitigation
- Feature flags for new components
- Gradual rollout strategy
- Rollback plan for each phase
