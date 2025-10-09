# Unified Invoice Flow - Complete Implementation

## Overview

The invoice system has been completely redesigned with a **matter-centric approach** where all billing data (pro forma services, time entries, and expenses) flows through the matter ID, creating a unified and logical workflow.

## Core Principle

**Everything is linked by Matter ID:**
```
Pro Forma Request → Matter (via source_proforma_id)
Time Entries → Matter (via matter_id)
Expenses → Matter (via matter_id)
Invoice → Matter (via matter_id)
```

## New Components

### 1. MatterSelectionModal
**Purpose**: Select a matter to generate an invoice

**Features**:
- Shows only matters with billable data (unbilled time or pro forma)
- Displays statistics for each matter:
  - Pro forma amount (if linked)
  - Unbilled hours and amount
  - Number of time entries
- Search functionality
- Visual indicators for pro forma linkage

**Data Flow**:
```typescript
MatterSelectionModal
  ↓ (loads all matters)
  ↓ (fetches time entries per matter)
  ↓ (fetches pro forma data if linked)
  ↓ (shows matters with billing data)
  ↓ (user selects matter)
  → UnifiedInvoiceWizard
```

### 2. UnifiedInvoiceWizard
**Purpose**: Generate invoice with all matter data auto-imported

**Features**:
- **Auto-loads** time entries from matter
- **Auto-loads** pro forma services if matter has source_proforma_id
- **Auto-loads** expenses from matter
- 3-step wizard process:
  1. Review Items (all pre-selected)
  2. Configure (pricing, discounts, narrative)
  3. Generate (review and create)

**Data Flow**:
```typescript
UnifiedInvoiceWizard(matter)
  ↓ (receives matter ID)
  ↓ (loads unbilled time entries)
  ↓ (loads pro forma services if linked)
  ↓ (pre-selects all items)
  ↓ (user reviews/adjusts)
  ↓ (user configures)
  ↓ (user generates)
  → Invoice Created
```

## Complete Workflow

### Workflow 1: Pro Forma → Matter → Invoice

```
1. Create Pro Forma Request
   ├─ Add services and pricing
   ├─ Generate shareable link
   └─ Send to attorney

2. Attorney Accepts Pro Forma
   └─ Pro forma status = 'accepted'

3. Convert Pro Forma to Matter
   ├─ Create matter with pro forma data
   ├─ Set matter.source_proforma_id
   └─ Copy services to matter

4. Add Time Entries to Matter
   ├─ Track billable hours
   └─ Link via matter_id

5. Generate Invoice
   ├─ Select matter (shows pro forma + time)
   ├─ Wizard auto-loads:
   │  ├─ Pro forma services
   │  └─ Unbilled time entries
   ├─ Review and configure
   └─ Generate invoice
```

### Workflow 2: Matter → Time Entries → Invoice

```
1. Create Matter
   └─ Standard matter creation

2. Add Time Entries
   ├─ Track billable work
   └─ Link via matter_id

3. Generate Invoice
   ├─ Click "Generate Invoice" on Invoices page
   ├─ MatterSelectionModal shows matters with unbilled time
   ├─ Select matter
   ├─ Wizard auto-loads time entries
   ├─ Review and configure
   └─ Generate invoice
```

### Workflow 3: Time Entries Tab → Invoice

```
1. Navigate to Invoices → Time Entries Tab
   └─ See all time entries grouped by matter

2. Click "Generate Invoice" on a matter
   ├─ Wizard opens with matter context
   ├─ Time entries auto-loaded
   └─ Generate invoice
```

## Data Structure

### Matter with Billing Data
```typescript
{
  id: string;
  title: string;
  client_name: string;
  bar: string;
  matter_type: string;
  source_proforma_id?: string;  // Links to pro forma
  
  // Calculated fields
  unbilledHours: number;
  unbilledAmount: number;
  timeEntriesCount: number;
  hasProForma: boolean;
  proFormaAmount?: number;
}
```

### Invoice Generation Data
```typescript
{
  matterId: string;              // Core link
  isProForma: boolean;
  selectedTimeEntries: string[]; // Auto-loaded from matter
  selectedExpenses: string[];    // Auto-loaded from matter
  selectedServices: string[];    // Auto-loaded from pro forma
  discount: {
    type: 'amount' | 'percentage';
    value: number;
  };
  hourlyRateOverride?: number;
  narrative?: string;
  useAINarrative: boolean;
  totals: {
    totalHours: number;
    totalFees: number;
    totalExpenses: number;
    servicesTotal: number;        // From pro forma
    discountValue: number;
    vatAmount: number;
    totalAmount: number;
  };
  sourceProFormaId?: string;      // Preserved from matter
}
```

## Integration Points

### Invoice List Page
```typescript
// Generate Invoice button
<button onClick={() => setShowMatterSelection(true)}>
  Generate Invoice
</button>

// Matter Selection Modal
<MatterSelectionModal
  isOpen={showMatterSelection}
  onClose={() => setShowMatterSelection(false)}
  onMatterSelected={handleMatterSelected}
/>

// Unified Invoice Wizard
<UnifiedInvoiceWizard
  matter={selectedMatter}
  onClose={handleClose}
  onGenerate={handleInvoiceGenerated}
/>
```

