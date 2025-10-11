# Design Document: Retainer Management UI

## Overview

This design document focuses on the user interface and user experience layer for LexoHub's existing retainer management system. The backend infrastructure (database tables, API services, business logic) is already complete. This spec defines how advocates will interact with retainer functionality through intuitive, accessible UI components integrated into their daily workflow.

### Design Philosophy

- **Simplicity First**: Hide complexity of trust accounting behind simple, clear interfaces
- **Visual Clarity**: Use color coding and progress indicators to communicate balance status at a glance
- **Contextual Integration**: Surface retainer information where advocates need it (matter pages, invoice generation)
- **Proactive Guidance**: Suggest retainer application automatically during invoice creation
- **Mobile-Friendly**: Ensure all retainer operations work seamlessly on mobile devices

### Key Design Decisions

1. **No New Pages**: Integrate retainer UI into existing matter and dashboard pages
2. **Progressive Disclosure**: Show summary by default, details on demand
3. **Visual Balance Indicators**: Use progress bars and color coding for quick status assessment
4. **Inline Actions**: Allow common operations (deposit, drawdown) without navigation
5. **Smart Defaults**: Pre-populate forms with sensible values based on context

## Architecture

### Component Hierarchy

```
Dashboard
├── RetainerSummaryWidget (new)
│   └── RetainerQuickStats (new)
│
MattersPage
└── MatterCard
    └── RetainerBadge (new)
│
MatterDetailPage
├── RetainerSection (new)
│   ├── RetainerBalanceCard (new)
│   ├── RetainerTransactionHistory (new)
│   └── RetainerActions (new)
│
InvoiceGenerationFlow
└── RetainerApplicationPrompt (new)
│
RetainersPage (new)
└── RetainersList (new)
    └── RetainerListItem (new)
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │   Retainer   │───▶│ useRetainer  │──▶│   Retainer   │   │
│  │  Components  │    │    Hook      │   │   Service    │   │
│  └──────────────┘    └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────────┐    ┌──────────────────┐              │
│  │    retainer_     │    │     trust_       │              │
│  │   agreements     │◀──▶│  transactions    │              │
│  └──────────────────┘    └──────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. RetainerBalanceCard Component

**Purpose**: Display retainer balance and status prominently on matter detail page

**Location**: Matter detail page, top of retainer section

**Visual Design**:
```
┌─────────────────────────────────────────────────────────┐
│  Retainer Balance                          [•••]         │
│                                                          │
│  R 45,000.00 available                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  75% remaining (R 15,000 used of R 60,000)              │
│                                                          │
│  [Add Deposit]  [Apply to Invoice]  [View History]      │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface RetainerBalanceCardProps {
  matterId: string;
  retainer: RetainerAgreement;
  summary: RetainerSummary;
  onDeposit: () => void;
  onDrawdown: () => void;
  onViewHistory: () => void;
}
```

**Features**:
- Large, prominent balance display
- Progress bar with color coding (green >50%, yellow 20-50%, red <20%)
- Percentage and absolute amounts
- Quick action buttons
- Dropdown menu for additional actions (refund, renew, cancel, edit)

### 2. CreateRetainerModal Component

**Purpose**: Modal for creating a new retainer agreement

**Props**:
```typescript
interface CreateRetainerModalProps {
  matterId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (retainer: RetainerAgreement) => void;
}
```

**Form Fields**:
- Retainer Type (dropdown): Monthly, Annual, Project, Evergreen
- Retainer Amount (currency input, required)
- Billing Period (dropdown): Monthly, Quarterly, Annual, One-time
- Start Date (date picker, default: today)
- End Date (date picker, optional)
- Auto-Renew (checkbox)
- Initial Deposit Amount (currency input, optional)
- Notes (textarea, optional)

**Validation**:
- Retainer amount must be positive
- Start date cannot be in the past
- End date must be after start date (if provided)
- Initial deposit cannot exceed retainer amount

**Behavior**:
- If initial deposit is provided, create retainer and deposit in single transaction
- Show success message with balance
- Refresh matter page to show new retainer section

### 3. AddDepositModal Component

**Purpose**: Modal for recording a deposit to retainer

**Props**:
```typescript
interface AddDepositModalProps {
  retainerId: string;
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: TrustTransaction) => void;
}
```

**Form Fields**:
- Amount (currency input, required)
- Reference Number (text input, optional)
- Description (textarea, required)
- Transaction Date (date picker, default: today)

**Visual Feedback**:
- Show current balance before deposit
- Calculate and display new balance as user types amount
- Use green color to indicate positive transaction

### 4. ApplyRetainerModal Component

**Purpose**: Modal for applying retainer balance to an invoice (drawdown)

**Props**:
```typescript
interface ApplyRetainerModalProps {
  retainerId: string;
  availableBalance: number;
  invoiceAmount: number;
  invoiceId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: TrustTransaction) => void;
}
```

**Form Fields**:
- Amount to Apply (currency input, required, max: min(availableBalance, invoiceAmount))
- Description (textarea, auto-populated with invoice reference)
- Transaction Date (date picker, default: today)

**Visual Feedback**:
- Show available balance
- Show invoice amount
- Calculate and display: remaining balance after application, remaining invoice balance
- Use slider or quick-select buttons (25%, 50%, 75%, 100%, Full Balance)

### 5. RetainerTransactionHistory Component

**Purpose**: Display list of all transactions for a retainer

**Props**:
```typescript
interface RetainerTransactionHistoryProps {
  retainerId: string;
  transactions: TrustTransaction[];
  onExport: () => void;
}
```

**Visual Design**:
```
┌─────────────────────────────────────────────────────────┐
│  Transaction History                      [Export CSV]   │
├─────────────────────────────────────────────────────────┤
│  ↑ 2024-10-10  Deposit                    + R 30,000.00 │
│     Initial retainer deposit                             │
│     Balance: R 0 → R 30,000                             │
│                                                          │
│  ↓ 2024-10-15  Drawdown                   - R 5,000.00  │
│     Applied to Invoice #INV-2024-001                    │
│     Balance: R 30,000 → R 25,000                        │
│                                                          │
│  ↑ 2024-10-20  Deposit                    + R 15,000.00 │
│     Additional funds received                            │
│     Balance: R 25,000 → R 40,000                        │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Chronological list (newest first)
- Visual indicators: ↑ green for deposits, ↓ red for drawdowns, ⟲ orange for refunds
- Clickable invoice references
- Balance before/after for each transaction
- Pagination (20 per page)
- Export to CSV functionality

