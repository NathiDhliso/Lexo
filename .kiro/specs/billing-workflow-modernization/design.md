# Billing Workflow Modernization Design Document

## Overview

This design document outlines the implementation strategy for modernizing LexoHub's billing workflow to better align with South African advocates' traditional practice patterns. The design shifts from a time-tracking-centric model to a billing-model-agnostic approach where brief fees (fixed fees) and time-based billing are treated as equally valid workflows. The system will adapt to the user's preferred billing method through matter-level preferences, user defaults, and progressive disclosure of complexity.

The design addresses 12 critical requirements across billing model selection, trust account management, invoice numbering flexibility, disbursement handling, workflow streamlining, and mobile optimization.

## Architecture

### Billing Model Architecture

The system will implement a **Strategy Pattern** for billing models, allowing different billing behaviors to be swapped at the matter level without affecting the core matter management logic.

```typescript
interface BillingStrategy {
  type: 'brief-fee' | 'time-based' | 'quick-opinion';
  calculateInvoiceAmount(matter: Matter): number;
  getRequiredFields(): string[];
  getOptionalFields(): string[];
  shouldShowTimeTracking(): boolean;
  getMilestones(): Milestone[];
}
```

### Trust Account Architecture

Trust accounts will be implemented as a separate financial entity with its own ledger, distinct from business accounts. All trust transactions will maintain a complete audit trail for Legal Practice Council compliance.

```typescript
interface TrustAccount {
  id: string;
  advocateId: string;
  bankDetails: BankDetails;
  balance: number; // Must never be negative
  transactions: TrustTransaction[];
}
```

### User Preference System

User billing preferences will be stored at the advocate level and used to customize the UI, set defaults, and determine which features are prominently displayed.

```typescript
interface AdvocateBillingPreferences {
  defaultBillingModel: 'brief-fee' | 'time-based' | 'quick-opinion';
  primaryWorkflow: 'mostly-brief-fees' | 'mixed' | 'primarily-time-based';
  dashboardWidgets: string[]; // Customizable widget visibility
  invoiceNumberingMode: 'strict-sequential' | 'flexible';
  showTimeTrackingByDefault: boolean;
}
```

## Components and Interfaces

### 1. Billing Model Selector Component

**Location:** `src/components/matters/BillingModelSelector.tsx`

