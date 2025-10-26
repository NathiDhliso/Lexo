# Requirements Document: Pre-Launch Financial Features

## Introduction

This specification addresses five critical financial and operational features required before production launch. These features are essential for accurate financial tracking, SARS compliance, professional invoicing, and efficient matter management in South African legal practice. Without these features, the system cannot reliably track cashflow, comply with tax regulations, or provide attorneys with professional service.

The combined business impact of missing these features is estimated at R240,000+ in annual losses through missed disbursements, SARS penalties, lost clients, unbillable work, and fee disputes.

## Requirements

### Requirement 1: Partial Payments Handling

**User Story:** As an advocate, I want to record partial payments against invoices so that my Outstanding Fees Report accurately reflects what attorneys actually owe me, enabling proper cashflow tracking and SARS provisional tax calculations.

#### Acceptance Criteria

1. WHEN an invoice is generated THEN the system SHALL track the invoice total amount and current balance separately
2. WHEN I view an invoice THEN the system SHALL display a "Record Payment" action button
3. WHEN I click "Record Payment" THEN the system SHALL open a modal with fields for payment amount, payment date, and optional payment reference
4. WHEN I enter a partial payment amount less than the outstanding balance THEN the system SHALL:
   - Record the payment with timestamp
   - Reduce the outstanding balance by the payment amount
   - Keep the invoice status as "Partially Paid"
   - Display payment history on the invoice
5. WHEN I enter a payment that equals the outstanding balance THEN the system SHALL automatically change the invoice status to "Paid"
6. WHEN I enter a payment amount greater than the outstanding balance THEN the system SHALL show a validation error
7. WHEN viewing the Outstanding Fees Report THEN the system SHALL display the actual outstanding balance (not the original invoice amount) for each partially paid invoice
8. WHEN viewing the Revenue Report THEN the system SHALL show payments received by month (not invoice generation date)
9. WHEN I view an invoice with partial payments THEN the system SHALL display:
   - Original invoice amount
   - Total paid to date
   - Outstanding balance
   - Payment history table with date, amount, and reference for each payment
10. WHEN I need to edit or delete a payment record THEN the system SHALL provide actions to modify payment history with audit trail

### Requirement 2: Disbursements Workflow

**User Story:** As an advocate, I want to log disbursements (court fees, travel, transcripts) separately from professional fees so that invoices clearly show the breakdown and I don't lose money on unreimbursed expenses.

#### Acceptance Criteria

1. WHEN I am on the Matter Workbench page THEN the system SHALL display a "Log Disbursement" button alongside time entry logging
2. WHEN I click "Log Disbursement" THEN the system SHALL open a modal with fields for:
   - Description (required)
   - Amount including VAT if applicable (required)
   - Date incurred (required, defaults to today)
   - VAT applicable toggle (required, defaults to Yes)
   - Receipt link (optional, for cloud storage reference)
3. WHEN I save a disbursement THEN the system SHALL add it to the matter's disbursements list
4. WHEN viewing the Matter Workbench THEN the system SHALL display disbursements separately from time entries
5. WHEN generating an invoice THEN the system SHALL include a separate "DISBURSEMENTS" section that lists all unbilled disbursements
6. WHEN generating an invoice THEN the system SHALL calculate VAT correctly based on each disbursement's VAT flag
7. WHEN an invoice includes disbursements THEN the system SHALL display:
   - Professional Fees subtotal
   - Disbursements subtotal
   - Total excluding VAT
   - VAT amount (15%)
   - Total including VAT
8. WHEN viewing the WIP Report THEN the system SHALL include unbilled disbursements in the total WIP value
9. WHEN I edit or delete a disbursement THEN the system SHALL update the matter's WIP value accordingly
10. WHEN a disbursement is included in an invoice THEN the system SHALL mark it as billed and exclude it from future invoices

### Requirement 3: Invoice Numbering & VAT Compliance

**User Story:** As an advocate, I want sequential invoice numbering and SARS-compliant tax invoices so that I can pass SARS audits without penalties and maintain professional credibility.

#### Acceptance Criteria

1. WHEN the system is first configured THEN the system SHALL provide settings for:
   - Invoice number format (e.g., INV-YYYY-NNN, INV-NNN)
   - Credit note number format (e.g., CN-YYYY-NNN)
   - VAT registration status (Yes/No)
   - VAT number (if registered)
   - Current VAT rate (defaults to 15%)
   - Advocate details (name, address, phone, email for tax invoices)
2. WHEN generating an invoice THEN the system SHALL automatically assign the next sequential invoice number
3. WHEN an invoice generation fails or is cancelled THEN the system SHALL mark that invoice number as "Voided" and never reuse it
4. WHEN viewing voided invoices THEN the system SHALL display them in an audit log with void reason and timestamp
5. WHEN I am VAT registered THEN the system SHALL include on all invoices:
   - The words "TAX INVOICE" at the top
   - My VAT number
   - My name, address, and contact details
   - Attorney's name, address, and VAT number (if available)
   - Invoice date
   - Sequential invoice number
   - Description of services
   - Amount excluding VAT
   - VAT amount (15% or configured rate)
   - Total including VAT
6. WHEN generating a credit note THEN the system SHALL use a separate sequential numbering system from invoices
7. WHEN generating a credit note THEN the system SHALL require reference to the original invoice number
8. WHEN the VAT rate changes THEN the system SHALL allow me to update the rate in settings and apply it to new invoices only
9. WHEN viewing invoice history THEN the system SHALL show the VAT rate used for each historical invoice
10. WHEN exporting financial reports THEN the system SHALL maintain sequential numbering integrity for SARS compliance

### Requirement 4: Dashboard Design

