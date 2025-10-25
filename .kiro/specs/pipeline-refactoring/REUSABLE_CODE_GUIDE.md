# Reusable Code Reference Guide

## 🎯 Purpose
This guide maps existing components to new requirements, showing exactly what to copy and adapt.

---

## Modal Components

### LogServiceModal ✅ COMPLETE
**Source:** `src/components/time-entries/TimeEntryModal.tsx`  
**Location:** `src/components/services/LogServiceModal.tsx`  
**Status:** Already implemented and functional

**Key Adaptations Made:**
- Replaced `hours/minutes` with `quantity` field
- Replaced `hourly_rate` with `unit_rate`
- Added `service_type` dropdown
- Changed calculation: `hours × rate` → `quantity × unit_rate`

---

## List Components

### ServiceList 🔨 TO CREATE
**Source:** `src/components/time-entries/TimeEntryList.tsx`  
**Target:** `src/components/services/ServiceList.tsx`

**Copy These Sections:**
```typescript
// 1. State management
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

// 2. Data loading
const loadItems = async () => { /* ... */ };
useEffect(() => { loadItems(); }, [matterId]);

// 3. CRUD handlers
const handleAdd = () => { /* ... */ };
const handleEdit = (item) => { /* ... */ };
const handleDelete = async (item) => { /* ... */ };
const handleSave = () => { loadItems(); };

// 4. Calculations
const calculateTotal = () => { /* ... */ };

// 5. UI structure
- Header with count and "Add" button
- Summary card with totals
- Empty state
- List of items with edit/delete buttons
- Modal integration
```

**Adaptations Needed:**
| TimeEntryList | ServiceList |
|---------------|-------------|
| `TimeEntry` type | `LoggedService` type |
| `TimeEntryService.getTimeEntries()` | `LoggedServicesService.getServicesByMatter()` |
| `entry.hours` | `service.quantity` |
| `entry.hourly_rate` | `service.unit_rate` |
| `entry.entry_date` | `service.service_date` |
| `formatDuration(hours)` | Display quantity with unit |
| `TimeEntryModal` | `LogServiceModal` |

**Query Filter:**
```typescript
// TimeEntryList
.is('invoice_id', null)

// ServiceList
.eq('is_estimate', false)
.is('invoice_id', null)
```

---

### ExpenseList 🔨 TO CREATE
**Source:** `src/components/time-entries/TimeEntryList.tsx`  
**Target:** `src/components/expenses/ExpenseList.tsx`

**Adaptations Needed:**
| TimeEntryList | ExpenseList |
|---------------|-------------|
| `TimeEntry` type | `Expense` type |
| `TimeEntryService.getTimeEntries()` | `ExpensesService.getExpenses()` |
| `entry.hours` | `expense.amount` |
| `entry.description` | `expense.description` |
| `entry.entry_date` | `expense.date` |
| `TimeEntryModal` | `QuickDisbursementModal` |
| Display hours + rate | Display amount + type |

**Query Filter:**
```typescript
.eq('matter_id', matterId)
.is('invoice_id', null)
```

---

## Page Components

### FirmsPage ✅ COMPLETE
**Source:** `src/pages/MattersPage.tsx`  
**Location:** `src/pages/FirmsPage.tsx`  
**Status:** Already implemented

**Key Adaptations Made:**
- Changed `Matter` type to `Firm` type
- Changed API calls from `matter-api.service.ts` to `attorney.service.ts`
- Updated card component from `MatterCard` to `FirmCard`
- Adjusted search/filter fields for firm-specific data

---

## Service Layer

### logged-services.service.ts ✅ COMPLETE
**Source:** `src/services/api/time-entries.service.ts`  
**Location:** `src/services/api/logged-services.service.ts`  
**Status:** Already implemented

**Key Adaptations Made:**
- Changed table from `time_entries` to `logged_services`
- Changed data structure to match LoggedService type
- Added `is_estimate` flag handling
- Added `service_type`, `quantity`, `unit_rate` fields

---

## Integration Patterns

### Modal Integration in MatterDetailsInvoicing 🔨 TO IMPLEMENT
**Source:** `src/pages/ProFormaRequestPage.tsx`

**Copy This Pattern:**
```typescript
// 1. Modal state
const [showServiceModal, setShowServiceModal] = useState(false);
const [showTimeModal, setShowTimeModal] = useState(false);
const [showExpenseModal, setShowExpenseModal] = useState(false);

// 2. Data state
const [services, setServices] = useState([]);
const [timeEntries, setTimeEntries] = useState([]);
const [expenses, setExpenses] = useState([]);

// 3. Load function
const loadWIPItems = async () => {
  const { data: servicesData } = await supabase
    .from('logged_services')
    .select('*')
    .eq('matter_id', matterId)
    .eq('is_estimate', false)
    .is('invoice_id', null);
  
  // ... similar for time and expenses
  setServices(servicesData || []);
};

// 4. Modal handlers
const handleServiceSave = () => {
  setShowServiceModal(false);
  loadWIPItems();
};

// 5. Render modals
<LogServiceModal
  matterId={matterId}
  isOpen={showServiceModal}
  onClose={() => setShowServiceModal(false)}
  onSave={handleServiceSave}
  isEstimate={false}
/>
```