**Purpose:** Allows users to select billing model during matter creation with clear descriptions of each option.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ How will you bill for this matter?                 │
├─────────────────────────────────────────────────────┤
│ ○ Fixed Brief Fee (Recommended)                    │
│   Standard brief fee arrangement. No time tracking.│
│                                                     │
│ ○ Quick Opinion/Consultation                       │
│   Flat rate for quick legal opinions.              │
│                                                     │
│ ○ Time-Based Billing                               │
│   Track time and bill hourly. For extended work.   │
└─────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface BillingModelSelectorProps {
  value: BillingModel;
  onChange: (model: BillingModel) => void;
  defaultModel: BillingModel; // From user preferences
  showDescription?: boolean;
}
```



### 2. Matter Workbench Adaptive UI

**Location:** `src/pages/MatterWorkbenchPage.tsx` (enhancement)

**Purpose:** Dynamically shows/hides features based on the matter's billing model.

**Brief Fee Mode:**
- Hide: Timer widgets, time entry forms, hourly rate fields
- Show: Fee milestones, payment schedule, disbursement tracking
- Optional: Collapsible "Track time for internal analysis" section

**Time-Based Mode:**
- Show: Timer widgets, time entry forms, hourly rates, time reports
- Show: Budget tracking, scope amendments
- Show: Time vs. budget charts

**Implementation:**
```typescript
const MatterWorkbenchAdaptiveUI: React.FC<{ matter: Matter }> = ({ matter }) => {
  const billingStrategy = useBillingStrategy(matter.billingModel);
  
  return (
    <>
      {billingStrategy.shouldShowTimeTracking() && <TimeTrackingWidget />}
      {!billingStrategy.shouldShowTimeTracking() && <FeeMilestonesWidget />}
      <DisbursementsTab /> {/* Always visible */}
      {billingStrategy.type === 'brief-fee' && (
        <Collapsible title="Advanced: Track time for internal analysis">
          <TimeEntryForm optional={true} />
        </Collapsible>
      )}
    </>
  );
};
```

### 3. Onboarding Billing Preference Wizard

**Location:** `src/components/onboarding/BillingPreferenceWizard.tsx`

**Purpose:** Captures user's primary billing workflow during initial setup to customize their experience.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ How do you typically bill your clients?            │
├─────────────────────────────────────────────────────┤
│ ○ Mostly brief fees                                │
│   I primarily work on fixed-fee brief arrangements │
│   and rarely track time.                           │
│                                                     │
│ ○ Mix of brief fees and hourly                     │
│   I use both billing methods depending on the      │
│   matter type.                                     │
│                                                     │
│ ○ Primarily time-based                             │
│   I track time for most matters and bill hourly.   │
│                                                     │
│ [Continue]                                         │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- "Mostly brief fees" → Sets default to brief-fee, hides time KPIs from dashboard
- "Mix" → Shows all features, no defaults
- "Primarily time-based" → Sets default to time-based, shows time widgets prominently

### 4. Trust Account Management Interface

**Location:** `src/components/trust-accounts/TrustAccountDashboard.tsx`

**Purpose:** Provides complete trust account management with LPC compliance features.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Trust Account                                       │
│ Balance: R 125,450.00 ✓                            │
│ Last Transaction: 2 hours ago                      │
├─────────────────────────────────────────────────────┤
│ Recent Transactions                                 │
│ ┌─────────────────────────────────────────────────┐│
│ │ ↓ Received from Wilson & Partners  R 25,000.00 ││
│ │   Matter: Contract Dispute         2 hours ago  ││
│ │                                                  ││
│ │ ↑ Transfer to Business Account     R 15,000.00 ││
│ │   Matter: Opinion - Acme Corp      Yesterday    ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ [Record Receipt] [Transfer to Business] [Reconcile]│
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- Visual distinction: Trust (blue) vs Business (green) accounts
- Negative balance warning (critical alert)
- Trust receipt generation with legal disclosures
- Transfer wizard with matter linking
- Reconciliation reports for LPC audits



### 5. Flexible Invoice Numbering System

**Location:** `src/components/settings/InvoiceNumberingSettings.tsx`

**Purpose:** Allows advocates to choose between strict sequential numbering and flexible numbering with audit trail.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Invoice Numbering Mode                              │
├─────────────────────────────────────────────────────┤
│ ○ Strict Sequential (SARS Compliant)               │
│   No gaps allowed. Voids tracked with explanations.│
│   Best for: Advocates who only use this system     │
│                                                     │
│ ● Flexible with Gaps (SARS Compliant)              │
│   Allow manual numbers. Gaps logged in audit trail.│
│   Best for: Advocates who issue some invoices      │
│   outside the system                               │
│                                                     │
│ Current Sequence: INV-2025-0042                    │
│ Next Invoice: INV-2025-0043                        │
│                                                     │
│ Year Reset: ○ Automatic  ● Manual                  │
└─────────────────────────────────────────────────────┘
```

**Audit Trail:**
```typescript
interface InvoiceNumberAuditEntry {
  invoiceNumber: string;
  action: 'created' | 'voided' | 'gap-detected';
  reason?: string;
  timestamp: Date;
  userId: string;
}
```

### 6. Smart Disbursement VAT Component

**Location:** `src/components/disbursements/SmartDisbursementForm.tsx`

