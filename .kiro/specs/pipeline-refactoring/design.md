# Design Document

## Overview

This design document outlines the architectural approach for refactoring the LexoHub billing pipeline. The refactoring transforms a fragmented system with significant technical debt into a clean, unified architecture following the attorney-first model with consistent logging patterns across the Pro Forma → WIP → Invoice pipeline.

### Design Principles

1. **Code Reuse Over Rewrite**: Adapt existing, proven components rather than building from scratch
2. **Consistency**: Use identical patterns for services, time, and expenses throughout the pipeline
3. **Atomic Rule Enforcement**: Invoices must only reference actual logged work, never estimates
4. **Incremental Migration**: Support both old and new data structures during transition
5. **Minimal New Code**: Leverage existing services, modals, and UI components wherever possible

### Architecture Goals

- Remove all obsolete code to establish a clean foundation
- Create a unified backend structure for all billable work types
- Provide consistent frontend interfaces across the pipeline
- Enforce data integrity through proper foreign key relationships
- Maintain backward compatibility during migration

## Architecture

### System Context

```
┌─────────────────────────────────────────────────────────────┐
│                     LexoHub Billing Pipeline                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Pro Forma   │───▶│  WIP Tracking│───▶│   Invoice    │  │
│  │  (Estimate)  │    │   (Actuals)  │    │ (Billing)    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         └────────────────────┴────────────────────┘          │
│                              │                                │
│                    ┌─────────▼─────────┐                     │
│                    │ Universal Logging  │                     │
│                    │     Toolset        │                     │
│                    │ • Services         │                     │
│                    │ • Time Entries     │                     │
│                    │ • Expenses         │                     │
│                    └────────────────────┘                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Firm Management
     │
     ├─▶ Matter Creation (requires firm_id)
     │        │
     │        ├─▶ Pro Forma Request
     │        │        │
     │        │        ├─▶ Log Services (estimate)
     │        │        ├─▶ Log Time (estimate)
     │        │        └─▶ Log Expenses (estimate)
     │        │
     │        ├─▶ WIP Tracking
     │        │        │
     │        │        ├─▶ Log Services (actual)
     │        │        ├─▶ Log Time (actual)
     │        │        └─▶ Log Expenses (actual)
     │        │
     │        └─▶ Invoice Generation
     │                 │
     │                 └─▶ Read ONLY from WIP (actual)
     │                     NOT from Pro Forma (estimate)
     │
     └─▶ Cloud Document Linking
```

## Components and Interfaces

### Phase 0: Technical Debt Removal

#### Files to Delete

**Contradictory "Automatic Population" Feature:**
- `src/services/aws-document-processing.service.ts`
- `src/services/api/document-intelligence.service.ts`
- `src/components/document-processing/` (entire folder)
- `src/components/matters/DocumentProcessingModal.tsx`
- `src/components/common/FileUpload.tsx`
- `src/components/forms/FormAssistant.tsx`
- `src/components/forms/FormAssistantExample.tsx`

**Obsolete "Briefs" Concept:**
- `src/services/api/brief-api.service.ts`
- `src/components/briefs/BriefsList.tsx`

**Obsolete Pro Forma Creation UI:**
- `src/components/proforma/AttorneyServiceSelector.tsx`
- `src/components/proforma/SmartServiceSelector.tsx`
- `src/components/proforma/CreateProFormaModal.tsx`
- `src/components/proforma/NewProFormaModal.tsx`

**Obsolete Attorney Portal (100% Debt):**
- `src/pages/attorney/` (entire folder)
- `src/components/attorney-portal/` (entire folder)

**Obsolete Type Definitions & Documentation:**
- `src/types/attorney.types.ts`
- `src/components/forms/README.md`
- `src/styles/document-types.css`

#### Deletion Strategy

1. Use file system tools to delete all listed files and folders
2. Run diagnostics to identify any remaining references
3. Remove or update import statements in remaining files
4. Verify application still compiles after deletions

### Phase 1: Attorney-First Model

#### 1.1 Firm Management Feature

