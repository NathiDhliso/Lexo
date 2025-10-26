# Implementation Plan: Pre-Launch Financial Features

## Overview

This implementation plan breaks down the five high-priority features into discrete, manageable coding tasks. Each task builds incrementally on previous work and includes specific requirements references. Tasks are organized by feature area and prioritized for logical dependencies.

---

## Feature 1: Partial Payments System

- [-] 1. Database schema for partial payments

  - Create migration to add payment tracking columns to invoices table
  - Add amount_paid, outstanding_balance, payment_status columns
  - Create invoice_payment_history view for reporting
  - Add indexes for performance
  - _Requirements: 1.1, 1.9_

- [ ] 1.1 Implement payment calculation functions
  - Create database function to calculate outstanding balance
  - Create database function to determine payment status
  - Add trigger to auto-update balances on payment insert/update
  - _Requirements: 1.4, 1.5_

- [ ] 1.2 Create PaymentService class
  - Implement recordPayment() method with validation
  - Implement getPaymentHistory() method
  - Implement updatePayment() method with audit trail
  - Implement deletePayment() method with soft delete
  - Add error handling and validation
  - _Requirements: 1.2, 1.3, 1.4, 1.10_

- [ ] 1.3 Build RecordPaymentModal component
  - Create modal UI with form fields (amount, date, method, reference)
  - Add real-time balance calculation display
  - Implement validation (amount > 0, amount <= outstanding)
  - Add success/error toast notifications
  - _Requirements: 1.2, 1.3, 1.4_

- [ ] 1.4 Build PaymentHistoryTable component
  - Display all payments for an invoice in table format
  - Show running balance calculation
  - Add edit/delete actions with confirmation dialogs
  - Implement export to CSV functionality
  - _Requirements: 1.9, 1.10_

- [ ] 1.5 Update InvoiceDetailsModal to show payment info
  - Display original amount, amount paid, outstanding balance
  - Add "Record Payment" button
  - Show payment history table
  - Update status badge to reflect payment_status
  - _Requirements: 1.9_

- [ ] 1.6 Update Outstanding Fees Report
  - Modify report to show outstanding_balance instead of total_amount
  - Add "Amount Paid" column
  - Filter to show only invoices with outstanding balance > 0
  - Add aging brackets (0-30, 31-60, 61-90, 90+ days)
  - _Requirements: 1.7_

- [ ] 1.7 Update Revenue Report for payment dates
  - Group payments by payment_date month instead of invoice_date
  - Show monthly cashflow based on actual payments received
  - Add comparison to invoiced amounts
  - _Requirements: 1.8_

- [ ]* 1.8 Write unit tests for payment calculations
  - Test outstanding balance calculation
  - Test payment status determination
  - Test validation logic
  - Test edge cases (overpayment, zero balance)
  - _Requirements: 1.4, 1.5_

---

## Feature 2: Disbursements System

- [ ] 2. Database schema for disbursements
  - Create disbursements table with all required fields
  - Add VAT calculation as generated columns
  - Create indexes for matter_id and invoice_id
  - Add index for unbilled disbursements
  - _Requirements: 2.1, 2.6_

- [ ] 2.1 Update WIP calculation to include disbursements
  - Modify calculate_matter_wip function to include unbilled disbursements
  - Update matter WIP value when disbursements are added/removed
  - Add disbursements to WIP Report
  - _Requirements: 2.8_

- [ ] 2.2 Create DisbursementService class
  - Implement createDisbursement() method
  - Implement getDisbursementsByMatter() method
  - Implement getUnbilledDisbursements() method
  - Implement updateDisbursement() and deleteDisbursement() methods
  - Implement markAsBilled() method for invoice generation
  - _Requirements: 2.1, 2.2, 2.9, 2.10_

- [ ] 2.3 Build LogDisbursementModal component
  - Create modal UI with form fields
  - Add VAT applicable toggle with default to Yes
  - Implement real-time VAT and total calculation display
  - Add receipt link input (optional)
  - Add validation (amount > 0, description required)
  - _Requirements: 2.2, 2.3_