**Purpose:** Intelligently suggests VAT applicability based on disbursement type with easy override.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Log Disbursement                                    │
├─────────────────────────────────────────────────────┤
│ Type: [Court filing fee ▼]                         │
│                                                     │
│ Amount: R 500.00                                    │
│                                                     │
│ VAT Applicable: ☐ Yes  ☑ No                        │
│ ℹ️ Court fees are typically VAT-exempt             │
│                                                     │
│ Description: High Court filing fee                 │
│                                                     │
│ [Save Disbursement]                                │
└─────────────────────────────────────────────────────┘
```

**VAT Rules Engine:**
```typescript
const disbursementVATRules: Record<string, boolean> = {
  'court-filing-fee': false,
  'transcript': false,
  'sheriff-fees': false,
  'travel': true,
  'accommodation': true,
  'printing': true,
  'courier': true,
};

function suggestVAT(disbursementType: string): boolean {
  return disbursementVATRules[disbursementType] ?? true; // Default to VAT applicable
}
```

### 7. Urgent Matter Quick Capture

**Location:** `src/components/matters/UrgentMatterQuickCapture.tsx`

**Purpose:** Streamlined 2-step matter creation for urgent briefs that bypasses pro forma approval.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ 🚨 Urgent Brief Capture                            │
├─────────────────────────────────────────────────────┤
│ Step 1: Essential Details                          │
│                                                     │
│ Attorney: [Sarah Wilson ▼]                         │
│ Firm: Wilson & Partners (auto-filled)              │
│                                                     │
│ Matter Type: [Court appearance ▼]                  │
│ Agreed Fee: R 15,000                               │
│                                                     │
│ Brief Date: [Today ▼]                              │
│ Court Date: [Select date]                          │
│                                                     │
│ [Next: Documents]                                  │
└─────────────────────────────────────────────────────┘
```

**Workflow:**
1. Step 1: Essential details (attorney, fee, dates)
2. Step 2: Optional document linking
3. Auto-generate confirmation email to attorney
4. Skip pro forma approval entirely
5. Matter immediately moves to "Active" status



### 8. Simplified Attorney Connection

**Location:** `src/components/matters/AttorneyQuickSelect.tsx`

**Purpose:** Allows manual attorney entry without requiring formal firm setup and invitation.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Select Attorney                                     │
├─────────────────────────────────────────────────────┤
│ ● Quick Select (Recurring Attorneys)               │
│   [Sarah Wilson - Wilson & Partners ▼]             │
│   Last worked with: 2 weeks ago (3 matters)        │
│                                                     │
│ ○ Enter Manually (New Attorney)                    │
│   Name: [                    ]                     │
│   Email: [                   ]                     │
│   Firm: [                    ]                     │
│   Phone: [                   ]                     │
│                                                     │
│   ☐ Send invitation to portal (optional)           │
│                                                     │
│ [Continue]                                         │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Quick select shows attorneys from previous matters (auto-filled details)
- Manual entry creates attorney record without requiring registration
- Invitation is optional, not mandatory
- Invoices sent via email if attorney not registered
- When attorney later registers, system offers to link historical matters

### 9. Scope Amendment for Brief Fees

**Location:** `src/components/matters/ScopeAmendmentModal.tsx`

**Purpose:** Allows advocates to request scope changes and additional fees for brief fee matters.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Request Scope Amendment                             │
├─────────────────────────────────────────────────────┤
│ Original Scope:                                     │
│ Opinion on contract validity                        │
│ Original Fee: R 8,500                               │
│                                                     │
│ Expanded Scope:                                     │
│ [Opinion + draft response to opposing counsel]     │
│                                                     │
│ Additional Fee: R [5,000]                           │
│                                                     │
│ Reason for Amendment:                               │
│ [Client requested additional drafting work after   │
│  initial opinion was delivered]                    │
│                                                     │
│ [Send to Attorney for Approval]                    │
└─────────────────────────────────────────────────────┘
```

**Workflow:**
1. Advocate submits scope amendment request
2. Attorney receives email notification with approval link
3. Attorney approves/declines via portal or email
4. If approved, matter fee updated automatically
5. Audit trail entry created
6. Invoice itemizes original + amendment fees

### 10. Positive Payment Tracking UI

**Location:** `src/components/invoices/PaymentTrackingDashboard.tsx` (redesign)

**Purpose:** Reframes payment tracking with positive, action-oriented language.

**Before (Stressful):**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ OVERDUE INVOICES: 8                             │
│ 🔴 Critical: R 45,000 (90+ days)                   │
│ 🟠 Urgent: R 23,000 (60-90 days)                   │
│ 🟡 Warning: R 12,000 (30-60 days)                  │
└─────────────────────────────────────────────────────┘
```

