# Integration Guide - Final Steps to 100%

## Quick Integration Tasks

These are the final integration points to connect all the new components to existing pages.

---

## Task 1: Add Credit Note Button to Invoice Details

**File:** `src/components/invoices/InvoiceDetailsModal.tsx`

**Add Import:**
```typescript
import { IssueCreditNoteModal } from './IssueCreditNoteModal';
```

**Add State:**
```typescript
const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
```

**Add Button (in actions section):**
```typescript
{invoice.status !== 'paid' && invoice.outstanding_balance > 0 && (
  <Button
    variant="outline"
    onClick={() => setShowCreditNoteModal(true)}
    className="flex items-center gap-2"
  >
    <FileText className="w-4 h-4" />
    Issue Credit Note
  </Button>
)}
```

**Add Modal (before closing div):**
```typescript
<IssueCreditNoteModal
  isOpen={showCreditNoteModal}
  onClose={() => setShowCreditNoteModal(false)}
  invoice={invoice}
  onSuccess={() => {
    onRefresh?.();
    setShowCreditNoteModal(false);
  }}
/>
```

---

## Task 2: Display Payment History in Invoice Details

**File:** `src/components/invoices/InvoiceDetailsModal.tsx`

**Already exists!** Just verify PaymentHistoryTable is being rendered.

If not, add:
```typescript
{invoice.payments && invoice.payments.length > 0 && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-4">Payment History</h3>
    <PaymentHistoryTable
      payments={invoice.payments}
      onEdit={(payment) => {
        // Handle edit
      }}
      onDelete={(paymentId) => {
        // Handle delete
      }}
    />
  </div>
)}
```

---

## Task 3: Add Archive Button to Matter Detail Modal

**File:** `src/components/matters/MatterDetailModal.tsx`

**Add Import:**
```typescript
import { Archive, ArchiveRestore } from 'lucide-react';
```

**Add Archive Handler:**
```typescript
const handleArchive = async () => {
  if (!matter) return;
  
  const confirmed = await confirm({
    title: 'Archive Matter',
    message: `Archive "${matter.title}"? You can restore it later.`,
    confirmText: 'Archive'
  });
  
  if (!confirmed) return;
  
  try {
    await matterSearchService.archiveMatter(matter.id, 'Completed and archived');
    toast.success('Matter archived successfully');
    onRefresh?.();
    onClose();
  } catch (error) {
    toast.error('Failed to archive matter');
  }
};
```

**Add Button:**
```typescript
{matter.status === 'closed' && !matter.is_archived && (
  <Button
    variant="outline"
    onClick={handleArchive}
    className="flex items-center gap-2"
  >
    <Archive className="w-4 h-4" />
    Archive Matter
  </Button>
)}
```

---

## Task 4: Update Outstanding Fees Report

**File:** `src/services/api/reports.service.ts`

**Update getOutstandingFeesReport method to include partial payments:**

