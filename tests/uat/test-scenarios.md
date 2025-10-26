# User Acceptance Testing Scenarios

## Feature 1: Partial Payments System

### Scenario 1.1: Record a Partial Payment
**Objective:** Verify that advocates can record partial payments against invoices

**Prerequisites:**
- User is logged in as an advocate
- At least one unpaid invoice exists

**Steps:**
1. Navigate to Invoices page
2. Click on an unpaid invoice
3. Click "Record Payment" button
4. Enter payment amount (less than total)
5. Select payment date
6. Select payment method (EFT, Cash, Cheque)
7. Enter optional reference number
8. Click "Save Payment"

**Expected Results:**
- Payment is recorded successfully
- Invoice status changes to "Partially Paid"
- Outstanding balance is updated correctly
- Payment appears in payment history
- Success notification is displayed

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

**Notes:** _Any issues or observations_

---

### Scenario 1.2: Complete Payment of Invoice
**Objective:** Verify that invoice status updates to "Paid" when full amount is received

**Prerequisites:**
- User is logged in as an advocate
- Invoice with partial payment exists

**Steps:**
1. Navigate to invoice with partial payment
2. Note the outstanding balance
3. Click "Record Payment"
4. Enter amount equal to outstanding balance
5. Click "Save Payment"

**Expected Results:**
- Payment is recorded
- Invoice status changes to "Paid"
- Outstanding balance becomes R0.00
- Invoice appears in "Paid" filter

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 1.3: Edit Payment Record
**Objective:** Verify that payment records can be edited with audit trail

**Prerequisites:**
- Invoice with at least one payment exists

**Steps:**
1. Navigate to invoice with payment
2. Click "Edit" on a payment record
3. Change payment amount
4. Click "Save"

**Expected Results:**
- Payment amount is updated
- Outstanding balance recalculates correctly
- Audit trail shows the change
- Invoice status updates if needed

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 1.4: Delete Payment Record
**Objective:** Verify that payments can be deleted with confirmation

**Prerequisites:**
- Invoice with at least one payment exists

**Steps:**
1. Navigate to invoice with payment
2. Click "Delete" on a payment record
3. Confirm deletion in dialog
4. Verify payment is removed

**Expected Results:**
- Confirmation dialog appears
- Payment is deleted after confirmation
- Outstanding balance recalculates
- Invoice status updates if needed
- Audit trail records deletion

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 1.5: Outstanding Fees Report Accuracy
**Objective:** Verify that Outstanding Fees Report shows correct balances

**Prerequisites:**
- Multiple invoices with various payment statuses exist

**Steps:**
1. Navigate to Reports page
2. Open "Outstanding Fees Report"
3. Verify amounts shown are outstanding balances, not original totals
4. Check that partially paid invoices show correct remaining balance

**Expected Results:**
- Report shows only unpaid and partially paid invoices
- Amounts reflect actual outstanding balances
- Totals are accurate
- Aging brackets are correct

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Feature 2: Disbursements System

### Scenario 2.1: Log a Disbursement
**Objective:** Verify that advocates can log disbursements for matters

**Prerequisites:**
- User is logged in as an advocate
- At least one active matter exists

**Steps:**
1. Navigate to Matter Workbench
2. Click "Log Disbursement" button
3. Enter description (e.g., "Court filing fees")
4. Enter amount (e.g., 350)
5. Select date incurred
6. Toggle VAT applicable (Yes/No)
7. Optionally add receipt link
8. Click "Save"

**Expected Results:**
- Disbursement is saved
- VAT is calculated correctly (15% if applicable)
- Total amount includes VAT
- Disbursement appears in matter's disbursements list
- Matter WIP value increases

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 2.2: Include Disbursements in Invoice
**Objective:** Verify that disbursements are included when generating invoices

**Prerequisites:**
- Matter has unbilled disbursements

**Steps:**
1. Navigate to Matter Workbench
2. Click "Generate Invoice"
3. Review invoice preview
4. Verify disbursements section is present
5. Confirm invoice generation

**Expected Results:**
- Invoice preview shows "DISBURSEMENTS" section
- All unbilled disbursements are listed
- Professional fees and disbursements are separated
- VAT is calculated correctly for each
- Total is accurate
- Disbursements are marked as billed after invoice creation

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 2.3: Edit Disbursement
**Objective:** Verify that unbilled disbursements can be edited

**Prerequisites:**
- Matter has at least one unbilled disbursement

**Steps:**
1. Navigate to Matter Workbench
2. Click "Edit" on a disbursement
3. Change amount or description
4. Click "Save"