**After (Positive):**
```
┌─────────────────────────────────────────────────────┐
│ 💰 Collection Opportunities                        │
│ ✓ 85% collected this month (R 125,000)            │
│                                                     │
│ 📋 Invoices Needing Attention: 8                   │
│ • 3 invoices: Follow-up suggested (30+ days)       │
│ • 5 invoices: Payment pending (< 30 days)          │
│                                                     │
│ [View Collection Report] [Send Reminders]          │
└─────────────────────────────────────────────────────┘
```

**Language Changes:**
- "Overdue" → "Needs attention" or "Follow-up suggested"
- "Aging debt" → "Collection opportunities"
- "Days overdue" → "Days since invoice"
- Red/orange warnings → Neutral blue with action prompts



### 11. Mobile Quick Actions Menu

**Location:** `src/components/mobile/MobileQuickActionsMenu.tsx`

**Purpose:** Provides one-tap access to essential actions optimized for mobile use.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Quick Actions                                       │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │    💰    │ │    📝    │ │    📄    │            │
│ │  Record  │ │   Log    │ │   Send   │            │
│ │ Payment  │ │Disburse. │ │ Invoice  │            │
│ └──────────┘ └──────────┘ └──────────┘            │
│                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │    ⏱️    │ │    📎    │ │    📞    │            │
│ │   Log    │ │   Link   │ │  Quick   │            │
│ │   Time   │ │   Doc    │ │  Call    │            │
│ └──────────┘ └──────────┘ └──────────┘            │
└─────────────────────────────────────────────────────┘
```

**Mobile-Optimized Features:**
- Large touch targets (minimum 48px)
- Swipe gestures for navigation
- Voice-to-text for descriptions
- Offline mode with sync queue
- WhatsApp share for invoices
- Camera integration for receipt capture

**Simplified Mobile Matter Creation:**
```
Step 1: Attorney + Fee
Step 2: Done (optional: add documents)
```

### 12. Brief Fee Template System

**Location:** `src/components/templates/BriefFeeTemplateManager.tsx`

**Purpose:** Pre-configured templates for common matter types to enable <60 second invoicing.

**Visual Design:**
```
┌─────────────────────────────────────────────────────┐
│ Brief Fee Templates                                 │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐│
│ │ 📄 Opinion                                      ││
│ │ Base Fee: R 8,500 • Used 15 times this year    ││
│ │ Avg Fee: R 8,500 • Typical Disbursements: R 250││
│ │ [Use Template] [Edit]                          ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ ⚖️ Court Appearance                             ││
│ │ Base Fee: R 15,000 • Used 8 times this year    ││
│ │ Avg Fee: R 16,250 • Typical Disbursements: R 0 ││
│ │ [Use Template] [Edit]                          ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ [+ Create New Template]                            │
└─────────────────────────────────────────────────────┘
```

**Template Structure:**
```typescript
interface BriefFeeTemplate {
  id: string;
  name: string;
  matterType: string;
  baseFee: number;
  seniorityMultiplier?: number; // e.g., 1.5 for senior counsel
  typicalDisbursements: {
    type: string;
    amount: number;
    vatApplicable: boolean;
  }[];
  usageCount: number;
  averageFee: number;
}
```

**Quick Invoice Flow:**
1. Select matter
2. Click "Generate Invoice"
3. System suggests template based on matter type
4. Pre-fills fee and disbursements
5. User reviews and clicks "Send"
6. Total time: <60 seconds

## Data Models

### Billing Model Enum
```typescript
enum BillingModel {
  BRIEF_FEE = 'brief-fee',
  TIME_BASED = 'time-based',
  QUICK_OPINION = 'quick-opinion',
}
```

### Matter with Billing Model
```typescript
interface Matter {
  // ... existing fields
  billingModel: BillingModel;
  agreedFee?: number; // For brief fees
  hourlyRate?: number; // For time-based
  milestones?: FeeMilestone[]; // For brief fees
  scopeAmendments?: ScopeAmendment[];
}
```

### Trust Account Models
```typescript
interface TrustAccount {
  id: string;
  advocateId: string;
  accountNumber: string;
  bankName: string;
  balance: number;
  transactions: TrustTransaction[];
}