```typescript
async getOutstandingFeesReport(advocateId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      matters (
        id,
        title,
        firms (
          name
        )
      ),
      payments:invoice_payments (
        id,
        amount,
        payment_date,
        payment_method
      )
    `)
    .eq('advocate_id', advocateId)
    .neq('status', 'paid')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(invoice => ({
    ...invoice,
    amount_paid: invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0,
    outstanding_balance: invoice.total_amount - (invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0),
    payment_progress: ((invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0) / invoice.total_amount) * 100
  }));
}
```

---

## Task 5: Update Revenue Report

**File:** `src/services/api/reports.service.ts`

**Update getRevenueReport method to include credit notes:**

```typescript
async getRevenueReport(advocateId: string, startDate: string, endDate: string) {
  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('advocate_id', advocateId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Get credit notes
  const { data: creditNotes } = await supabase
    .from('credit_notes')
    .select('*')
    .eq('advocate_id', advocateId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  const grossRevenue = invoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
  const creditNotesTotal = creditNotes?.reduce((sum, cn) => sum + cn.amount, 0) || 0;
  const netRevenue = grossRevenue - creditNotesTotal;

  return {
    grossRevenue,
    creditNotesTotal,
    netRevenue,
    invoices,
    creditNotes
  };
}
```

---

## Task 6: Update WIP Report

**File:** `src/services/api/reports.service.ts`

**Update getWIPReport method to include disbursements:**

```typescript
async getWIPReport(advocateId: string) {
  const { data, error } = await supabase
    .from('matters')
    .select(`
      *,
      time_entries (
        id,
        hours,
        rate
      ),
      disbursements (
        id,
        amount,
        vat_amount
      )
    `)
    .eq('advocate_id', advocateId)
    .eq('status', 'active')
    .is('invoiced_at', null);

  if (error) throw error;

  return data.map(matter => {
    const timeValue = matter.time_entries?.reduce((sum, te) => sum + (te.hours * te.rate), 0) || 0;
    const disbursementsValue = matter.disbursements?.reduce((sum, d) => sum + d.amount + d.vat_amount, 0) || 0;
    const totalWIP = timeValue + disbursementsValue;

    return {
      ...matter,
      time_value: timeValue,
      disbursements_value: disbursementsValue,
      total_wip: totalWIP
    };
  });
}
```

---

## Task 7: Add Quick Brief to Navigation (Optional)

**File:** `src/components/navigation/QuickActionsMenu.tsx`

**Add Quick Brief action:**

```typescript
{
  id: 'quick-brief',
  label: 'Quick Brief Capture',
  description: 'Capture matter details during phone call',
  icon: Phone,
  shortcut: 'Ctrl+Shift+B',
  action: () => {
    navigate('/matters?action=quick-brief');
  },
  category: 'matters'
}
```

---

## Task 8: Database Migrations

**Run these migrations in order:**

```bash
# 1. Quick Brief Templates
supabase migration up 20250127000000_create_advocate_quick_templates

# 2. Partial Payments
supabase migration up 20250127000001_partial_payments_system

# 3. Matter Search & Archiving
supabase migration up 20250127000003_matter_search_system
```

**Verify migrations:**
```sql
-- Check advocate_quick_templates table
SELECT COUNT(*) FROM advocate_quick_templates WHERE advocate_id = 'system';
-- Should return 31 (system templates)

-- Check invoice_payments table
SELECT * FROM invoice_payments LIMIT 1;

-- Check matter search indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'matters';
```

---

## Task 9: Test Checklist

### Quick Brief Capture
- [ ] Open MattersPage
- [ ] Click "Quick Brief" button
- [ ] Complete all 6 steps
- [ ] Verify matter created
- [ ] Verify templates saved
- [ ] Verify navigation to Matter Workbench

### Credit Notes
- [ ] Open an invoice with outstanding balance
- [ ] Click "Issue Credit Note"
- [ ] Enter credit amount
- [ ] Verify sequential number assigned
- [ ] Verify balance updated
- [ ] Verify PDF generated

### Partial Payments
- [ ] Open an invoice
- [ ] Click "Record Payment"
- [ ] Enter partial payment
- [ ] Verify balance updated
- [ ] Record another payment
- [ ] Verify payment history displayed

### Disbursements
- [ ] Open Matter Workbench
- [ ] Click "Log Disbursement"
- [ ] Enter disbursement details
- [ ] Verify VAT calculated
- [ ] Verify WIP updated
- [ ] Generate invoice
- [ ] Verify disbursement included

### Dashboard
- [ ] Open Enhanced Dashboard
- [ ] Verify all cards load
- [ ] Verify urgent items displayed
- [ ] Verify deadlines shown
- [ ] Wait 5 minutes
- [ ] Verify auto-refresh works

### Matter Search
- [ ] Open MattersPage
- [ ] Use search bar
- [ ] Click "Advanced Filters"
- [ ] Apply multiple filters
- [ ] Verify results filtered
- [ ] Export to CSV
- [ ] Verify export works

---

## Task 10: Performance Optimization

**Add indexes if not already present:**

```sql
-- Invoice payments index
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id 
ON invoice_payments(invoice_id);

-- Disbursements index
CREATE INDEX IF NOT EXISTS idx_disbursements_matter_id 
ON disbursements(matter_id);

-- Credit notes index
CREATE INDEX IF NOT EXISTS idx_credit_notes_invoice_id 
ON credit_notes(invoice_id);

-- Matter search index
CREATE INDEX IF NOT EXISTS idx_matters_search 
ON matters USING gin(to_tsvector('english', title || ' ' || description));
```

---

## Estimated Time

- **Task 1-3 (UI Integration):** 1-2 hours
- **Task 4-6 (Report Updates):** 2-3 hours
- **Task 7 (Navigation):** 30 minutes
- **Task 8 (Migrations):** 30 minutes
- **Task 9 (Testing):** 3-4 hours
- **Task 10 (Optimization):** 1 hour

**Total:** 8-11 hours

---

## Priority Order

1. **High Priority (Do First):**
   - Task 8: Database Migrations
   - Task 1: Credit Note Button
   - Task 3: Archive Button
   - Task 9: Testing

2. **Medium Priority (Do Next):**
   - Task 4: Outstanding Fees Report
   - Task 5: Revenue Report
   - Task 6: WIP Report

3. **Low Priority (Nice to Have):**
   - Task 7: Navigation Integration
   - Task 10: Performance Optimization

---

## Success Criteria

✅ All modals open and close properly
✅ All forms validate correctly
✅ All database operations succeed
✅ All reports display correct data
✅ No console errors
✅ No TypeScript errors
✅ All tests pass

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify migrations ran successfully
4. Check RLS policies are active
5. Verify user authentication

---

**Document Version:** 1.0  
**Date:** January 27, 2025  
**Status:** Ready for Integration

