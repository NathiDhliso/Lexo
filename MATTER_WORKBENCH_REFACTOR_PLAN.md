# Matter Workbench UI Refactoring Plan

## Executive Summary

The current `MatterWorkbenchPage.tsx` is actually a **matter creation wizard**. We need to create a **true Matter Workbench** that serves as the central hub for working on active matters, supporting both Path A (Quote First) and Path B (Accept & Work) workflows.

---

## Current Issues

### 1. Misnamed Component
- **File:** `MatterWorkbenchPage.tsx` (888 lines)
- **Current Purpose:** 5-step matter creation wizard
- **Should Be:** Active matter workspace with Universal Toolset

### 2. Scattered Functionality
- Time entry logging → Modal in `MattersPage`
- Expense logging → Separate modals
- Scope amendments → Button in `MattersPage`
- WIP tracking → Separate `WIPTrackerPage.tsx`
- **Result:** No unified workspace for working on a matter

### 3. No Clear Workflow Distinction
- Path A (Pro Forma → WIP → Invoice) tools not grouped
- Path B (Accept → Work → Fee Note) tools not clearly separated
- User must navigate multiple pages to complete work

---

## Proposed Architecture

### Component Structure

```
src/
├── pages/
│   ├── MatterWorkbenchPage.tsx          [REFACTOR] → True workbench for active matters
│   ├── NewMatterWizardPage.tsx          [NEW] → Rename current MatterWorkbenchPage
│   └── WIPTrackerPage.tsx               [KEEP] → Portfolio-level WIP view
│
├── components/
│   └── matters/
│       ├── workbench/                   [NEW FOLDER]
│       │   ├── WorkbenchOverview.tsx    → Matter summary, budget tracking
│       │   ├── WorkbenchTimeTab.tsx     → Time entry logging
│       │   ├── WorkbenchExpensesTab.tsx → Expense/disbursement tracking
│       │   ├── WorkbenchServicesTab.tsx → Logged services
│       │   ├── WorkbenchAmendmentsTab.tsx → Scope amendments history
│       │   ├── WorkbenchDocumentsTab.tsx  → Document management
│       │   ├── WorkbenchInvoicingTab.tsx  → Convert WIP to invoice
│       │   ├── PathAActions.tsx          → Quote First workflow tools
│       │   └── PathBActions.tsx          → Accept & Work workflow tools
│       │
│       ├── AcceptBriefModal.tsx         [KEEP]
│       ├── SimpleFeeEntryModal.tsx      [KEEP]
│       ├── RequestScopeAmendmentModal.tsx [KEEP]
│       └── WIPAccumulator.tsx           [KEEP]
```

---

## New Matter Workbench Page Spec

### Route
```
/matter-workbench/:matterId
```