**New Component: FirmsPage.tsx**
- **Location**: `src/pages/FirmsPage.tsx`
- **Adaptation Source**: `src/pages/MattersPage.tsx`
- **Reused Patterns**:
  - Page shell and layout structure
  - Search and filter UI components
  - Tab navigation (active/all)
  - Bulk action toolbar integration
  - Loading states and error handling

**Interface:**
```typescript
interface FirmsPageProps {
  onNavigate?: (page: Page) => void;
}

interface FirmFilters {
  searchTerm: string;
  status: 'active' | 'all';
  sortBy: 'name' | 'created_at' | 'matter_count';
  sortOrder: 'asc' | 'desc';
}
```

**New Component: FirmCard.tsx**
- **Location**: `src/components/firms/FirmCard.tsx`
- **Adaptation Source**: `src/components/matters/MatterCard.tsx`
- **Reused Patterns**:
  - Card layout and styling
  - Status badges
  - Action buttons (view, edit, delete)
  - Hover effects and transitions

**Interface:**
```typescript
interface FirmCardProps {
  firm: Firm;
  onViewDetails?: (firm: Firm) => void;
  onEdit?: (firm: Firm) => void;
  onDelete?: (firm: Firm) => void;
  matterCount?: number;
}

interface Firm {
  id: string;
  firm_name: string;
  attorney_name: string;
  practice_number?: string;
  phone_number?: string;
  email: string;
  address?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

**Data Service: Reuse attorney.service.ts**
- **Location**: `src/services/api/attorney.service.ts` (existing)
- **Methods to Use**:
  - `getAttorneyById()` - Fetch single firm
  - `registerAttorney()` - Create new firm
  - `updateAttorney()` - Update firm details
  - No new service file needed

#### 1.2 Matter Creation Refactor

**Component: MatterWorkbenchPage.tsx**
- **Location**: `src/pages/MatterWorkbenchPage.tsx` (existing, refactor)
- **Changes**:
  - Remove all "Automatic Population" state and handlers
  - Remove "Attorney Information" step from wizard
  - Add "Select Instructing Firm" dropdown in matter details step
  - Populate dropdown using `attorney.service.ts`

**Interface Updates:**
```typescript
interface MatterCreationFormData {
  // Existing fields...
  firm_id: string; // NEW: Required foreign key
  // Remove: attorney_name, attorney_email, attorney_phone, etc.
}

interface FirmSelectorProps {
  value: string;
  onChange: (firmId: string) => void;
  error?: string;
}
```

#### 1.3 Cloud Document Linking

**Component: DocumentsTab.tsx**
- **Location**: `src/components/matters/DocumentsTab.tsx` (existing, refactor)
- **Changes**:
  - Remove all references to deleted `FileUpload.tsx`
  - Add "Link from Cloud" button
  - Wire button to `useCloudStorage` hook

**Interface:**
```typescript
interface DocumentsTabProps {
  matterId: string;
  documents: Document[];
  onRefresh: () => void;
}