interface TrustTransaction {
  id: string;
  type: 'receipt' | 'transfer' | 'refund';
  amount: number;
  matterId: string;
  description: string;
  timestamp: Date;
  receiptNumber?: string;
}

interface TrustTransfer {
  id: string;
  fromTrust: string;
  toBusiness: string;
  amount: number;
  matterId: string;
  reason: string;
  timestamp: Date;
  auditTrail: string;
}
```



### Advocate Billing Preferences
```typescript
interface AdvocateBillingPreferences {
  advocateId: string;
  defaultBillingModel: BillingModel;
  primaryWorkflow: 'mostly-brief-fees' | 'mixed' | 'primarily-time-based';
  dashboardWidgets: {
    showTimeTracking: boolean;
    showCollectionOpportunities: boolean;
    showTrustAccountBalance: boolean;
  };
  invoiceNumbering: {
    mode: 'strict-sequential' | 'flexible';
    currentSequence: string;
    yearResetMode: 'automatic' | 'manual';
  };
  templates: BriefFeeTemplate[];
}
```

### Scope Amendment
```typescript
interface ScopeAmendment {
  id: string;
  matterId: string;
  originalScope: string;
  expandedScope: string;
  originalFee: number;
  additionalFee: number;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  requestedAt: Date;
  respondedAt?: Date;
  attorneyResponse?: string;
}
```

### Disbursement with Smart VAT
```typescript
interface Disbursement {
  id: string;
  matterId: string;
  type: string;
  amount: number;
  vatApplicable: boolean;
  vatSuggested: boolean; // Indicates if VAT was auto-suggested
  description: string;
  date: Date;
  receiptUrl?: string;
}
```

## Error Handling

### Trust Account Negative Balance
```typescript
// Critical error - Legal Practice Council violation
if (trustAccount.balance < 0) {
  throw new TrustAccountViolationError(
    'Trust account balance cannot be negative. This violates Legal Practice Council regulations.'
  );
  // Display prominent red alert on all pages
  // Block all trust account operations until resolved
  // Send email notification to advocate
}
```

### Invoice Numbering Conflicts
```typescript
// Flexible mode: Log gap in audit trail
if (mode === 'flexible' && hasGap(invoiceNumber)) {
  auditLog.create({
    action: 'gap-detected',
    invoiceNumber,
    reason: userProvidedReason,
    timestamp: new Date(),
  });
}

