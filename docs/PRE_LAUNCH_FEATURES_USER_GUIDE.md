# Pre-Launch Financial Features - User Guide

## Table of Contents

1. [Partial Payments System](#partial-payments-system)
2. [Disbursements Management](#disbursements-management)
3. [Invoice Numbering & VAT Compliance](#invoice-numbering--vat-compliance)
4. [Enhanced Dashboard](#enhanced-dashboard)
5. [Matter Search & Archiving](#matter-search--archiving)

---

## Partial Payments System

### Overview

The Partial Payments System allows you to track multiple payments against a single invoice, providing accurate cashflow tracking and outstanding balance management.

### Recording a Payment

1. Navigate to **Invoices** page
2. Click on the invoice you want to record a payment for
3. Click the **"Record Payment"** button
4. Fill in the payment details:
   - **Amount**: Enter the payment amount (can be partial or full)
   - **Payment Date**: Select when the payment was received
   - **Payment Method**: Choose from EFT, Cash, Cheque, or Other
   - **Reference Number** (optional): Enter bank reference or cheque number
   - **Notes** (optional): Add any additional information
5. Click **"Save Payment"**

### Understanding Payment Status

- **Unpaid**: No payments have been recorded
- **Partially Paid**: Some payments recorded, but balance remains
- **Paid**: Full amount has been received
- **Overpaid**: Payments exceed invoice total (requires attention)

### Viewing Payment History

On any invoice detail page, you'll see:
- **Original Amount**: The total invoice amount
- **Amount Paid**: Total of all payments received
- **Outstanding Balance**: Remaining amount owed
- **Payment History Table**: All payments with dates, amounts, and methods

### Editing or Deleting Payments

1. In the payment history table, click the **Edit** or **Delete** icon
2. Make your changes or confirm deletion
3. The outstanding balance will automatically recalculate

**Note**: All payment modifications are logged in the audit trail for compliance.

### Outstanding Fees Report

The Outstanding Fees Report now shows:
- Actual outstanding balances (not original invoice amounts)
- Aging brackets (0-30, 31-60, 61-90, 90+ days)
- Total amount owed across all invoices

Access via: **Reports > Outstanding Fees**

---

## Disbursements Management

### Overview

Disbursements are out-of-pocket expenses incurred on behalf of a client (court fees, travel, transcripts, etc.). This system ensures you're reimbursed for all expenses.

### Logging a Disbursement

1. Navigate to **Matter Workbench** for the relevant matter
2. Click the **"Log Disbursement"** button
3. Fill in the details:
   - **Description**: What the expense was for (e.g., "Court filing fees")
   - **Amount**: The expense amount
   - **Date Incurred**: When you paid the expense
   - **VAT Applicable**: Toggle Yes/No (defaults to Yes)
   - **Receipt Link** (optional): Link to receipt in cloud storage
4. Click **"Save Disbursement"**

### VAT Calculation

When VAT is applicable:
- System automatically calculates 15% VAT
- Shows both the base amount and VAT amount
- Total includes VAT

Example:
- Amount: R350.00
- VAT (15%): R52.50
- Total: R402.50

### Viewing Disbursements

In the Matter Workbench, you'll see:
- List of all disbursements for the matter
- Filter by billed/unbilled status
- Total unbilled disbursements value
- Edit/delete options for unbilled items

### Including in Invoices

When you generate an invoice:
1. All unbilled disbursements are automatically included
2. Invoice shows separate "DISBURSEMENTS" section
3. Professional fees and disbursements are clearly separated
4. VAT is calculated correctly for each
5. After invoice generation, disbursements are marked as "Billed"

**Note**: Billed disbursements cannot be edited or deleted.

### WIP Report

Unbilled disbursements are included in your Work in Progress (WIP) value, giving you accurate tracking of billable work.

---

## Invoice Numbering & VAT Compliance

### Overview

This system ensures SARS-compliant sequential invoice numbering and proper VAT tax invoices for registered advocates.

### Configuring Invoice Settings

1. Navigate to **Settings > Invoicing**
2. Configure the following:

#### Invoice Numbering
- **Invoice Number Format**: Choose format (e.g., INV-YYYY-NNN)
  - YYYY = Year
  - NNN = Sequential number (padded with zeros)
- **Credit Note Format**: Separate format for credit notes
- **Current Sequence**: View only (managed automatically)

#### VAT Settings
- **VAT Registered**: Toggle Yes/No
- **VAT Number**: Enter your VAT registration number
- **VAT Rate**: Set current rate (defaults to 15%)
- **Advocate Details**: Name, address, phone, email for tax invoices

3. Click **"Save Settings"**

### Sequential Numbering

The system automatically:
- Assigns the next sequential number to each invoice
- Never reuses numbers
- Handles year rollovers (resets sequence to 001)
- Marks failed generations as "Voided" with reason

Example sequence:
- INV-2025-001
- INV-2025-002
- INV-2025-003 (voided - generation failed)
- INV-2025-004

### VAT-Compliant Tax Invoices

If you're VAT registered, all invoices include:
- "TAX INVOICE" header
- Your VAT number
- Your full business details
- Client's VAT number (if available)
- Invoice date and sequential number
- Line items with descriptions
- Amount excluding VAT
- VAT amount (15% or configured rate)
- Total including VAT

### Invoice Numbering Audit Log

Access via: **Settings > Invoicing > View Audit Log**

The audit log shows:
- All invoice numbers generated
- Status (Used or Voided)
- Date and time of generation
- Void reason (if applicable)
- Export option for SARS compliance

### VAT Rate Changes

If the VAT rate changes:
1. Go to **Settings > Invoicing**
2. Click **"Add VAT Rate Change"**
3. Enter new rate and effective date
4. System applies correct rate based on invoice date

Historical invoices retain their original VAT rate.

---

## Enhanced Dashboard

### Overview

The enhanced dashboard provides at-a-glance visibility of urgent items, financial health, and pending actions.

### Dashboard Sections

#### 1. Urgent Attention
Highlights items requiring immediate action:
- **Deadlines Today**: Matters due today
- **Overdue Invoices**: Invoices unpaid for 45+ days
- **Pending Pro Formas**: Requests awaiting response for 5+ days

**Action**: Click any item to navigate to details

#### 2. This Week's Deadlines
Shows matters due within the next 7 days:
- Matter title and client
- Deadline date
- Days remaining

**Action**: Click "View All Deadlines" for full calendar

#### 3. Financial Snapshot
Three key metrics:
- **Outstanding Fees**: Total owed by clients (count of unpaid invoices)
- **Work in Progress**: Total unbilled work value (count of active matters)
- **Month Invoiced**: Total invoiced this month

**Action**: Click any card for detailed report

#### 4. Active Matters
Shows your 5 most recently active matters:
- Completion percentage
- Last activity timestamp
- Deadline, budget, and amount used
- Warning indicator for stale matters (14+ days no activity)

**Action**: Click matter to open workbench

#### 5. Pending Actions
Counts of items requiring your attention:
- New matter requests from attorneys
- Pro forma approvals needed
- Scope amendments awaiting approval
- Completed matters ready to invoice

**Action**: Click count to view filtered list

#### 6. Quick Stats (Last 30 Days)
Performance metrics:
- Matters completed
- Total invoiced amount
- Total payments received
- Average time to invoice

**Action**: View trends and compare to previous period

### Dashboard Refresh

- Dashboard auto-refreshes every 5 minutes
- Click **"Refresh"** button for immediate update
- Metrics are cached for performance

---

## Matter Search & Archiving

### Overview

Powerful search and filtering capabilities help you find any matter in seconds, while archiving keeps your active list uncluttered.

### Basic Search

1. Navigate to **Matters** page
2. Type in the search box at the top
3. Results appear in real-time (searches title, attorney firm, description)
4. Click **"X"** to clear search

### Advanced Filters

1. Click **"Advanced Filters"** button
2. Select from available filters:
   - **Practice Area**: Commercial, Litigation, Family, etc.
   - **Matter Type**: Specific case types
   - **Status**: Active, Completed, Paid, etc. (multi-select)
   - **Date Range**: Custom start and end dates
   - **Attorney Firm**: Filter by instructing firm
   - **Fee Range**: Min and max amounts
3. Click **"Apply Filters"**

Active filters appear as chips below the search bar. Click any chip to remove that filter.

### Sorting Results

Use the sort dropdown to order by:
- **Deadline** (soonest first)
- **Date Created** (newest first)
- **Total Fee** (highest first)
- **Last Activity** (most recent first)

### Including Archived Matters

By default, archived matters are hidden. To include them:
1. Click **"Advanced Filters"**
2. Check **"Include Archived"** checkbox
3. Click **"Apply Filters"**

Archived matters display with an "Archived" badge.

### Archiving a Matter

When a matter is complete and you want to remove it from your active list:

1. Open the matter or click the actions menu
2. Select **"Archive"**
3. Enter a reason (optional but recommended)
4. Click **"Confirm Archive"**

**What happens:**
- Matter is removed from default view
- All data remains intact
- Can be found via search with "Include Archived"
- Can be unarchived at any time

**When to archive:**
- Matter is completed and paid
- Matter is declined or abandoned
- Matter is on indefinite hold

### Unarchiving a Matter

1. Search for the archived matter (with "Include Archived" checked)
2. Click the actions menu
3. Select **"Unarchive"**
4. Matter returns to active list

### Exporting Matters

To export your matter list:
1. Apply any desired filters
2. Click **"Export"** button
3. Choose format:
   - **CSV**: For spreadsheets and data analysis
   - **PDF**: For printing or sharing
4. File downloads automatically

Export includes all currently filtered results.

### Matter Status Options

Available statuses:
- **New Request**: Just received from attorney
- **Awaiting Approval**: Pro forma sent, awaiting response
- **Active**: Work in progress
- **Completed**: Work finished, ready to invoice
- **Paid**: Invoice paid in full
- **On Hold**: Temporarily paused
- **Declined**: Request declined
- **Archived**: Removed from active list

---

## Tips & Best Practices

### Partial Payments
- Record payments as soon as received for accurate cashflow
- Use reference numbers to match bank statements
- Review Outstanding Fees Report weekly
- Follow up on invoices overdue 30+ days

### Disbursements
- Log disbursements immediately to avoid forgetting
- Keep receipts and link them in the system
- Review unbilled disbursements before invoicing
- Verify VAT applicability for each expense

### Invoice Numbering
- Configure settings before generating first invoice
- Never manually change invoice numbers
- Export audit log monthly for SARS compliance
- Keep VAT registration details current

### Dashboard
- Check Urgent Attention section daily
- Address stale matters (14+ days no activity)
- Monitor financial snapshot for cashflow planning
- Use pending actions to prioritize work

### Matter Search
- Use specific search terms for faster results
- Save common filter combinations (feature coming soon)
- Archive completed matters monthly
- Export matter lists for reporting

---

## Troubleshooting

### Payment not updating invoice status
- Verify payment amount is correct
- Check that payment was saved successfully
- Refresh the page
- Contact support if issue persists

### Disbursement not appearing in invoice
- Ensure disbursement is marked as "Unbilled"
- Check that disbursement belongs to the correct matter
- Verify invoice generation completed successfully

### Invoice number skipped
- Check audit log for voided numbers
- Voided numbers indicate failed generations
- This is normal and maintains SARS compliance

### Dashboard showing old data
- Click refresh button
- Wait for cache to expire (5 minutes)
- Clear browser cache if issue persists

### Search not finding matter
- Check spelling of search terms
- Try broader search terms
- Verify matter isn't archived (check "Include Archived")
- Ensure you have permission to view the matter

---

## Support

For additional help:
- **Email**: support@lexohub.com
- **Phone**: +27 XX XXX XXXX
- **Help Center**: https://help.lexohub.com
- **Video Tutorials**: https://help.lexohub.com/videos

---

## Compliance Notes

### SARS Requirements
- Sequential invoice numbering is mandatory
- Voided numbers must be documented
- VAT invoices must include all required fields
- Keep audit logs for 5 years

### POPIA Compliance
- All actions are logged in audit trail
- Personal information is protected
- Access is restricted to authorized users
- Data can be exported on request

### Best Practices
- Review financial reports monthly
- Reconcile payments with bank statements
- Archive completed matters regularly
- Keep system data current and accurate

---

*Last Updated: January 2025*
*Version: 1.0*