**Expected Results:**
- Disbursement is updated
- VAT recalculates if amount changed
- Matter WIP value updates
- Audit trail records change

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 2.4: Cannot Edit Billed Disbursement
**Objective:** Verify that billed disbursements cannot be modified

**Prerequisites:**
- Matter has at least one billed disbursement

**Steps:**
1. Navigate to Matter Workbench
2. Attempt to edit a billed disbursement

**Expected Results:**
- Edit button is disabled or not shown
- Or error message appears if attempted
- Billed disbursements are clearly marked

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Feature 3: Invoice Numbering & VAT Compliance

### Scenario 3.1: Configure Invoice Settings
**Objective:** Verify that advocates can configure invoice numbering and VAT settings

**Prerequisites:**
- User is logged in as an advocate

**Steps:**
1. Navigate to Settings > Invoicing
2. Set invoice number format (e.g., INV-YYYY-NNN)
3. Set credit note format (e.g., CN-YYYY-NNN)
4. Enable VAT registration
5. Enter VAT number
6. Set VAT rate (15%)
7. Enter advocate details
8. Click "Save Settings"

**Expected Results:**
- Settings are saved successfully
- Preview shows next invoice number
- All fields are validated
- Success notification appears

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 3.2: Sequential Invoice Numbering
**Objective:** Verify that invoices are numbered sequentially without gaps

**Prerequisites:**
- Invoice settings are configured

**Steps:**
1. Generate first invoice
2. Note the invoice number
3. Generate second invoice
4. Note the invoice number
5. Verify sequence is consecutive

**Expected Results:**
- First invoice: INV-2025-001
- Second invoice: INV-2025-002
- No gaps in sequence
- Numbers are never reused

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 3.3: Voided Invoice Numbers
**Objective:** Verify that failed invoice generations void the number

**Prerequisites:**
- Invoice settings configured

**Steps:**
1. Start invoice generation
2. Cancel or let it fail
3. Check audit log
4. Generate next invoice

**Expected Results:**
- Failed number is marked as "Voided" in audit log
- Void reason is recorded
- Next invoice uses next sequential number
- Voided numbers are never reused

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 3.4: VAT-Compliant Tax Invoice
**Objective:** Verify that VAT-registered advocates generate SARS-compliant invoices

**Prerequisites:**
- VAT registration enabled in settings
- VAT number entered

**Steps:**
1. Generate an invoice
2. Review PDF output
3. Verify all required elements are present

**Expected Results:**
- "TAX INVOICE" header is prominent
- Supplier VAT number is displayed
- Supplier name, address, contact details shown
- Customer details included
- Invoice date and number present
- Line items with descriptions
- Amount excluding VAT shown
- VAT amount (15%) shown separately
- Total including VAT shown
- All amounts formatted correctly

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 3.5: Invoice Numbering Audit Log
**Objective:** Verify that all invoice number assignments are audited

**Prerequisites:**
- Multiple invoices have been generated

**Steps:**
1. Navigate to Settings > Invoicing
2. Click "View Audit Log"
3. Review entries

**Expected Results:**
- All invoice numbers are listed
- Status (used/voided) is shown
- Timestamps are recorded
- Voided numbers show reason
- Log can be exported for SARS compliance

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Feature 4: Enhanced Dashboard

### Scenario 4.1: Dashboard Loads Quickly
**Objective:** Verify that dashboard loads within 2 seconds

**Prerequisites:**
- User is logged in

**Steps:**
1. Navigate to Dashboard
2. Measure load time
3. Verify all sections appear

**Expected Results:**
- Dashboard loads in < 2 seconds
- All cards are visible
- Data is current
- No errors occur

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 4.2: Urgent Attention Section
**Objective:** Verify that urgent items are highlighted correctly

**Prerequisites:**
- System has matters with deadlines today
- System has overdue invoices (45+ days)

**Steps:**
1. View Dashboard
2. Check "Urgent Attention" section
3. Verify items shown

**Expected Results:**
- Matters with deadlines today are shown
- Invoices overdue 45+ days are shown
- Pro forma requests pending 5+ days are shown
- Items use red/orange color scheme
- Click-through links work

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 4.3: Financial Snapshot Accuracy
**Objective:** Verify that financial metrics are accurate

**Prerequisites:**
- System has invoices and matters with various statuses

**Steps:**
1. View Dashboard financial snapshot
2. Note outstanding fees amount
3. Navigate to Outstanding Fees Report
4. Compare totals
5. Repeat for WIP and monthly invoiced

**Expected Results:**
- Dashboard amounts match report totals
- Counts are accurate
- Currency formatting is correct (R symbol)
- Quick links navigate to correct reports

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 4.4: Active Matters Display
**Objective:** Verify that active matters show correct information