// Strict mode: Prevent gap
if (mode === 'strict-sequential' && hasGap(invoiceNumber)) {
  throw new InvoiceNumberingError(
    'Invoice number must be sequential. Next number: ' + nextSequentialNumber
  );
}
```

### Scope Amendment Timeout
```typescript
// If attorney doesn't respond within 7 days
if (daysSinceRequest > 7 && amendment.status === 'pending') {
  // Send reminder email
  // Show "Pending approval" badge on matter
  // Offer "Proceed without approval" option with disclaimer
}
```

## Testing Strategy

### Unit Tests
- Billing strategy selection logic
- VAT suggestion rules engine
- Trust account balance calculations
- Invoice numbering sequence validation
- Template fee calculations

### Integration Tests
- Matter creation with different billing models
- Trust account transaction flows
- Scope amendment approval workflow
- Invoice generation from templates
- Mobile offline sync

### User Acceptance Tests
- Brief fee advocate workflow (no time tracking)
- Time-based advocate workflow (with time tracking)
- Mixed workflow advocate (both models)
- Trust account compliance scenarios
- Mobile quick actions usability

### Compliance Tests
- SARS invoice numbering compliance (both modes)
- Legal Practice Council trust account regulations
- VAT treatment accuracy for disbursements
- Audit trail completeness

## Implementation Phases

### Phase 1: Billing Model Foundation (Week 1-2)
- Implement billing strategy pattern
- Add billing model selection to matter creation
- Create onboarding preference wizard
- Update matter workbench to hide/show features based on model
- Add user preference storage and retrieval

### Phase 2: Trust Account System (Week 2-3)
- Create trust account data models and database schema
- Implement trust account dashboard
- Build receipt recording and transfer workflows
- Add negative balance validation and alerts
- Create reconciliation reports

### Phase 3: Invoice Numbering & Disbursements (Week 3-4)
- Implement flexible invoice numbering with audit trail
- Build invoice numbering settings UI
- Create smart disbursement VAT suggestion engine
- Add custom disbursement type management
- Implement VAT reporting

### Phase 4: Workflow Streamlining (Week 4-5)
- Build urgent matter quick capture
- Implement simplified attorney connection
- Add scope amendment for brief fees
- Create positive payment tracking UI redesign
- Build brief fee template system

### Phase 5: Mobile Optimization (Week 5-6)
- Create mobile quick actions menu
- Implement simplified mobile matter creation
- Add offline mode with sync queue
- Integrate voice-to-text
- Add WhatsApp sharing
- Implement camera receipt capture

### Phase 6: Testing & Refinement (Week 6-7)
- Conduct comprehensive testing
- Perform compliance verification
- Run user acceptance testing
- Gather feedback and iterate
- Prepare documentation

## Security Considerations

- Trust account transactions require additional authentication
- Audit trail is immutable and tamper-proof
- Invoice numbering changes logged with user ID and timestamp
- Scope amendments require attorney email verification
- Mobile offline data encrypted on device
- Trust account reports require elevated permissions

## Performance Considerations

- Billing model strategy cached per matter
- Template suggestions pre-computed and indexed
- Trust account balance calculated incrementally
- Mobile sync uses delta updates, not full sync
- Dashboard widgets lazy-loaded based on preferences
- Invoice generation optimized for <2 second completion

## Accessibility

- All billing model options have clear descriptions
- Trust account alerts use both color and text
- Mobile quick actions have large touch targets (48px minimum)
- Voice-to-text available for all text inputs
- Screen reader support for all financial data
- Keyboard shortcuts for common actions

## Migration Strategy

### Existing Matters
- Default existing matters to "time-based" model to preserve current behavior
- Offer bulk update tool: "Convert to brief fee" for selected matters
- Maintain backward compatibility with existing time entries

### Existing Users
- Prompt existing users to set billing preference on next login
- Analyze historical data to suggest preference
- Allow users to skip and use default (mixed mode)

### Data Migration
- Create trust account records for all advocates
- Migrate existing invoice sequences to new numbering system
- Preserve all historical invoice numbers in audit trail
- Convert existing disbursements to new VAT-aware format

## Monitoring & Analytics

### Key Metrics
- Billing model distribution (brief-fee vs time-based)
- Template usage and time-to-invoice
- Trust account transaction volume
- Mobile vs desktop usage
- Scope amendment approval rate
- Invoice numbering mode preference

### Alerts
- Trust account negative balance (critical)
- Invoice numbering gaps (if strict mode)
- Scope amendment pending >7 days
- Mobile sync failures
- Template usage anomalies

## Documentation Requirements

- User guide: Choosing billing models
- User guide: Trust account management
- User guide: Invoice numbering modes
- User guide: Mobile quick actions
- Developer guide: Billing strategy pattern
- Compliance guide: SARS and LPC requirements
- API documentation: New endpoints
- Migration guide: For existing users