### Time Entries Tab
```typescript
// Generate Invoice from matter group
<button onClick={() => handleGenerateInvoice(matterGroup)}>
  Generate Invoice
</button>

// Opens wizard with matter context
<UnifiedInvoiceWizard
  matter={{
    id: matterGroup.matterId,
    title: matterGroup.matterTitle,
    clientName: matterGroup.clientName,
    bar: matterGroup.bar,
    matterType: matterGroup.matterType
  }}
  onGenerate={handleInvoiceGenerated}
/>
```

### Pro Forma Tab
```typescript
// Convert to Matter
<button onClick={() => handleConvertToMatter(proFormaId)}>
  Convert to Matter
</button>

// After conversion, matter has source_proforma_id
// When generating invoice, wizard auto-loads pro forma services
```

## Key Benefits

### 1. Unified Data Flow
- All billing data flows through matter ID
- No manual data entry or selection
- Consistent data structure

### 2. Automatic Data Import
- Time entries auto-loaded from matter
- Pro forma services auto-loaded if linked
- Expenses auto-loaded from matter
- All items pre-selected for review

### 3. Data Integrity
- Single source of truth (matter)
- Pro forma linkage preserved
- Audit trail maintained
- No data duplication

### 4. User Experience
- Select matter → Everything loads automatically
- Review → Configure → Generate
- Clear visual indicators of data sources
- Reduced clicks and errors

## Database Relationships

```sql
-- Pro Forma Request
proforma_requests
  id (PK)
  advocate_id
  estimated_amount
  services (JSONB)
  status

-- Matter (links to pro forma)
matters
  id (PK)
  source_proforma_id (FK → proforma_requests.id)
  advocate_id
  client_name
  title
  bar
  matter_type

-- Time Entries (link to matter)
time_entries
  id (PK)
  matter_id (FK → matters.id)
  hours
  hourly_rate
  amount
  is_billed
  entry_date

-- Expenses (link to matter)
expenses
  id (PK)
  matter_id (FK → matters.id)
  amount
  category
  is_billed

-- Invoice (links to matter and optionally pro forma)
invoices
  id (PK)
  matter_id (FK → matters.id)
  source_proforma_id (FK → proforma_requests.id)
  total_amount
  status
```

## API Calls Sequence

### When Generating Invoice

1. **User clicks "Generate Invoice"**
   ```typescript
   setShowMatterSelection(true)
   ```

2. **MatterSelectionModal loads**
   ```typescript
   // Load all matters
   const matters = await matterApiService.getAll()
   
   // For each matter, load billing data
   for (matter of matters) {
     const timeEntries = await TimeEntryService.getTimeEntries({
       matterId: matter.id
     })
     
     if (matter.source_proforma_id) {
       const proForma = await proformaRequestService.getById(
         matter.source_proforma_id
       )
     }
   }
   ```

3. **User selects matter**
   ```typescript
   onMatterSelected(matterWithBillingData)
   ```

4. **UnifiedInvoiceWizard opens**
   ```typescript
   // Auto-load time entries
   const timeEntries = await TimeEntryService.getTimeEntries({
     matterId: matter.id
   })
   
   // Auto-load pro forma if linked
   if (matter.sourceProFormaId) {
     const proForma = await proformaRequestService.getById(
       matter.sourceProFormaId
     )
     // Extract services from pro forma
   }
   
   // Pre-select all items
   setSelectedEntries(timeEntries.map(e => e.id))
   setSelectedServices(proFormaServices.map(s => s.id))
   ```

5. **User generates invoice**
   ```typescript
   const invoiceData = {
     matterId: matter.id,
     selectedTimeEntries,
     selectedServices,
     selectedExpenses,
     sourceProFormaId: matter.sourceProFormaId,
     totals: calculateTotals()
   }
   
   onGenerate(invoiceData)
   ```

## Testing Scenarios

### Scenario 1: Invoice from Pro Forma Matter
1. Create pro forma request
2. Convert to matter
3. Add time entries to matter
4. Generate invoice
5. ✅ Verify pro forma services loaded
6. ✅ Verify time entries loaded
7. ✅ Verify totals include both

### Scenario 2: Invoice from Regular Matter
1. Create matter (no pro forma)
2. Add time entries
3. Generate invoice
4. ✅ Verify time entries loaded
5. ✅ Verify no pro forma services
6. ✅ Verify correct totals

### Scenario 3: Invoice from Time Entries Tab
1. Navigate to Time Entries tab
2. Find matter with unbilled time
3. Click "Generate Invoice"
4. ✅ Verify wizard opens with matter
5. ✅ Verify time entries pre-selected
6. ✅ Verify can generate invoice

## Migration Notes

### From Old System
- Old `InvoiceGenerationModal` → New `UnifiedInvoiceWizard`
- Manual matter selection → Automatic via `MatterSelectionModal`
- Manual time entry selection → Auto-loaded and pre-selected
- No pro forma integration → Full pro forma integration

### Breaking Changes
- None - new components are additive
- Old components still work but deprecated
- Gradual migration recommended

## Summary

The unified invoice flow creates a seamless, matter-centric billing system where:

1. **Pro forma data** flows into matters via `source_proforma_id`
2. **Time entries** link to matters via `matter_id`
3. **Invoice generation** pulls all data automatically from matter
4. **User experience** is simplified to: Select Matter → Review → Generate

This eliminates manual data entry, reduces errors, and ensures all billing data is properly linked and traceable through the matter ID.