**Prerequisites:**
- System has active matters

**Steps:**
1. View Dashboard
2. Check "Active Matters" section
3. Verify information shown

**Expected Results:**
- Top 5 most recently active matters shown
- Completion percentage is accurate
- Last activity timestamp is correct
- Deadline, budget, and amount used are shown
- Stale matters (14+ days no activity) have warning indicator

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 4.5: Pending Actions Counts
**Objective:** Verify that pending action counts are accurate

**Prerequisites:**
- System has various pending items

**Steps:**
1. View Dashboard
2. Note pending action counts
3. Navigate to each section
4. Verify counts match

**Expected Results:**
- New requests count is accurate
- Pro forma approvals count is accurate
- Scope amendments count is accurate
- Ready to invoice count is accurate
- Click-through links filter correctly

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Feature 5: Matter Search & Archiving

### Scenario 5.1: Basic Matter Search
**Objective:** Verify that basic search works correctly

**Prerequisites:**
- System has multiple matters

**Steps:**
1. Navigate to Matters page
2. Enter search term in search box
3. View results

**Expected Results:**
- Search is real-time (debounced)
- Results match search term
- Search covers title, attorney firm, description
- Result count is displayed
- Clear button works

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 5.2: Advanced Filters
**Objective:** Verify that all filter options work correctly

**Prerequisites:**
- System has matters with various attributes

**Steps:**
1. Click "Advanced Filters"
2. Select practice area
3. Select matter type
4. Select status
5. Set date range
6. Set fee range
7. Click "Apply Filters"

**Expected Results:**
- All filters apply correctly
- Results match all selected criteria
- Active filter chips are displayed
- Filters can be cleared individually or all at once
- Result count updates

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 5.3: Archive Matter
**Objective:** Verify that matters can be archived

**Prerequisites:**
- At least one active matter exists

**Steps:**
1. Navigate to Matters page
2. Open matter actions menu
3. Click "Archive"
4. Enter reason for archiving
5. Confirm action

**Expected Results:**
- Confirmation dialog appears
- Matter is archived after confirmation
- Matter disappears from default view
- "Archived" badge appears if viewing archived matters
- Archive date and reason are recorded

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 5.4: View Archived Matters
**Objective:** Verify that archived matters can be viewed and unarchived

**Prerequisites:**
- At least one archived matter exists

**Steps:**
1. Navigate to Matters page
2. Check "Include Archived" checkbox
3. View archived matters
4. Click "Unarchive" on a matter
5. Confirm action

**Expected Results:**
- Archived matters appear when checkbox is checked
- Archived badge is visible
- Archive date and reason are shown
- Unarchive action works
- Matter returns to active list

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 5.5: Export Matters
**Objective:** Verify that matter list can be exported

**Prerequisites:**
- Matters exist in system

**Steps:**
1. Navigate to Matters page
2. Apply filters (optional)
3. Click "Export" button
4. Select format (CSV or PDF)
5. Download file

**Expected Results:**
- Export includes filtered results
- All relevant fields are included
- File downloads successfully
- Data is formatted correctly

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Cross-Feature Integration Tests

### Scenario 6.1: Complete Matter Lifecycle
**Objective:** Test complete workflow from matter creation to payment

**Steps:**
1. Create new matter
2. Log time entries
3. Log disbursements
4. Generate invoice with sequential number
5. Record partial payment
6. Record final payment
7. Archive matter

**Expected Results:**
- All steps complete successfully
- Data flows correctly between features
- Financial reports are accurate
- Audit trail is complete

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### Scenario 6.2: Dashboard Reflects All Changes
**Objective:** Verify dashboard updates when actions are taken

**Steps:**
1. Note dashboard metrics
2. Record a payment
3. Log a disbursement
4. Generate an invoice
5. Archive a matter
6. Return to dashboard
7. Verify metrics updated

**Expected Results:**
- Outstanding fees decreases after payment
- WIP increases after disbursement
- Month invoiced increases after invoice generation
- Active matters count decreases after archiving
- All changes reflect within 5 minutes (cache refresh)

**Actual Results:** _To be filled during testing_

**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Known Issues Log

| Issue # | Description | Severity | Status | Notes |
|---------|-------------|----------|--------|-------|
| | | | | |

---

## UAT Sign-Off

**Tester Name:** _________________

**Date:** _________________

**Overall Assessment:** ☐ Approved ☐ Approved with Issues ☐ Rejected

**Comments:**

_______________________________________________________________________

_______________________________________________________________________

_______________________________________________________________________