### 6. RetainerSummaryWidget Component

**Purpose**: Dashboard widget showing overview of all retainers

**Location**: Dashboard page

**Visual Design**:
```
┌─────────────────────────────────────────────────────────┐
│  Retainers Overview                      [View All →]    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │    5     │  │ R 125K   │  │    2     │  │    1     ││
│  │  Active  │  │  Total   │  │   Low    │  │ Expiring ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│  Recent Activity:                                        │
│  • Smith v Jones - R 5,000 drawdown                     │
│  • Estate Matter - R 20,000 deposit                     │
│  • Contract Review - Low balance warning                │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface RetainerSummaryWidgetProps {
  stats: {
    activeCount: number;
    totalBalance: number;
    lowBalanceCount: number;
    expiringCount: number;
  };
  recentActivity: Array<{
    matterName: string;
    type: 'deposit' | 'drawdown' | 'warning';
    amount?: number;
    message: string;
  }>;
}
```

### 7. RetainerBadge Component

**Purpose**: Small badge on matter cards indicating retainer status

**Location**: Matter card in matters list

**Visual Design**:
```
[💰 R 45K]  (green if >50%, yellow if 20-50%, red if <20%)
```

**Props**:
```typescript
interface RetainerBadgeProps {
  balance: number;
  percentageRemaining: number;
  onClick: () => void;
}
```

**Behavior**:
- Tooltip on hover showing full details
- Click to show quick preview dropdown with balance and recent transactions
- Color-coded based on percentage remaining

### 8. RetainerApplicationPrompt Component

**Purpose**: Prompt during invoice generation to apply retainer

**Location**: Invoice creation/generation flow

**Visual Design**:
```
┌─────────────────────────────────────────────────────────┐
│  ℹ️  This matter has R 45,000 available in retainer     │
│                                                          │
│  Invoice Amount: R 12,500                               │
│  Apply Retainer: R 12,500 (suggested)                   │
│  Balance Due:    R 0                                    │
│                                                          │
│  [Apply Full Amount]  [Apply Partial]  [Don't Apply]    │
└─────────────────────────────────────────────────────────┘
```

**Props**:
```typescript
interface RetainerApplicationPromptProps {
  retainerId: string;
  availableBalance: number;
  invoiceAmount: number;
  onApply: (amount: number) => void;
  onSkip: () => void;
}
```



### 9. RetainersListPage Component

**Purpose**: Dedicated page showing all retainers across all matters