### Props
```typescript
interface MatterWorkbenchPageProps {
  matterId: string;  // From URL params
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Matter Workbench: Smith v Jones (Motor Vehicle Accident)              │
│  Status: Active | Client: John Smith | WIP: R35,400 | Budget: R50,000  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [ Overview ] [ Time ] [ Expenses ] [ Services ] [ Amendments ] [ ... ]│
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  TAB CONTENT AREA                                                       │
│                                                                         │
│  [Path-specific actions based on source_proforma_id]                   │
│                                                                         │
│  PATH A (from pro forma):                                               │
│    [+ Log Time] [+ Log Expense] [+ Log Service]                        │
│    [Request Scope Amendment] [View Budget Comparison]                  │
│                                                                         │
│  PATH B (accepted brief):                                               │
│    [Simple Fee Entry] OR [Hybrid: Log Time + Expenses]                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tabs

#### 1. Overview Tab
**Purpose:** High-level matter summary and quick actions

**Components:**
- Matter details card (client, attorney, case number)
- **Path A:** Budget comparison (Original + Amendments vs WIP Logged)
- **Path B:** Expected fee vs Simple fee entered
- Recent activity timeline
- Quick action buttons

**Data:**
```typescript
{
  matter: Matter,
  sourceProFormaId: string | null,
  wipValue: number,
  originalBudget: number,
  amendmentTotal: number,
  currentBudget: number,
  recentActivity: Activity[]
}
```

#### 2. Time Tab
**Purpose:** Log and view time entries

**Features:**
- TimeEntryModal integration
- List of all time entries (grouped by date)
- Filter: Billed / Unbilled
- Total hours and value
- **Path A:** Show against budget
- **Path B:** Show total for fee note

**Actions:**
- [+ Add Time Entry]
- [Edit Entry]
- [Delete Entry]

#### 3. Expenses Tab
**Purpose:** Track disbursements and expenses

**Features:**
- QuickDisbursementModal integration
- List of all expenses
- Filter: Billed / Unbilled / Reimbursable
- Total expenses
- Receipt attachments

**Actions:**
- [+ Add Expense]
- [Upload Receipt]
- [Edit]
- [Delete]

#### 4. Services Tab
**Purpose:** Log performed services (not time-based)

**Features:**
- LogServiceModal integration
- List of services (opinions, consultations, appearances)
- Flat fee services
- **Path A:** Services as line items
- **Path B:** Services as part of total fee

#### 5. Amendments Tab
**Purpose:** Scope amendment history

**Visibility:** **Path A only** (matters with `source_proforma_id`)

**Features:**
- RequestScopeAmendmentModal integration
- List of all amendments (pending, approved, declined)
- Amendment details (original vs new scope)
- Budget impact tracking

**Actions:**
- [+ Request New Amendment]
- [View Amendment PDF]

#### 6. Documents Tab
**Purpose:** Matter-related documents

**Features:**
- DocumentsTab component (already exists)
- Upload/view/delete documents
- Link to pro forma PDF (if Path A)
- Link to scope amendment PDFs

#### 7. Invoicing Tab
**Purpose:** Convert WIP to invoice

**Features:**
- WIP summary (unbilled time + expenses + services)
- Preview invoice line items
- Generate invoice PDF
- Send to attorney

**Actions:**
- [Convert WIP to Invoice]
- [Preview Invoice]
- [Mark Ready for Invoicing]

---

## Workflow-Specific Logic

### Path Detection
```typescript
const isPathA = matter.source_proforma_id !== null;
const isPathB = matter.source_proforma_id === null;
```

### Path A: "Quote First" Actions
```typescript
// Available actions for matters created from pro forma
const pathAActions = [
  {
    label: '+ Log Time Entry',
    icon: Clock,
    modal: 'TimeEntryModal',
    description: 'Track billable hours against budget'
  },
  {
    label: '+ Log Expense',
    icon: Receipt,
    modal: 'QuickDisbursementModal',
    description: 'Add disbursements and expenses'
  },
  {
    label: '+ Log Service',
    icon: FileText,
    modal: 'LogServiceModal',
    description: 'Record performed services'
  },
  {
    label: 'Request Scope Amendment',
    icon: AlertCircle,
    modal: 'RequestScopeAmendmentModal',
    description: 'Request additional scope beyond original estimate',
    variant: 'outline'
  },
  {
    label: 'View Budget Comparison',
    icon: TrendingUp,
    action: 'showBudgetModal',
    description: 'Compare logged work vs approved budget'
  }
];
```

### Path B: "Accept & Work" Actions
```typescript
// Available actions for matters accepted without pro forma
const pathBActions = [
  {
    label: 'Simple Fee Entry',
    icon: DollarSign,
    modal: 'SimpleFeeEntryModal',
    description: 'Enter flat brief fee (e.g., R15,000 opinion fee)',
    variant: 'primary'
  },
  {
    label: 'Hybrid: Log Time',
    icon: Clock,
    modal: 'TimeEntryModal',
    description: 'Track hours if not using flat fee'
  },
  {
    label: '+ Log Expense',
    icon: Receipt,
    modal: 'QuickDisbursementModal',
    description: 'Add disbursements to fee note'
  }
];
```

---

## Navigation Updates

### Update AppRouter.tsx
```typescript
// Current (WRONG)
<Route path="/matter-workbench" element={<MatterWorkbenchPage />} />