**User Story:** As an advocate, I want a comprehensive dashboard that shows urgent deadlines, financial snapshot, active matters, and pending actions so that I can prioritize my work and never miss important deadlines.

#### Acceptance Criteria

1. WHEN I log in THEN the system SHALL display the dashboard as the default landing page
2. WHEN viewing the dashboard THEN the system SHALL display an "Urgent Attention" section showing:
   - Matters with deadlines today
   - Invoices overdue by 45+ days
   - Pro forma requests awaiting my response for 5+ days
3. WHEN viewing the dashboard THEN the system SHALL display a "This Week's Deadlines" section showing matters due within 7 days
4. WHEN viewing the dashboard THEN the system SHALL display a "Financial Snapshot" section showing:
   - Total outstanding fees with count of unpaid invoices
   - Total work in progress value with count of active matters
   - Current month invoiced amount
   - Quick links to detailed reports
5. WHEN viewing the dashboard THEN the system SHALL display an "Active Matters" section showing:
   - Up to 5 most recently active matters
   - Completion percentage for each matter
   - Last activity timestamp
   - Deadline, budget, and amount used
   - Warning indicator for matters with no activity in 14+ days
6. WHEN viewing the dashboard THEN the system SHALL display a "Pending Actions" section showing counts of:
   - New matter requests from attorneys
   - Pro forma approvals needed
   - Scope amendments awaiting attorney approval
   - Completed matters ready to invoice
7. WHEN viewing the dashboard THEN the system SHALL display "Quick Stats" for the last 30 days showing:
   - Matters completed
   - Total invoiced amount
   - Total payments received
   - Average time to invoice
8. WHEN I click on any dashboard item THEN the system SHALL navigate to the relevant detailed page
9. WHEN the dashboard loads THEN the system SHALL refresh data to show current information
10. WHEN viewing the dashboard on mobile THEN the system SHALL display sections in a responsive single-column layout

### Requirement 5: Matter Archiving and Search

**User Story:** As an advocate, I want to search and filter matters quickly and archive old matters so that I can find historical work in seconds and keep my active matters list uncluttered.

#### Acceptance Criteria

1. WHEN I am on the Matters page THEN the system SHALL display a search box at the top
2. WHEN I type in the search box THEN the system SHALL search matter title, attorney firm name, and brief description in real-time
3. WHEN I click "Advanced Filters" THEN the system SHALL display filter options for:
   - Practice area (dropdown)
   - Matter type (dropdown)
   - Status (dropdown with multiple selection)
   - Date range (custom date picker)
   - Attorney firm (dropdown)
   - Fee range (min/max inputs)
4. WHEN I apply filters THEN the system SHALL display only matters matching all selected criteria
5. WHEN I select a sort option THEN the system SHALL sort matters by: Deadline, Date Created, Total Fee, or Last Activity
6. WHEN viewing the Matters page THEN the system SHALL provide a checkbox to "Include Archived" matters in results
7. WHEN I archive a matter THEN the system SHALL:
   - Remove it from the default matters list
   - Keep all data intact
   - Allow it to be found via search when "Include Archived" is checked
   - Provide an "Unarchive" action to restore it
8. WHEN I attempt to delete a matter THEN the system SHALL show a confirmation dialog warning that deletion is permanent
9. WHEN I delete a matter THEN the system SHALL permanently remove all associated data
10. WHEN viewing matter status options THEN the system SHALL include: Active, New Request, Awaiting Approval, Completed, Paid, Declined, On Hold, and Archived
11. WHEN I export matters THEN the system SHALL export the currently filtered/searched results to CSV
12. WHEN viewing search results THEN the system SHALL display the count of results (e.g., "Showing 12 of 45 matters")
13. WHEN no matters match my search THEN the system SHALL display a helpful "No results found" message with suggestions to clear filters
14. WHEN I clear all filters THEN the system SHALL reset to show all active (non-archived) matters
15. WHEN viewing archived matters THEN the system SHALL display an "Archived" badge on each matter card

## Success Criteria

- Advocates can accurately track partial payments and see real outstanding balances
- Outstanding Fees Report shows actual amounts owed, not original invoice totals
- Disbursements are clearly separated from professional fees on invoices
- All invoices have sequential numbering with no gaps (except documented voids)
- VAT-registered advocates generate SARS-compliant tax invoices
- Dashboard provides at-a-glance view of urgent items and financial health
- Advocates can find any historical matter within 30 seconds using search
- Active matters list remains uncluttered through archiving
- System passes SARS audit requirements for invoice numbering and VAT compliance
- Cashflow tracking is accurate for provisional tax calculations

## Business Impact

### Without These Features (Annual Risk)
- Missed disbursements: -R30,000
- SARS penalties: -R15,000
- Lost clients (missed deadlines): -R80,000
- Unbillable work tracking issues: -R75,000
- Lost fee disputes: -R40,000
- **Total Annual Risk: -R240,000**

### With These Features (Annual Benefit)
- All disbursements billed: +R30,000
- SARS-compliant from day 1: +R15,000
- No missed deadlines: +R80,000
- Improved efficiency: +R37,500
- Win fee disputes: +R40,000
- **Total Annual Benefit: +R202,500**

## Compliance Requirements

- **SARS Income Tax Act**: Sequential invoice numbering without gaps
- **VAT Act**: Tax invoice requirements for VAT-registered advocates
- **POPIA (Protection of Personal Information Act)**: Audit trail for data access
- **ECTA (Electronic Communications and Transactions Act)**: Digital evidence admissibility

## Dependencies

- Existing invoice generation system
- Matter management system
- Database schema for payments, disbursements, and audit logs
- PDF generation service for tax-compliant invoices
- Reporting system for Outstanding Fees and WIP reports