**Location**: New route `/retainers`

**Visual Design**:
```
┌─────────────────────────────────────────────────────────┐
│  Retainers                                               │
│  [All] [Active] [Low Balance] [Expiring] [Cancelled]    │
├─────────────────────────────────────────────────────────┤
│  Smith v Jones                                    [View] │
│  R 45,000 / R 60,000 (75%)  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Last activity: 2 days ago                              │
│                                                          │
│  Estate of Johnson                                [View] │
│  R 8,000 / R 50,000 (16%) ⚠️ ━━━━━━━━━━━━━━━━━━━━━━━  │
│  Last activity: 1 week ago                              │
│                                                          │
│  Contract Review - ABC Corp                       [View] │
│  R 22,000 / R 30,000 (73%)  ━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Expires in 15 days ⏰                                   │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Filter tabs for different retainer states
- Search by matter name or client
- Sort by balance, percentage, last activity, expiry date
- Visual indicators for warnings (low balance, expiring)
- Click to navigate to matter detail page

## Custom Hooks

### useRetainer Hook

```typescript
export function useRetainer(matterId: string) {
  const queryClient = useQueryClient();

  // Fetch retainer for matter
  const { data: retainer, isLoading, error } = useQuery({
    queryKey: ['retainer', matterId],
    queryFn: () => RetainerService.getByMatterId(matterId),
  });

  // Fetch retainer summary
  const { data: summary } = useQuery({
    queryKey: ['retainer-summary', retainer?.id],
    queryFn: () => RetainerService.getSummary(retainer!.id),
    enabled: !!retainer?.id,
  });

  // Create retainer mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRetainerRequest) => RetainerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['retainer', matterId]);
      queryClient.invalidateQueries(['retainers']);
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: (data: DepositRequest) => RetainerService.deposit(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['retainer-summary', retainer?.id]);
      queryClient.invalidateQueries(['retainer-transactions', retainer?.id]);
    },
  });

  // Drawdown mutation
  const drawdownMutation = useMutation({
    mutationFn: (data: DrawdownRequest) => RetainerService.drawdown(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['retainer-summary', retainer?.id]);
      queryClient.invalidateQueries(['retainer-transactions', retainer?.id]);
    },
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: ({ amount, reason }: { amount: number; reason: string }) =>
      RetainerService.refund(retainer!.id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['retainer-summary', retainer?.id]);
      queryClient.invalidateQueries(['retainer-transactions', retainer?.id]);
    },
  });

  return {
    retainer,
    summary,
    isLoading,
    error,
    createRetainer: createMutation.mutate,
    addDeposit: depositMutation.mutate,
    applyToInvoice: drawdownMutation.mutate,
    processRefund: refundMutation.mutate,
    isCreating: createMutation.isPending,
    isDepositing: depositMutation.isPending,
    isDrawingDown: drawdownMutation.isPending,
    isRefunding: refundMutation.isPending,
  };
}
```

### useRetainerTransactions Hook

```typescript
export function useRetainerTransactions(retainerId: string | undefined) {
  return useQuery({
    queryKey: ['retainer-transactions', retainerId],
    queryFn: () => RetainerService.getTransactionHistory(retainerId!),
    enabled: !!retainerId,
  });
}
```

### useAllRetainers Hook

```typescript
export function useAllRetainers() {
  const { data: lowBalance } = useQuery({
    queryKey: ['retainers', 'low-balance'],
    queryFn: () => RetainerService.getLowBalanceRetainers(),
  });

  const { data: expiring } = useQuery({
    queryKey: ['retainers', 'expiring'],
    queryFn: () => RetainerService.getExpiringRetainers(30),
  });

  return {
    lowBalanceRetainers: lowBalance || [],
    expiringRetainers: expiring || [],
  };
}
```

## Error Handling

### Error Scenarios

1. **Insufficient Balance for Drawdown**
   - Detection: API validation
   - Error Message: "Insufficient retainer balance. Available: R[balance], Requested: R[amount]"
   - Recovery: Allow user to adjust amount or add deposit first

2. **Retainer Not Found**
   - Detection: API returns null
   - Error Message: "No active retainer found for this matter"
   - Recovery: Offer to create new retainer

3. **Invalid Amount**
   - Detection: Client-side validation
   - Error Message: "Amount must be greater than zero"
   - Recovery: Clear error on valid input

4. **Refund Exceeds Balance**
   - Detection: API validation
   - Error Message: "Refund amount (R[amount]) exceeds available balance (R[balance])"
   - Recovery: Show maximum refundable amount

5. **Transaction Date in Future**
   - Detection: Client-side validation
   - Error Message: "Transaction date cannot be in the future"
   - Recovery: Reset to today's date

6. **Cancelled Retainer Transaction Attempt**
   - Detection: API validation
   - Error Message: "Cannot perform transactions on a cancelled retainer"
   - Recovery: Suggest renewing retainer or creating new one

## Visual Design System

### Color Coding

**Balance Status Colors**:
- **Green** (#10B981): Balance > 50% remaining
- **Yellow** (#F59E0B): Balance 20-50% remaining
- **Red** (#EF4444): Balance < 20% remaining

**Transaction Type Colors**:
- **Green** (#10B981): Deposits (positive transactions)
- **Red** (#EF4444): Drawdowns (negative transactions)
- **Orange** (#F97316): Refunds (special transactions)

### Typography

- **Balance Amount**: 2xl font, bold, color-coded
- **Percentage**: lg font, medium weight
- **Transaction Amounts**: base font, medium weight, color-coded
- **Descriptions**: sm font, regular weight, gray

### Icons

- 💰 Retainer/Money icon
- ↑ Deposit/Increase icon
- ↓ Drawdown/Decrease icon
- ⟲ Refund/Return icon
- ⚠️ Warning icon (low balance)
- ⏰ Clock icon (expiring soon)
- ✓ Success/Checkmark icon
- ✕ Error/Close icon

## Mobile Responsiveness

### Mobile Adaptations

1. **RetainerBalanceCard**
   - Stack elements vertically
   - Full-width progress bar
   - Action buttons in vertical stack or bottom sheet

2. **Transaction History**
   - Compact card layout
   - Swipe to reveal actions
   - Collapsible transaction details

3. **Modals**
   - Full-screen on mobile
   - Bottom sheet for quick actions
   - Numeric keyboard for amount inputs

4. **Dashboard Widget**
   - Horizontal scroll for stats cards
   - Collapsed recent activity (expandable)

5. **Retainers List**
   - Single column layout
   - Larger tap targets
   - Pull-to-refresh

## Integration Points

### Matter Detail Page Integration

Add new "Retainer" section after "Details" section:

```typescript
// In MatterDetailPage.tsx
<div className="space-y-6">
  <MatterDetailsSection />
  
  {/* New Retainer Section */}
  {retainer ? (
    <RetainerSection matterId={matterId} />
  ) : (
    <EmptyRetainerState onCreateRetainer={handleCreateRetainer} />
  )}
  
  <TimeEntriesSection />
  <InvoicesSection />