// New (CORRECT)
<Route path="/matters/new" element={<NewMatterWizardPage />} />
<Route path="/matter-workbench/:matterId" element={<MatterWorkbenchPage />} />
```

### Update MattersPage.tsx
```typescript
// When user clicks "View" on active matter
const handleViewMatter = (matter: Matter) => {
  if (matter.status === 'active') {
    navigate(`/matter-workbench/${matter.id}`);
  } else {
    // Show read-only detail modal
    setSelectedMatter(matter);
    setShowDetailModal(true);
  }
};
```

### Update navigation.config.ts
```typescript
{
  id: 'matter-actions',
  title: 'Actions',
  items: [
    {
      id: 'new-matter',
      label: 'New Matter',
      page: 'new-matter',  // NEW
      icon: Plus,
      description: 'Create new matter',
      action: 'create-matter'
    },
    {
      id: 'wip-tracker',
      label: 'WIP Tracker',
      page: 'wip-tracker',
      icon: TrendingUp,
      description: 'Track unbilled work across all matters'
    }
  ]
}
```

---

## Data Flow

### Loading Matter Data
```typescript
const loadMatterData = async (matterId: string) => {
  // 1. Load matter details
  const matter = await matterApiService.getMatter(matterId);
  
  // 2. Load WIP components
  const [timeEntries, expenses, services] = await Promise.all([
    TimeEntryService.getTimeEntries({ matterId }),
    expenseService.getExpenses(matterId),
    LoggedServicesService.getServicesByMatter(matterId)
  ]);
  
  // 3. If Path A, load pro forma and amendments
  if (matter.source_proforma_id) {
    const [proforma, amendments] = await Promise.all([
      proformaRequestService.getById(matter.source_proforma_id),
      scopeAmendmentService.getAmendmentsByMatter(matterId)
    ]);
    
    // Calculate budget
    const originalBudget = proforma.total_amount;
    const amendmentTotal = amendments
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.amount, 0);
    
    return {
      matter,
      timeEntries,
      expenses,
      services,
      originalBudget,
      amendmentTotal,
      currentBudget: originalBudget + amendmentTotal,
      amendments
    };
  }
  
  // 4. Path B - simple return
  return {
    matter,
    timeEntries,
    expenses,
    services
  };
};
```

### Real-time WIP Updates
```typescript
// Subscribe to WIP changes
useEffect(() => {
  const channel = supabase
    .channel(`matter-${matterId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'time_entries',
      filter: `matter_id=eq.${matterId}`
    }, () => refreshWIP())
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'expenses',
      filter: `matter_id=eq.${matterId}`
    }, () => refreshWIP())
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'logged_services',
      filter: `matter_id=eq.${matterId}`
    }, () => refreshWIP())
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
}, [matterId]);
```

---

## Implementation Steps

### Phase 1: Rename Current Components ✅
1. Rename `MatterWorkbenchPage.tsx` → `NewMatterWizardPage.tsx`
2. Update imports in `AppRouter.tsx`
3. Update navigation config
4. Test matter creation still works

### Phase 2: Create New Workbench Shell ✅
1. Create new `MatterWorkbenchPage.tsx` with tab navigation
2. Add route `/matter-workbench/:matterId`
3. Create basic layout with header and tabs
4. Add Path A/B detection logic

### Phase 3: Build Tab Components ✅
1. Create `WorkbenchOverview.tsx` (matter summary + quick actions)
2. Create `WorkbenchTimeTab.tsx` (integrate TimeEntryModal)
3. Create `WorkbenchExpensesTab.tsx` (integrate QuickDisbursementModal)
4. Create `WorkbenchServicesTab.tsx` (integrate LogServiceModal)
5. Create `WorkbenchAmendmentsTab.tsx` (integrate RequestScopeAmendmentModal)
6. Reuse existing `DocumentsTab.tsx`
7. Create `WorkbenchInvoicingTab.tsx` (WIP → Invoice conversion)

### Phase 4: Path-Specific Actions ✅
1. Create `PathAActions.tsx` component (shown when `source_proforma_id` exists)
2. Create `PathBActions.tsx` component (shown when no `source_proforma_id`)
3. Add conditional rendering in workbench
4. Add budget comparison widget (Path A only)

### Phase 5: Integration & Testing ✅
1. Update `MattersPage.tsx` to navigate to workbench
2. Update `MatterDetailModal.tsx` to link to workbench
3. Test Path A workflow (pro forma → active → WIP → invoice)
4. Test Path B workflow (accept → work → fee note)
5. Test scope amendments
6. Test real-time WIP updates

---

## Success Criteria

### Path A: "Quote First"
- ✅ User can open active matter from pro forma
- ✅ Workbench shows original budget from pro forma
- ✅ User can log time, expenses, services
- ✅ WIP accumulates in real-time
- ✅ User can request scope amendments
- ✅ Budget comparison shows: Original + Amendments vs Logged
- ✅ User can mark ready for invoicing
- ✅ User can convert WIP to invoice

### Path B: "Accept & Work"
- ✅ User can open active matter from accepted brief
- ✅ Workbench shows NO budget (or shows expected fee if set)
- ✅ User can use Simple Fee Entry (flat amount)
- ✅ OR user can use Hybrid mode (log time + expenses)
- ✅ WIP shows total unbilled work
- ✅ User can generate fee note
- ✅ Scope amendments optional but available

### Universal
- ✅ All modals (TimeEntry, QuickDisbursement, LogService) work in workbench
- ✅ WIPAccumulator updates in real-time
- ✅ Documents tab shows all matter files
- ✅ Invoicing tab converts WIP correctly
- ✅ Navigation: MattersPage → Workbench → Back

---

## Files to Create

```
c:\Users\nathi\Downloads\LexoHub\src\pages\NewMatterWizardPage.tsx
c:\Users\nathi\Downloads\LexoHub\src\pages\MatterWorkbenchPage.tsx (complete refactor)
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\WorkbenchOverview.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\WorkbenchTimeTab.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\WorkbenchExpensesTab.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\WorkbenchServicesTab.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\WorkbenchAmendmentsTab.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\WorkbenchInvoicingTab.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\PathAActions.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\PathBActions.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\workbench\BudgetComparisonWidget.tsx
```

## Files to Modify

```
c:\Users\nathi\Downloads\LexoHub\src\AppRouter.tsx
c:\Users\nathi\Downloads\LexoHub\src\pages\MattersPage.tsx
c:\Users\nathi\Downloads\LexoHub\src\components\matters\MatterDetailModal.tsx
c:\Users\nathi\Downloads\LexoHub\src\config\navigation.config.ts
c:\Users\nathi\Downloads\LexoHub\src\types\index.ts (add Page type: 'new-matter')
```

---

## Estimated Effort

- **Phase 1:** 1 hour (rename & routing)
- **Phase 2:** 2 hours (shell + layout)
- **Phase 3:** 8 hours (7 tab components)
- **Phase 4:** 3 hours (Path A/B actions)
- **Phase 5:** 4 hours (integration & testing)

**Total:** ~18 hours of focused development

---

## Next Steps

1. Review this plan with you
2. Get approval on component structure
3. Start Phase 1 (rename current workbench)
4. Build incrementally with testing after each phase

Would you like me to proceed with implementation?