interface CloudLinkButtonProps {
  matterId: string;
  onLinked: (document: Document) => void;
}
```

**Reused Services:**
- `src/hooks/useCloudStorage.ts` (existing)
- `src/services/api/cloud-storage.service.ts` (existing)

### Phase 2: Universal Logging Toolset

#### 2.1 Backend: Logged Services

**Database Schema:**
```sql
CREATE TABLE logged_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES advocates(id),
  service_date DATE NOT NULL,
  description TEXT NOT NULL,
  service_type TEXT NOT NULL, -- 'consultation', 'drafting', 'research', 'court_appearance', 'other'
  estimated_hours NUMERIC(10,2),
  rate_card_id UUID REFERENCES rate_cards(id),
  unit_rate NUMERIC(10,2) NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  amount NUMERIC(15,2) NOT NULL,
  is_estimate BOOLEAN DEFAULT false, -- true for Pro Forma, false for WIP
  pro_forma_id UUID REFERENCES pro_forma_requests(id),
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logged_services_matter ON logged_services(matter_id);
CREATE INDEX idx_logged_services_advocate ON logged_services(advocate_id);
CREATE INDEX idx_logged_services_pro_forma ON logged_services(pro_forma_id);
CREATE INDEX idx_logged_services_invoice ON logged_services(invoice_id);
```

**New Service: logged-services.service.ts**
- **Location**: `src/services/api/logged-services.service.ts`
- **Adaptation Source**: `src/services/api/time-entries.service.ts`
- **Pattern**: Copy entire service structure and adapt for services

**Interface:**
```typescript
export interface LoggedService {
  id: string;
  matter_id: string;
  advocate_id: string;
  service_date: string;
  description: string;
  service_type: 'consultation' | 'drafting' | 'research' | 'court_appearance' | 'other';
  estimated_hours?: number;
  rate_card_id?: string;
  unit_rate: number;
  quantity: number;
  amount: number;
  is_estimate: boolean;
  pro_forma_id?: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LoggedServiceCreate {
  matter_id: string;
  service_date: string;
  description: string;
  service_type: string;
  estimated_hours?: number;
  rate_card_id?: string;
  unit_rate: number;
  quantity?: number;
  is_estimate?: boolean;
  pro_forma_id?: string;
}

export class LoggedServicesService {
  static async createService(data: LoggedServiceCreate): Promise<LoggedService>;
  static async updateService(id: string, updates: Partial<LoggedServiceCreate>): Promise<LoggedService>;
  static async getServicesByMatter(matterId: string, isEstimate?: boolean): Promise<LoggedService[]>;
  static async deleteService(id: string): Promise<void>;
  private static async updateMatterWIP(matterId: string): Promise<void>;
}
```

**Methods to Adapt from TimeEntryService:**
1. `createTimeEntry()` → `createService()`
2. `updateTimeEntry()` → `updateService()`
3. `getTimeEntries()` → `getServicesByMatter()`
4. `deleteTimeEntry()` → `deleteService()`
5. `updateMatterWIP()` → `updateMatterWIP()` (same logic, different table)

#### 2.2 Frontend: Service Logging Modal

**New Component: LogServiceModal.tsx**
- **Location**: `src/components/services/LogServiceModal.tsx`
- **Adaptation Source**: `src/components/time-entries/TimeEntryModal.tsx`
- **Pattern**: Copy entire modal structure and adapt for services

**Interface:**
```typescript
interface LogServiceModalProps {
  matterId: string;
  matterTitle: string;
  service?: LoggedService | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isEstimate?: boolean; // true for Pro Forma, false for WIP
}

interface ServiceFormData {
  date: string;
  service_type: string;
  description: string;
  estimated_hours: number;
  unit_rate: number;
  quantity: number;
  rate_card_id?: string;
}
```

**Reused Components:**
- `src/components/pricing/RateCardSelector.tsx` (existing)
- All UI components from `src/components/ui/`

**Adaptation Strategy:**
1. Copy TimeEntryModal.tsx structure
2. Replace time-specific fields with service fields
3. Add service_type dropdown
4. Add quantity field
5. Integrate RateCardSelector for auto-fill
6. Wire to LoggedServicesService

#### 2.3 Universal Toolset Definition

The complete toolset consists of three modals:

1. **TimeEntryModal.tsx** (existing)
   - Location: `src/components/time-entries/TimeEntryModal.tsx`
   - Purpose: Log time entries (hourly work)
   - Fields: date, hours, minutes, description, rate

2. **QuickDisbursementModal.tsx** (existing)
   - Location: `src/components/expenses/QuickDisbursementModal.tsx`
   - Purpose: Log expenses/disbursements
   - Fields: date, amount, description, type, vendor

3. **LogServiceModal.tsx** (new)
   - Location: `src/components/services/LogServiceModal.tsx`
   - Purpose: Log services (fixed-price work)
   - Fields: date, service_type, description, quantity, rate

### Phase 3: Pipeline Integration

#### 3.1 Pro Forma Stage

**Component: ProFormaRequestPage.tsx**
- **Location**: `src/pages/ProFormaRequestPage.tsx` (existing, refactor)
- **Changes**:
  - Remove current line item addition method
  - Add three buttons: "Add Service", "Add Time", "Add Expense"
  - Wire buttons to open respective modals with `isEstimate=true`

**Interface:**
```typescript
interface ProFormaLineItemActions {
  onAddService: () => void;
  onAddTime: () => void;
  onAddExpense: () => void;
}

interface ProFormaLineItemsDisplay {
  services: LoggedService[];
  timeEntries: TimeEntry[];
  expenses: Expense[];
  totalAmount: number;
}
```

**Service: proforma-pdf.service.ts**
- **Location**: `src/services/proforma-pdf.service.ts` (existing, refactor)
- **Changes**:
  - Update data fetching to query all three tables
  - Fetch services from `logged_services` WHERE `is_estimate=true`
  - Fetch time from `time_entries` WHERE `pro_forma_id=X`
  - Fetch expenses from `expenses` WHERE `pro_forma_id=X`
  - Render all three types in PDF

**Reused Pages:**
- `src/pages/partner/PartnerApprovalPage.tsx` (no changes)
- `src/pages/attorney/ProFormaSubmissionPage.tsx` (no changes)

#### 3.2 WIP Tracking Stage

**Component: MatterDetailsInvoicing.tsx**
- **Location**: `src/components/matters/MatterDetailsInvoicing.tsx` (existing, refactor)
- **Changes**:
  - Replace current UI with tabbed interface
  - Create three tabs: "Services", "Time", "Expenses"
  - Each tab has "Log" button opening respective modal with `isEstimate=false`

**Interface:**
```typescript
interface WIPTab {
  id: 'services' | 'time' | 'expenses';
  label: string;
  icon: React.ComponentType;
  count: number;
}

interface WIPTabContent {
  items: LoggedService[] | TimeEntry[] | Expense[];
  onLog: () => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  total: number;
}
```

**New Component: ProFormaChecklist.tsx**
- **Location**: `src/components/matters/ProFormaChecklist.tsx`
- **Purpose**: Display Pro Forma items as checklist for conversion to WIP
- **Reused Components**: All from `src/components/ui/`

**Interface:**
```typescript
interface ProFormaChecklistProps {
  matterId: string;
  proFormaId: string;
  onConvert: (selectedItems: string[]) => void;
}

interface ChecklistItem {
  id: string;
  type: 'service' | 'time' | 'expense';
  description: string;
  amount: number;
  isConverted: boolean;
  wipItemId?: string;
}
```

**New Components: Service and Expense Lists**
- **ServiceList.tsx**: Adapted from `TimeEntryList.tsx`
- **ExpenseList.tsx**: Adapted from `TimeEntryList.tsx`
- Display logged items in tabular format
- Support inline editing and deletion

**Service: matter-conversion.service.ts**
- **Location**: `src/services/api/matter-conversion.service.ts` (existing, refactor)
- **Changes**:
  - Rewrite conversion logic for new structure
  - Convert Pro Forma services → WIP services
  - Convert Pro Forma time → WIP time
  - Convert Pro Forma expenses → WIP expenses
  - Maintain traceability via `pro_forma_id` field

#### 3.3 Invoice Stage (Atomic Rule)

**Component: WIPAccumulator.tsx**
- **Location**: `src/components/matters/WIPAccumulator.tsx` (existing, refactor)
- **Changes**:
  - Update calculation to sum from all three tables
  - Query `logged_services` WHERE `is_estimate=false` AND `invoice_id IS NULL`
  - Query `time_entries` WHERE `invoice_id IS NULL`
  - Query `expenses` WHERE `invoice_id IS NULL`
  - Correctly use `servicesTotal` state

**Interface:**
```typescript
interface WIPTotals {
  servicesTotal: number;
  timeTotal: number;
  expensesTotal: number;
  grandTotal: number;
}

interface WIPAccumulatorProps {
  matterId: string;
  onTotalsCalculated: (totals: WIPTotals) => void;
}
```

**Component: MatterInvoicePanel.tsx**
- **Location**: `src/components/invoices/MatterInvoicePanel.tsx` (existing, refactor)
- **Changes**:
  - Simplify "Generate Invoice" handler
  - Only read final total from WIPAccumulator
  - Pass totals to invoice generation modal

**Components: Invoice Generation Modals**
- **GenerateInvoiceModal.tsx** (existing, refactor)
- **UnifiedInvoiceWizard.tsx** (existing, refactor)
- **Changes**:
  - Remove all data fetching from Pro Forma
  - Accept WIP totals as props
  - Only display and use actual logged work

**Service: invoice-pdf.service.ts**
- **Location**: `src/services/invoice-pdf.service.ts` (existing, refactor)
- **Changes**:
  - Remove Pro Forma data fetching
  - Accept line items as parameters
  - Only render data passed from WIP

**Interface:**
```typescript
interface InvoiceLineItem {
  type: 'service' | 'time' | 'expense';
  date: string;
  description: string;
  quantity?: number;
  rate?: number;
  amount: number;
}

interface GenerateInvoiceParams {
  matterId: string;
  lineItems: InvoiceLineItem[]; // Passed from WIP, NOT fetched from Pro Forma
  totals: WIPTotals;
  invoiceDate: string;
  dueDate: string;
}
```

## Data Models

### New Types (financial.types.ts)

```typescript
// Add to existing financial.types.ts

export interface LoggedService {
  id: string;
  matter_id: string;
  advocate_id: string;
  service_date: string;
  description: string;
  service_type: 'consultation' | 'drafting' | 'research' | 'court_appearance' | 'other';
  estimated_hours?: number;
  rate_card_id?: string;
  unit_rate: number;
  quantity: number;
  amount: number;
  is_estimate: boolean;
  pro_forma_id?: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Firm {
  id: string;
  firm_name: string;
  attorney_name: string;
  practice_number?: string;
  phone_number?: string;
  email: string;
  address?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
```

### Updated Types

```typescript
// Update existing Matter type
export interface Matter {
  // ... existing fields
  firm_id: string; // NEW: Required foreign key
  // Remove: attorney_name, attorney_email, attorney_phone, etc.
}
```

### Database Schema Updates

**New Table: firms**
```sql
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_name TEXT NOT NULL,
  attorney_name TEXT NOT NULL,
  practice_number TEXT,
  phone_number TEXT,
  email TEXT NOT NULL UNIQUE,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_firms_email ON firms(email);
CREATE INDEX idx_firms_status ON firms(status);
```

**Update Table: matters**
```sql
ALTER TABLE matters
ADD COLUMN firm_id UUID REFERENCES firms(id);

-- For existing data, allow NULL temporarily
-- After migration, make it NOT NULL
-- ALTER TABLE matters ALTER COLUMN firm_id SET NOT NULL;
```

**New Table: logged_services** (see Phase 2.1)

## Error Handling

### Validation Rules

1. **Firm Management**
   - Firm name required (min 2 characters)
   - Attorney name required (min 2 characters)
   - Email must be valid format and unique
   - Phone number optional but must match format if provided

2. **Matter Creation**
   - firm_id required (must reference existing firm)
   - All existing matter validations remain

3. **Logged Services**
   - matter_id required (must reference existing matter)
   - service_date required (cannot be future date)
   - description required (min 5 characters)
   - unit_rate must be positive
   - quantity must be positive
   - service_type must be valid enum value

4. **Invoice Generation**
   - Must have at least one WIP item
   - Cannot generate invoice if WIP total is zero
   - Cannot include items already invoiced

### Error Messages

```typescript
const ERROR_MESSAGES = {
  FIRM_REQUIRED: 'Please select an instructing firm',
  FIRM_NOT_FOUND: 'Selected firm not found',
  NO_WIP_ITEMS: 'Cannot generate invoice: No unbilled work found',
  INVALID_SERVICE_TYPE: 'Invalid service type selected',
  FUTURE_DATE: 'Date cannot be in the future',
  ALREADY_INVOICED: 'This item has already been invoiced',
  MATTER_NOT_FOUND: 'Matter not found or access denied',
};
```

### Error Recovery

1. **Deletion Failures**: If file deletion fails, log error and continue (non-blocking)
2. **Migration Errors**: Rollback database changes if migration fails
3. **Data Fetch Errors**: Display user-friendly message and retry option
4. **Save Failures**: Preserve form data and allow retry

## Testing Strategy

### Unit Tests

1. **LoggedServicesService**
   - Test createService with valid data
   - Test createService with invalid data
   - Test updateService
   - Test getServicesByMatter filtering
   - Test deleteService
   - Test WIP calculation updates

2. **LogServiceModal**
   - Test form validation
   - Test rate card integration
   - Test amount calculation
   - Test save/cancel behavior

3. **WIPAccumulator**
   - Test total calculation from all three sources
   - Test filtering of invoiced items
   - Test empty state handling

### Integration Tests

1. **Pro Forma Flow**
   - Create Pro Forma with services, time, and expenses
   - Verify all items saved with is_estimate=true
   - Verify PDF generation includes all items

2. **WIP Flow**
   - Log services, time, and expenses against matter
   - Verify items saved with is_estimate=false
   - Verify WIP totals update correctly

3. **Invoice Flow**
   - Generate invoice from WIP
   - Verify only WIP items included (not Pro Forma)
   - Verify items marked as invoiced
   - Verify WIP totals update after invoicing

4. **Firm Management Flow**
   - Create firm
   - Create matter with firm
   - Verify firm_id relationship
   - Verify matter cannot be created without firm

### End-to-End Tests

1. **Complete Pipeline**
   - Create firm
   - Create matter with firm
   - Create Pro Forma estimate
   - Log actual WIP
   - Generate invoice
   - Verify invoice only includes WIP (atomic rule)

2. **Cloud Document Linking**
   - Link document from cloud storage
   - Verify document associated with matter
   - Verify no FileUpload component used

## Migration Strategy

### Phase 0: Cleanup (Day 1)

1. Delete all obsolete files
2. Fix remaining import references
3. Verify application compiles
4. Run existing tests to ensure no breakage

### Phase 1: Foundation (Days 2-3)

1. Create firms table
2. Add firm_id to matters table (nullable)
3. Build FirmsPage and FirmCard
4. Refactor MatterWorkbenchPage
5. Refactor DocumentsTab
6. Migrate existing attorney data to firms table
7. Update matters with firm_id values

### Phase 2: Logging Toolset (Days 4-5)

1. Create logged_services table
2. Build LoggedServicesService
3. Build LogServiceModal
4. Test all three modals independently

### Phase 3: Pipeline Integration (Days 6-8)

1. Refactor ProFormaRequestPage
2. Refactor proforma-pdf.service.ts
3. Refactor MatterDetailsInvoicing.tsx
4. Build ProFormaChecklist.tsx
5. Refactor matter-conversion.service.ts
6. Refactor WIPAccumulator.tsx
7. Refactor invoice generation components
8. Refactor invoice-pdf.service.ts

### Data Migration

```sql
-- Step 1: Create firms from attorney_users
INSERT INTO firms (id, firm_name, attorney_name, practice_number, phone_number, email, status)
SELECT 
  id,
  firm_name,
  attorney_name,
  practice_number,
  phone_number,
  email,
  status
FROM attorney_users
WHERE deleted_at IS NULL;

-- Step 2: Update matters with firm_id
-- This requires manual mapping or business logic
-- Example: UPDATE matters SET firm_id = (SELECT id FROM firms WHERE email = matters.attorney_email);

-- Step 3: Make firm_id NOT NULL after migration
ALTER TABLE matters ALTER COLUMN firm_id SET NOT NULL;
```

## Performance Considerations

1. **Database Indexes**: Add indexes on all foreign keys and frequently queried columns
2. **Query Optimization**: Use SELECT with specific columns, avoid SELECT *
3. **Pagination**: Implement pagination for all list views (firms, services, etc.)
4. **Caching**: Cache firm list for matter creation dropdown
5. **Lazy Loading**: Load WIP items only when tabs are activated

## Security Considerations

1. **RLS Policies**: Ensure Row Level Security policies cover new tables
2. **Authorization**: Verify user can only access their own firms and matters
3. **Input Validation**: Sanitize all user inputs before database operations
4. **Audit Trail**: Log all create/update/delete operations
5. **Token Security**: Ensure cloud storage tokens are encrypted at rest

## Backward Compatibility

1. **Graceful Degradation**: Handle matters without firm_id during migration
2. **Dual Read**: Support reading from both old and new data structures temporarily
3. **Feature Flags**: Use flags to enable new features incrementally
4. **Rollback Plan**: Maintain ability to rollback database migrations if needed