- [ ] 2.4 Build DisbursementsTable component
  - Display disbursements list for a matter
  - Show description, amount, VAT, total, date
  - Add filter for billed/unbilled
  - Implement edit/delete actions
  - Add bulk select for invoice generation
  - _Requirements: 2.4_

- [ ] 2.5 Add disbursements section to MatterWorkbenchPage
  - Add "Log Disbursement" button
  - Display DisbursementsTable component
  - Show total unbilled disbursements value
  - _Requirements: 2.1, 2.4_

- [ ] 2.6 Update invoice generation to include disbursements
  - Modify InvoiceService.generateInvoice() to fetch unbilled disbursements
  - Add disbursements to invoice line items
  - Calculate VAT correctly based on vat_applicable flag
  - Mark disbursements as billed after invoice creation
  - _Requirements: 2.5, 2.6, 2.10_

- [ ] 2.7 Update invoice PDF template for disbursements
  - Add separate "DISBURSEMENTS" section in PDF
  - Show professional fees subtotal
  - Show disbursements subtotal
  - Show combined total with VAT breakdown
  - _Requirements: 2.5, 2.7_

- [ ]* 2.8 Write unit tests for disbursement calculations
  - Test VAT calculation logic
  - Test WIP value updates
  - Test invoice generation with disbursements
  - _Requirements: 2.6, 2.7_

---

## Feature 3: Invoice Numbering & VAT Compliance

- [ ] 3. Database schema for invoice settings
  - Create invoice_settings table
  - Create invoice_numbering_audit table
  - Add indexes for audit queries
  - Create generate_next_invoice_number() database function
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 3.1 Create InvoiceNumberingService class
  - Implement getSettings() method with defaults
  - Implement updateSettings() method with validation
  - Implement generateNextInvoiceNumber() method
  - Implement voidInvoiceNumber() method
  - Implement getNumberingAudit() method
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.9_

- [ ] 3.2 Update InvoiceService to use sequential numbering
  - Modify generateInvoice() to call generateNextInvoiceNumber()
  - Handle invoice generation failures (void number if failed)
  - Add audit logging for all invoice number assignments
  - _Requirements: 3.2, 3.3_

- [ ] 3.3 Build InvoiceSettingsForm component
  - Create settings form with all configuration fields
  - Add invoice number format selector (dropdown with presets)
  - Add credit note format selector
  - Display current sequence (read-only)
  - Add VAT registration toggle
  - Add VAT number input (conditional on registration)
  - Add VAT rate input with default 15%
  - Add advocate details fields for tax invoices
  - Show preview of next invoice number
  - _Requirements: 3.1, 3.5, 3.8_

- [ ] 3.4 Build InvoiceNumberingAuditLog component
  - Display audit log table with all number assignments
  - Show invoice number, type, status, date
  - Highlight voided numbers with reason
  - Add filter by date range
  - Add export to CSV for SARS compliance
  - _Requirements: 3.4, 3.9_

- [ ] 3.5 Update invoice PDF template for VAT compliance
  - Add "TAX INVOICE" header (if VAT registered)
  - Include all SARS-required fields
  - Display VAT number prominently
  - Show advocate details from settings
  - Include customer VAT number if available
  - Format amounts with clear VAT breakdown
  - _Requirements: 3.5_

- [ ] 3.6 Implement VAT rate history tracking
  - Add vat_rate_history JSON column to invoice_settings
  - Create UI to add future VAT rate changes
  - Apply correct VAT rate based on invoice date
  - Display historical VAT rates in settings
  - _Requirements: 3.8, 3.9_

- [ ] 3.7 Add invoice settings to SettingsPage
  - Create new "Invoicing" tab in settings
  - Include InvoiceSettingsForm component
  - Include InvoiceNumberingAuditLog component
  - Add help text explaining SARS requirements
  - _Requirements: 3.1_

- [ ]* 3.8 Write unit tests for invoice numbering
  - Test sequential number generation
  - Test year rollover logic
  - Test void number handling
  - Test format string parsing
  - _Requirements: 3.2, 3.3, 3.4_