</div>
```

### Invoice Generation Integration

Modify invoice creation flow to check for retainer:

```typescript
// In InvoiceCreationModal.tsx
const { retainer, summary } = useRetainer(matterId);

// Show retainer application prompt if available
{retainer && summary && summary.currentBalance > 0 && (
  <RetainerApplicationPrompt
    retainerId={retainer.id}
    availableBalance={summary.currentBalance}
    invoiceAmount={invoiceTotal}
    onApply={handleApplyRetainer}
    onSkip={() => setShowRetainerPrompt(false)}
  />
)}
```

### Dashboard Integration

Add retainer widget to dashboard:

```typescript
// In DashboardPage.tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <MattersSummaryWidget />
  <InvoicesSummaryWidget />
  <RetainerSummaryWidget /> {/* New */}
  <UpcomingDeadlinesWidget />
</div>
```

### Matter Card Integration

Add retainer badge to matter cards:

```typescript
// In MatterCard.tsx
{retainer && (
  <RetainerBadge
    balance={retainer.trust_account_balance}
    percentageRemaining={calculatePercentage(retainer)}
    onClick={() => setShowRetainerPreview(true)}
  />
)}
```

## Testing Strategy

### Unit Tests

1. **Component Tests**
   - RetainerBalanceCard: rendering, color coding, action buttons
   - CreateRetainerModal: form validation, submission
   - AddDepositModal: amount validation, balance calculation
   - ApplyRetainerModal: max amount validation, balance updates
   - RetainerTransactionHistory: list rendering, pagination
   - RetainerBadge: color coding, tooltip

2. **Hook Tests**
   - useRetainer: data fetching, mutations, cache invalidation
   - useRetainerTransactions: transaction loading, filtering
   - useAllRetainers: multiple queries, aggregation

3. **Utility Tests**
   - Balance calculation functions
   - Percentage calculation
   - Color determination logic
   - Date formatting

### Integration Tests

1. **Retainer Lifecycle**
   - Create retainer → Verify in database
   - Add deposit → Verify balance update
   - Apply to invoice → Verify drawdown and invoice update
   - Process refund → Verify balance reduction
   - Cancel retainer → Verify status change

2. **Invoice Integration**
   - Create invoice with retainer → Verify prompt appears
   - Apply retainer to invoice → Verify balance due calculation
   - Generate invoice PDF → Verify retainer application shown

3. **Dashboard Integration**
   - Create multiple retainers → Verify widget stats
   - Low balance retainer → Verify warning in widget
   - Expiring retainer → Verify alert in widget

### End-to-End Tests

1. **Complete Retainer Flow**
   ```
   1. Navigate to matter detail page
   2. Click "Create Retainer"
   3. Fill in retainer details with initial deposit
   4. Submit and verify success
   5. Verify balance card appears
   6. Add another deposit
   7. Verify balance updates
   8. Create invoice
   9. Apply retainer to invoice
   10. Verify invoice balance due is reduced
   11. View transaction history
   12. Verify all transactions listed
   ```

2. **Low Balance Warning Flow**
   ```
   1. Create retainer with small amount
   2. Apply multiple drawdowns
   3. Verify balance drops below threshold
   4. Verify warning appears on balance card
   5. Verify warning appears in dashboard widget
   6. Add deposit to replenish
   7. Verify warning disappears
   ```

3. **Mobile Flow**
   ```
   1. Access matter on mobile device
   2. View retainer balance
   3. Add deposit using mobile form
   4. Verify numeric keyboard appears
   5. Submit and verify success
   6. View transaction history
   7. Verify mobile-optimized layout
   ```

## Performance Optimization

### Caching Strategy

1. **Query Caching**
   - Cache retainer data per matter (5 min TTL)
   - Cache transaction history (2 min TTL)
   - Cache dashboard stats (1 min TTL)

2. **Optimistic Updates**
   - Immediately update UI on deposit/drawdown
   - Rollback on error
   - Show loading states during mutation

3. **Lazy Loading**
   - Load transaction history on demand
   - Paginate long transaction lists
   - Defer dashboard widget loading

### Database Optimization

- Existing indexes on retainer_agreements and trust_transactions tables are sufficient
- Use database functions for balance calculations (already implemented)
- Leverage RLS policies for security (already implemented)

## Security Considerations

### Access Control

- All retainer operations use existing RLS policies
- Advocates can only access their own retainers
- Transaction history respects advocate_id filtering

### Data Validation

- Client-side validation for all form inputs
- Server-side validation in existing RetainerService
- Amount validation to prevent negative or zero values
- Balance checks before drawdowns

### Audit Trail

- All transactions automatically logged with timestamps
- User ID captured for all operations
- Transaction history provides complete audit trail

## Accessibility

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Ensure all text meets 4.5:1 contrast ratio
   - Don't rely solely on color for status (use icons too)

2. **Keyboard Navigation**
   - All modals keyboard accessible
   - Tab order logical and intuitive
   - Escape key closes modals

3. **Screen Readers**
   - Proper ARIA labels on all interactive elements
   - Announce balance changes after transactions
   - Descriptive button labels

4. **Focus Management**
   - Focus trapped in modals
   - Focus returned to trigger element on close
   - Visible focus indicators

## Implementation Phases

### Phase 1: Core UI (Week 1-2)
- RetainerBalanceCard component
- CreateRetainerModal component
- AddDepositModal component
- Matter detail page integration
- Basic styling and responsiveness

### Phase 2: Transaction Management (Week 2-3)
- ApplyRetainerModal component
- RetainerTransactionHistory component
- Invoice generation integration
- Refund processing UI

### Phase 3: Dashboard & Overview (Week 3-4)
- RetainerSummaryWidget component
- RetainersListPage component
- RetainerBadge on matter cards
- Dashboard integration

### Phase 4: Polish & Enhancement (Week 4)
- Mobile optimization
- Accessibility improvements
- Performance optimization
- User testing and refinements

## Success Metrics

### Technical Metrics
- Component render time < 100ms
- Modal open time < 200ms
- Transaction submission < 500ms
- Zero console errors

### User Metrics
- 60%+ adoption within first month
- 90%+ ease-of-use rating
- 80%+ reduction in manual tracking time
- 30%+ increase in timely payments

### Business Metrics
- Improved cash flow management
- Reduced billing disputes
- Increased client satisfaction
- Better financial visibility