---

## Validation Patterns

### Form Validation
**Source:** `src/components/time-entries/TimeEntryModal.tsx`

**Reusable Pattern:**
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.date) {
    newErrors.date = 'Date is required';
  }
  
  if (formData.amount <= 0) {
    newErrors.amount = 'Amount must be greater than 0';
  }
  
  if (!formData.description || formData.description.length < 5) {
    newErrors.description = 'Description must be at least 5 characters';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Service Validation
**Source:** `src/services/api/time-entries.service.ts`

**Reusable Pattern:**
```typescript
// Validate required fields
if (!data.matterId) {
  throw new Error('Matter ID is required');
}

// Validate positive values
if (data.amount <= 0) {
  throw new Error('Amount must be greater than zero');
}

// Validate date not in future
if (new Date(data.date) > new Date()) {
  throw new Error('Date cannot be in the future');
}
```

---

## Database Query Patterns

### Fetch WIP Items
```typescript
// Services
const { data: services } = await supabase
  .from('logged_services')
  .select('*')
  .eq('matter_id', matterId)
  .eq('is_estimate', false)
  .is('invoice_id', null)
  .order('service_date', { ascending: false });

// Time Entries
const { data: timeEntries } = await supabase
  .from('time_entries')
  .select('*')
  .eq('matter_id', matterId)
  .is('invoice_id', null)
  .order('date', { ascending: false });

// Expenses
const { data: expenses } = await supabase
  .from('expenses')
  .select('*')
  .eq('matter_id', matterId)
  .is('invoice_id', null)
  .order('date', { ascending: false });
```

### Mark Items as Invoiced
```typescript
// After invoice creation
await supabase
  .from('logged_services')
  .update({ invoice_id: invoiceId })
  .eq('matter_id', matterId)
  .eq('is_estimate', false)
  .is('invoice_id', null);

// Repeat for time_entries and expenses
```

---

## UI Component Patterns

### Empty State
**Source:** Any list component

```typescript
{items.length === 0 ? (
  <div className="text-center py-12 bg-neutral-50 dark:bg-metallic-gray-900 rounded-lg border">
    <Icon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
    <p className="text-neutral-600 dark:text-neutral-400 mb-4">No items yet</p>
    <Button onClick={handleAdd}>Add Your First Item</Button>
  </div>
) : (
  // List display
)}
```

### Loading State
```typescript
{loading ? (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
) : (
  // Content
)}
```

### Summary Card
```typescript
<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <div className="text-sm text-neutral-600">Total Items</div>
      <div className="text-2xl font-bold">{items.length}</div>
    </div>
    <div>
      <div className="text-sm text-neutral-600">Total Amount</div>
      <div className="text-2xl font-bold text-blue-600">
        R{calculateTotal().toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
      </div>
    </div>
  </div>
</div>
```

---

## Quick Copy-Paste Checklist

When creating a new list component:

1. ✅ Copy entire TimeEntryList.tsx file
2. ✅ Find/Replace type names (TimeEntry → YourType)
3. ✅ Update service imports (TimeEntryService → YourService)
4. ✅ Update modal import (TimeEntryModal → YourModal)
5. ✅ Adjust display fields in list items
6. ✅ Update query filters if needed
7. ✅ Update icon imports
8. ✅ Test CRUD operations

**Estimated time per list component:** 1-2 hours

---

## Common Pitfalls to Avoid

1. ❌ Don't forget to update the query filters (is_estimate, invoice_id)
2. ❌ Don't forget to pass isEstimate prop to modals
3. ❌ Don't forget to refresh data after modal saves
4. ❌ Don't forget to handle loading and error states
5. ❌ Don't forget to update TypeScript types
6. ❌ Don't create new patterns - reuse existing ones

---

## Testing Checklist

For each new component:

- [ ] Component renders without errors
- [ ] Loading state displays correctly
- [ ] Empty state displays correctly
- [ ] List displays items correctly
- [ ] Add button opens modal
- [ ] Modal saves data correctly
- [ ] List refreshes after save
- [ ] Edit button opens modal with data
- [ ] Delete button removes item
- [ ] Totals calculate correctly
- [ ] Error handling works
- [ ] Dark mode styles work

---

## Need Help?

**Reference these working examples:**
- Modal: `src/components/time-entries/TimeEntryModal.tsx`
- List: `src/components/time-entries/TimeEntryList.tsx`
- Service: `src/services/api/time-entries.service.ts`
- Page: `src/pages/MattersPage.tsx`
- Integration: `src/pages/ProFormaRequestPage.tsx`