- [ ]* 3.9 Write integration tests for VAT compliance
  - Test complete invoice generation with VAT
  - Test PDF generation with all required fields
  - Verify sequential numbering integrity
  - _Requirements: 3.5, 3.10_

---

## Feature 4: Enhanced Dashboard

- [ ] 4. Create DashboardService class
  - Implement getMetrics() method with caching
  - Implement getUrgentAttention() method
  - Implement getFinancialSnapshot() method
  - Implement getActiveMattersWithProgress() method
  - Implement getPendingActions() method
  - Implement getQuickStats() method
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 4.1 Build UrgentAttentionCard component
  - Display matters with deadlines today
  - Display invoices overdue 45+ days
  - Display pro forma requests pending 5+ days
  - Use red/orange color scheme for urgency
  - Add click-through links to relevant pages
  - _Requirements: 4.2_

- [ ] 4.2 Build ThisWeekDeadlinesCard component
  - Display matters due within 7 days
  - Show deadline date and days remaining
  - Sort by deadline (soonest first)
  - Add "View All Deadlines" link
  - _Requirements: 4.3_

- [ ] 4.3 Build FinancialSnapshotCards component
  - Create 3 cards: Outstanding Fees, WIP, Month Invoiced
  - Display amounts and counts
  - Add quick links to detailed reports
  - Use currency formatting (R symbol)
  - _Requirements: 4.4_

- [ ] 4.4 Build ActiveMattersCard component
  - Display top 5 most recently active matters
  - Calculate and show completion percentage
  - Display last activity timestamp
  - Show deadline, budget, and amount used
  - Add warning indicator for stale matters (14+ days no activity)
  - Add "View All Matters" link
  - _Requirements: 4.5_

- [ ] 4.5 Build PendingActionsCard component
  - Display counts for 4 action types
  - Show: New requests, Pro forma approvals, Scope amendments, Ready to invoice
  - Add click-through links to filtered views
  - Use badge styling for counts
  - _Requirements: 4.6_

- [ ] 4.6 Build QuickStatsCard component
  - Display 4 metrics for last 30 days
  - Show: Matters completed, Invoiced amount, Payments received, Avg time to invoice
  - Use trend indicators (up/down arrows)
  - Add comparison to previous 30 days
  - _Requirements: 4.7_

- [ ] 4.7 Update DashboardPage layout
  - Reorganize dashboard with new components
  - Implement responsive grid layout
  - Add refresh button to reload all metrics
  - Add loading states for each section
  - Implement auto-refresh every 5 minutes
  - _Requirements: 4.1, 4.8, 4.9_

- [ ] 4.8 Optimize dashboard performance
  - Implement metrics caching (5 minute TTL)
  - Use React Query for data fetching
  - Add skeleton loaders for better UX
  - Lazy load non-critical sections
  - _Requirements: 4.9_

- [ ]* 4.9 Write unit tests for dashboard calculations
  - Test completion percentage calculation
  - Test stale matter detection
  - Test financial metrics aggregation
  - _Requirements: 4.5, 4.7_

---

## Feature 5: Matter Search & Archiving

- [ ] 5. Database schema for matter search
  - Add search_vector column to matters table
  - Add is_archived, archived_at, archived_by columns
  - Create full-text search index on search_vector
  - Create update_matter_search_vector() trigger function
  - Create search_matters() database function
  - _Requirements: 5.2, 5.6, 5.7_

- [ ] 5.1 Create MatterSearchService class
  - Implement search() method with all filter options
  - Implement archiveMatter() method with audit trail
  - Implement unarchiveMatter() method
  - Implement getArchivedMatters() method
  - Add pagination support
  - _Requirements: 5.2, 5.3, 5.4, 5.6, 5.7_

- [ ] 5.2 Build MatterSearchBar component
  - Create search input with icon
  - Implement real-time search (debounced)
  - Add clear button
  - Add "Advanced Filters" button
  - Show search result count
  - _Requirements: 5.2_

- [ ] 5.3 Build AdvancedFiltersModal component
  - Create modal with all filter options
  - Add practice area dropdown
  - Add matter type dropdown
  - Add status multi-select
  - Add date range picker
  - Add attorney firm dropdown
  - Add fee range inputs (min/max)
  - Add sort options dropdown
  - Add "Include Archived" checkbox
  - Add "Clear All Filters" button
  - _Requirements: 5.3, 5.4, 5.6_

- [ ] 5.4 Update MattersPage with search functionality
  - Integrate MatterSearchBar component
  - Integrate AdvancedFiltersModal component
  - Update matter list to show search results
  - Add "No results found" state with suggestions
  - Display active filter chips
  - Add result count display
  - _Requirements: 5.2, 5.3, 5.12, 5.13, 5.14_

- [ ] 5.5 Implement matter archiving functionality
  - Add "Archive" action to matter context menu
  - Add confirmation dialog with reason input
  - Update matter status to archived
  - Hide archived matters from default view
  - Add "Archived" badge to archived matters
  - _Requirements: 5.7, 5.15_

- [ ] 5.6 Build ArchivedMattersView component
  - Create separate view for archived matters
  - Add "Unarchive" action
  - Show archive date and reason
  - Add filter and search within archived
  - _Requirements: 5.7, 5.15_

- [ ] 5.7 Implement matter export functionality
  - Add "Export" button to matters page
  - Support CSV export of filtered results
  - Support PDF export of filtered results
  - Include all relevant matter fields
  - _Requirements: 5.11_

- [ ] 5.8 Add matter status management
  - Ensure all status options are available: Active, New Request, Awaiting Approval, Completed, Paid, Declined, On Hold, Archived
  - Add status change actions to matter detail modal
  - Add status filter to search
  - _Requirements: 5.10_

- [ ]* 5.9 Write unit tests for search functionality
  - Test search query parsing
  - Test filter application
  - Test pagination logic
  - Test archive/unarchive operations
  - _Requirements: 5.2, 5.3, 5.7_

- [ ]* 5.10 Write integration tests for matter search
  - Test full-text search with various queries
  - Test combined filters
  - Test archive workflow
  - Test export functionality
  - _Requirements: 5.2, 5.3, 5.7, 5.11_

---

## Integration & Testing

- [ ] 6. End-to-end integration testing
  - Test complete payment workflow (record, edit, delete)
  - Test complete disbursement workflow (log, include in invoice)
  - Test invoice generation with sequential numbering
  - Test dashboard metrics accuracy
  - Test matter search with all filter combinations
  - _Requirements: All_

- [ ] 6.1 Performance testing
  - Benchmark dashboard load time (<2 seconds target)
  - Benchmark search response time (<1 second target)
  - Test with large datasets (1000+ matters, 5000+ invoices)
  - Optimize slow queries
  - _Requirements: All_

- [ ] 6.2 Security audit
  - Verify RLS policies on all new tables
  - Test access control for all new endpoints
  - Validate input sanitization
  - Test audit trail completeness
  - _Requirements: All_

- [ ] 6.3 User acceptance testing
  - Create test scenarios for each feature
  - Conduct UAT with sample users
  - Gather feedback and iterate
  - Document known issues
  - _Requirements: All_

- [ ] 6.4 Documentation
  - Update user guide with new features
  - Create video tutorials for key workflows
  - Document API endpoints
  - Update database schema documentation
  - _Requirements: All_

- [ ] 6.5 Deployment preparation
  - Create database migration scripts
  - Prepare rollback plan
  - Configure monitoring and alerts
  - Set up feature flags for gradual rollout
  - _Requirements: All_

---

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped if time is constrained
- Each task should be completed and tested before moving to the next
- Requirements references link back to the requirements.md document
- Estimated total implementation time: 4-6 weeks for a single developer
- Priority order: Feature 3 (Invoice Numbering) → Feature 1 (Payments) → Feature 2 (Disbursements) → Feature 4 (Dashboard) → Feature 5 (Search)
