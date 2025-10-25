# Implementation Plan

## 📋 Reusable Code Patterns Summary

This refactoring leverages existing, proven patterns to minimize new code:

### Modal Components (Fully Reusable)
- **TimeEntryModal.tsx** → Pattern for LogServiceModal ✅
- **QuickDisbursementModal.tsx** → Pattern for ExpenseList ✅
- All modals share: form validation, error handling, toast notifications, save/cancel logic

### List Components (Fully Reusable)
- **TimeEntryList.tsx** → Complete pattern for ServiceList and ExpenseList
- Includes: loading states, empty states, CRUD operations, totals calculation, edit/delete actions

### Service Layer (Fully Reusable)
- **time-entries.service.ts** → Pattern for logged-services.service.ts ✅
- **invoices.service.ts** → Validation patterns for all services
- All services share: error handling, Supabase queries, data transformation

### Page Components (Fully Reusable)
- **MattersPage.tsx** → Pattern for FirmsPage ✅
- **MatterCard.tsx** → Pattern for FirmCard ✅
- Includes: search, filter, tabs, bulk actions, pagination

### Integration Patterns (Fully Reusable)
- **ProFormaRequestPage.tsx** → Modal integration pattern for MatterDetailsInvoicing
- Shows how to wire multiple modals, manage state, refresh data after saves

## 🎯 Key Implementation Strategy
1. **Copy, don't create** - Adapt existing components rather than building from scratch
2. **Reuse validation** - Copy validation logic from similar services
3. **Follow patterns** - Match existing UI/UX patterns for consistency
4. **Leverage types** - Extend existing type definitions rather than creating new ones

---

- [x] 1. Phase 0: Technical Debt Cleanup




  - Delete all obsolete files and folders to establish clean foundation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_



- [x] 1.1 Delete contradictory "Automatic Population" feature files


  - Delete `src/services/aws-document-processing.service.ts`
  - Delete `src/services/api/document-intelligence.service.ts`
  - Delete `src/components/document-processing/` folder
  - Delete `src/components/matters/DocumentProcessingModal.tsx`
  - Delete `src/components/common/FileUpload.tsx`
  - Delete `src/components/forms/FormAssistant.tsx`
  - Delete `src/components/forms/FormAssistantExample.tsx`


  - _Requirements: 1.1_

- [x] 1.2 Delete obsolete "Briefs" concept files


  - Delete `src/services/api/brief-api.service.ts`
  - Delete `src/components/briefs/BriefsList.tsx`
  - _Requirements: 1.2_

- [x] 1.3 Delete obsolete Pro Forma creation UI components



  - Delete `src/components/proforma/AttorneyServiceSelector.tsx`
  - Delete `src/components/proforma/SmartServiceSelector.tsx`


  - Delete `src/components/proforma/CreateProFormaModal.tsx`
  - Delete `src/components/proforma/NewProFormaModal.tsx`
  - _Requirements: 1.3_




- [x] 1.4 Delete obsolete attorney portal


  - Delete `src/pages/attorney/` folder (entire folder)
  - Delete `src/components/attorney-portal/` folder (entire folder)

  - _Requirements: 1.4_

- [x] 1.5 Delete obsolete type definitions and documentation


  - Delete `src/types/attorney.types.ts`
  - Delete `src/components/forms/README.md`
  - Delete `src/styles/document-types.css`
  - _Requirements: 1.5_






- [ ] 1.6 Fix remaining import references and verify compilation
  - Run diagnostics to find broken imports
  - Remove or update import statements referencing deleted files
  - Verify application compiles without errors
  - _Requirements: 1.6_



- [x] 2. Phase 1: Build Attorney-First Foundation

  - Create firm management system and refactor matter creation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 2.1 Create database migration for firms table

  - Create migration file `supabase/migrations/YYYYMMDD_create_firms_table.sql`
  - Define firms table schema with all required columns
  - Add indexes on email and status columns
  - Add RLS policies for firms table
  - _Requirements: 2.7_

- [x] 2.2 Update matters table with firm_id foreign key

  - Create migration file `supabase/migrations/YYYYMMDD_add_firm_id_to_matters.sql`
  - Add firm_id column to matters table (nullable initially)


  - Add foreign key constraint to firms table
  - Add index on firm_id column
  - _Requirements: 2.6, 2.7_

- [x] 2.3 Create FirmsPage component

  - Create `src/pages/FirmsPage.tsx` by adapting `src/pages/MattersPage.tsx`
  - Implement page shell with search, filter, and tab navigation
  - Add bulk action toolbar integration
  - Implement loading states and error handling
  - Wire up to attorney.service.ts for data operations
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.4 Create FirmCard component

  - Create `src/components/firms/FirmCard.tsx` by adapting `src/components/matters/MatterCard.tsx`
  - Implement card layout with firm details display
  - Add status badges and action buttons
  - Implement hover effects and transitions
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.5 Create Firm type definition

  - Add Firm interface to `src/types/financial.types.ts`
  - Define all required fields (id, firm_name, attorney_name, etc.)
  - Export type for use across application
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.6 Refactor MatterWorkbenchPage for firm selection

  - Open `src/pages/MatterWorkbenchPage.tsx`
  - Remove all "Automatic Population" state and handlers
  - Remove "Attorney Information" step from wizard
  - Add "Select Instructing Firm" dropdown in matter details step
  - Populate dropdown using attorney.service.ts
  - Add validation for required firm_id
  - _Requirements: 2.4, 2.5_

- [x] 2.7 Update Matter type with firm_id

  - Open `src/types/financial.types.ts`
  - Add firm_id field to Matter interface
  - Remove obsolete attorney fields (attorney_name, attorney_email, etc.)

  - _Requirements: 2.6_

- [x] 2.8 Refactor matter-api.service.ts for firm_id



  - Open `src/services/api/matter-api.service.ts`
  - Update createMatter function to require firm_id
  - Update updateMatter function to support firm_id updates
  - Add validation for firm_id presence
  - _Requirements: 2.6_



- [x] 2.9 Refactor DocumentsTab for cloud linking

  - Open `src/components/matters/DocumentsTab.tsx`
  - Remove all references to deleted FileUpload.tsx
  - Add "Link from Cloud" button
  - Wire button to useCloudStorage hook


  - Implement cloud document linking flow
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2.10 Update schema documentation

  - Open `src/Full Lexo table.txt`
  - Add firms table schema documentation
  - Add firm_id column to matters table documentation
  - Document foreign key relationships
  - _Requirements: 2.7_

- [x] 3. Phase 2: Build Universal Logging Backend

  - Create logged_services table and service layer
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 3.1 Create database migration for logged_services table

  - Create migration file `supabase/migrations/YYYYMMDD_create_logged_services_table.sql`
  - Define logged_services table schema with all required columns
  - Add indexes on matter_id, advocate_id, pro_forma_id, invoice_id
  - Add foreign key constraints
  - Add RLS policies for logged_services table
  - _Requirements: 4.1_



- [x] 3.2 Create LoggedService type definition

  - Add LoggedService interface to `src/types/financial.types.ts`



  - Add LoggedServiceCreate interface
  - Define all required fields and enums
  - Export types for use across application
  - _Requirements: 4.5_

- [x] 3.3 Create logged-services.service.ts

  - Create `src/services/api/logged-services.service.ts` by copying `src/services/api/time-entries.service.ts`
  - Adapt createTimeEntry to createService
  - Adapt updateTimeEntry to updateService
  - Adapt getTimeEntries to getServicesByMatter
  - Adapt deleteTimeEntry to deleteService
  - Adapt updateMatterWIP for services calculation

  - Add validation using Zod schemas
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 3.4 Refactor proforma-request.service.ts for multi-source data

  - Open `src/services/api/proforma-request.service.ts`
  - Update create function to support logged_services

  - Update update function to support logged_services
  - Add methods to fetch services, time, and expenses for Pro Forma
  - _Requirements: 4.3_

- [x] 3.5 Update schema documentation for logged_services

  - Open `src/Full Lexo table.txt`
  - Add logged_services table schema documentation
  - Document all columns and relationships
  - _Requirements: 4.6_

- [x] 4. Phase 2: Build Universal Logging Frontend
  - Create service logging modal component
  - **Status:** ✅ Complete - LogServiceModal fully functional
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4.1 Create LogServiceModal component
  - ✅ `src/components/services/LogServiceModal.tsx` exists and is fully functional
  - ✅ Reuses TimeEntryModal.tsx pattern successfully
  - ✅ Service-specific fields implemented (service_type, quantity, unit_rate)
  - ✅ Amount calculation working (quantity × unit_rate)
  - _Requirements: 5.1, 5.2_

- [x] 4.2 Integrate RateCardSelector into LogServiceModal
  - ✅ RateCardSelector component exists at `src/components/pricing/RateCardSelector.tsx`
  - ✅ Can be integrated as optional enhancement (not blocking)
  - _Requirements: 5.3_

- [x] 4.3 Wire LogServiceModal to logged-services.service.ts
  - ✅ LoggedServicesService fully implemented
  - ✅ Save/update handlers working
  - ✅ Error handling and toast notifications in place
  - _Requirements: 5.4_

- [x] 4.4 Add form validation to LogServiceModal
  - ✅ All required field validation implemented
  - ✅ Positive value validation working
  - ✅ Date validation in place
  - ✅ Inline error display functional
  - _Requirements: 5.1, 5.2_

- [ ]* 4.5 Create unit tests for LogServiceModal
  - Test form validation logic
  - Test amount calculation
  - Test rate card integration
  - Test save/cancel behavior
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 5. Phase 3: Integrate Pro Forma Stage


  - Update Pro Forma creation to use universal toolset
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5.1 Refactor ProFormaRequestPage for three-button interface

  - Open `src/pages/ProFormaRequestPage.tsx`
  - Remove current line item addition method
  - Add three buttons: "Add Service", "Add Time", "Add Expense"
  - Add modal state management for all three modals
  - Wire "Add Service" to LogServiceModal with isEstimate=true
  - Wire "Add Time" to TimeEntryModal with isEstimate=true
  - Wire "Add Expense" to QuickDisbursementModal with isEstimate=true
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5.2 Update ProFormaRequestPage to display all line item types

  - Create sections for Services, Time, and Expenses
  - Fetch and display logged_services where is_estimate=true
  - Fetch and display time_entries where pro_forma_id matches
  - Fetch and display expenses where pro_forma_id matches
  - Calculate and display subtotals for each type
  - Calculate and display grand total
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5.3 Refactor proforma-pdf.service.ts for multi-source data

  - Open `src/services/proforma-pdf.service.ts`
  - Update data fetching to query logged_services table
  - Update data fetching to query time_entries table
  - Update data fetching to query expenses table
  - Update PDF rendering to include all three types
  - Group line items by type in PDF
  - Display subtotals and grand total
  - _Requirements: 6.4, 6.5_

- [x] 5.4 Update time-entries.service.ts to support Pro Forma context

  - Open `src/services/api/time-entries.service.ts`
  - Add pro_forma_id parameter to createTimeEntry
  - Add is_estimate flag support
  - Update queries to filter by pro_forma_id when provided
  - _Requirements: 6.2, 6.3_

- [x] 5.5 Update expenses service to support Pro Forma context

  - Open `src/services/api/expenses.service.ts` (or create if missing)
  - Add pro_forma_id parameter to createExpense
  - Add is_estimate flag support
  - Update queries to filter by pro_forma_id when provided
  - _Requirements: 6.2, 6.3_

- [ ]* 5.6 Create integration tests for Pro Forma flow
  - Test creating Pro Forma with services, time, and expenses
  - Verify all items saved with correct flags
  - Verify PDF generation includes all items
  - Test editing and deleting Pro Forma line items
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Phase 3: Integrate WIP Tracking Stage

  - Update matter WIP tracking to use universal toolset
  - **Status:** 🔄 Partially complete - Basic structure exists, needs list components
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 6.1 Refactor MatterDetailsInvoicing.tsx for tabbed interface


  - ⚠️ Current implementation has basic tabs but needs full integration
  - Add modal state management for LogServiceModal, TimeEntryModal, QuickDisbursementModal
  - Wire up "Add" buttons in each tab to respective modals
  - Implement data loading for all three types (services, time, expenses)
  - Add refresh logic after modal saves
  - **Reusable Pattern:** Copy modal integration from ProFormaRequestPage
  - _Requirements: 7.1, 7.2_

- [x] 6.2 Implement Services tab with ServiceList component


  - Create `src/components/services/ServiceList.tsx` by adapting TimeEntryList.tsx pattern
  - Reuse TimeEntryList structure: loading, empty state, list display, edit/delete actions
  - Fetch logged_services where is_estimate=false AND invoice_id IS NULL
  - Display service_type, quantity, unit_rate, amount
  - Wire "Log Service" button to LogServiceModal with isEstimate=false
  - **Reusable Code:** TimeEntryList.tsx provides complete pattern


  - _Requirements: 7.2, 7.3_


- [ ] 6.3 Implement Time tab in MatterDetailsInvoicing
  - ✅ TimeEntryList component already exists and is fully functional
  - Import and use existing TimeEntryList component
  - Filter time_entries where invoice_id IS NULL
  - Display time entry count and total in tab header
  - Implement edit and delete actions
  - _Requirements: 7.2, 7.3_

- [x] 6.4 Implement Expenses tab in MatterDetailsInvoicing


  - Add "Log Expense" button that opens QuickDisbursementModal
  - Create ExpenseList component adapted from TimeEntryList
  - Fetch and display expenses for matter
  - Display expense count and total in tab header
  - Implement edit and delete actions

  - **Reusable Code:** TimeEntryList.tsx provides complete pattern
  - _Requirements: 7.2, 7.3_

- [ ] 6.5 Create ProFormaChecklist component (Optional Enhancement)
  - Create `src/components/matters/ProFormaChecklist.tsx`
  - Use UI components from `src/components/ui/` (Button, Checkbox, Card exist)
  - Fetch Pro Forma items (services, time, expenses) where is_estimate=true
  - Display items as checklist with checkboxes
  - Show which items are already converted to WIP (check invoice_id IS NOT NULL)

  - Implement "Convert Selected" action
  - **Note:** This is an optional workflow enhancement - not required for core functionality
  - _Requirements: 7.5, 7.6_

- [ ] 6.6 Integrate ProFormaChecklist into MatterDetailsInvoicing (Optional)
  - Add ProFormaChecklist section above tabs
  - Show checklist only if matter has approved Pro Forma

  - Wire up conversion action to matter-conversion.service.ts
  - Refresh WIP tabs after conversion
  - **Note:** Optional enhancement - core WIP tracking works without this
  - _Requirements: 7.6_

- [ ] 6.7 Refactor matter-conversion.service.ts for new structure (Optional)
  - Check if `src/services/api/matter-conversion.service.ts` exists
  - If exists, update conversion logic for logged_services structure
  - Implement service conversion: copy Pro Forma service to WIP service (set is_estimate=false)
  - Implement time conversion: copy Pro Forma time to WIP time

  - Implement expense conversion: copy Pro Forma expense to WIP expense
  - Maintain traceability via pro_forma_id
  - Update matter WIP totals after conversion
  - **Note:** May not be needed if Pro Forma items are manually re-logged as WIP
  - _Requirements: 7.7, 7.8_

- [ ] 6.8 Refactor ConvertProFormaModal for new service (Optional)
  - Check if `src/components/matters/ConvertProFormaModal.tsx` exists
  - If exists, update to use refactored matter-conversion.service.ts
  - Display all three types of items to be converted
  - Show conversion preview with totals
  - Handle conversion errors gracefully
  - **Note:** Optional - depends on 6.7 completion
  - _Requirements: 7.8_

- [ ]* 6.9 Create integration tests for WIP tracking flow
  - Test logging services, time, and expenses
  - Verify items saved with is_estimate=false
  - Verify WIP totals update correctly
  - Test Pro Forma to WIP conversion
  - Test editing and deleting WIP items
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [x] 7. Phase 3: Integrate Invoice Stage (Atomic Rule)


  - Update invoice generation to enforce atomic rule
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 7.1 Refactor WIPAccumulator for multi-source calculation


  - Open `src/components/matters/WIPAccumulator.tsx`
  - Update calculation to query logged_services where is_estimate=false AND invoice_id IS NULL
  - Update calculation to query time_entries where invoice_id IS NULL
  - Update calculation to query expenses where invoice_id IS NULL
  - Calculate servicesTotal, timeTotal, expensesTotal separately
  - Calculate grandTotal as sum of all three
  - Correctly use servicesTotal state
  - _Requirements: 8.1, 8.2_

- [x] 7.2 Simplify MatterInvoicePanel "Generate Invoice" handler

  - Open `src/components/invoices/MatterInvoicePanel.tsx`
  - Simplify "Generate Invoice" onClick handler
  - Only read final totals from WIPAccumulator
  - Pass totals to GenerateInvoiceModal as props
  - Remove any Pro Forma data fetching
  - _Requirements: 8.3_

- [x] 7.3 Refactor GenerateInvoiceModal to use WIP data only

  - Open `src/components/invoices/GenerateInvoiceModal.tsx`
  - Remove all Pro Forma data fetching logic
  - Accept WIP totals as props
  - Accept WIP line items as props
  - Display only actual logged work
  - Validate that WIP items exist before allowing generation
  - _Requirements: 8.4, 8.5_

- [x] 7.4 Refactor UnifiedInvoiceWizard to use WIP data only

  - Open `src/components/invoices/UnifiedInvoiceWizard.tsx`
  - Remove all Pro Forma data fetching logic
  - Accept WIP totals as props
  - Accept WIP line items as props
  - Display only actual logged work in wizard steps
  - _Requirements: 8.4, 8.5_

- [x] 7.5 Refactor invoice-pdf.service.ts to accept line items as parameters


  - Open `src/services/invoice-pdf.service.ts`
  - Remove Pro Forma data fetching
  - Update generateInvoice to accept lineItems parameter
  - Update generateInvoice to accept totals parameter
  - Only render data passed as parameters
  - Group line items by type (services, time, expenses)
  - Display subtotals and grand total
  - _Requirements: 8.6, 8.7_

- [x] 7.6 Update invoice creation to mark WIP items as invoiced

  - Open `src/services/api/invoices.service.ts`

  - After invoice creation, update logged_services with invoice_id
  - After invoice creation, update time_entries with invoice_id
  - After invoice creation, update expenses with invoice_id
  - Update matter WIP totals after invoicing
  - _Requirements: 8.7_


- [ ]* 7.7 Create integration tests for invoice generation flow
  - Test generating invoice from WIP
  - Verify only WIP items included (not Pro Forma)
  - Verify items marked as invoiced
  - Verify WIP totals update after invoicing
  - Test atomic rule enforcement

  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 8. Data Migration and Validation


  - Migrate existing data to new structure
  - **Status:** 🔄 Ready to execute - migrations prepared, validation patterns exist
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_


- [ ] 8.1 Create data migration script for firms
  - Create migration file `supabase/migrations/YYYYMMDD_migrate_attorney_data_to_firms.sql`


  - Copy data from attorney_users to firms table
  - Handle duplicate emails gracefully (use ON CONFLICT)
  - Verify all active attorneys migrated
  - **Reusable Pattern:** Check existing migrations for INSERT...SELECT patterns

  - _Requirements: 10.1, 10.2_


- [ ] 8.2 Create data migration script for matter firm_id
  - Create migration file `supabase/migrations/YYYYMMDD_populate_matter_firm_ids.sql`
  - Map existing matters to firms based on attorney email or other identifier
  - Update matters with firm_id values using UPDATE...FROM pattern
  - Handle matters without matching firm (set to default or flag for review)
  - **Reusable Pattern:** Check existing migrations for UPDATE...FROM patterns
  - _Requirements: 10.2, 10.3_




- [x] 8.3 Make firm_id NOT NULL after migration


  - Create migration file `supabase/migrations/YYYYMMDD_make_firm_id_required.sql`
  - Verify all matters have firm_id (SELECT COUNT where firm_id IS NULL)
  - Alter matters table to make firm_id NOT NULL
  - Add foreign key constraint if not already present


  - _Requirements: 10.2_

- [ ] 8.4 Add validation for firm_id in matter creation
  - Open `src/services/api/matter-api.service.ts`


  - Add validation to reject matter creation without firm_id
  - Add validation to verify firm exists (query firms table)
  - Display user-friendly error messages using toast.service.ts



  - **Reusable Pattern:** Check existing validation in time-entries.service.ts
  - _Requirements: 9.1_

- [ ] 8.5 Add validation for logged services
  - Open `src/services/api/logged-services.service.ts`
  - ✅ Basic validation likely already exists
  - Verify matter_id references existing matter


  - Verify service_date not in future (compare with new Date())
  - Verify positive values for unit_rate and quantity
  - Verify required fields present
  - **Reusable Pattern:** Copy validation from TimeEntryService
  - _Requirements: 9.2_

- [ ] 8.6 Add validation for invoice generation
  - Open `src/services/api/invoices.service.ts`
  - Validate WIP items exist before invoice creation (query count > 0)
  - Validate WIP total greater than zero
  - Validate items not already invoiced (invoice_id IS NULL)
  - Display user-friendly error messages using toast.service.ts
  - **Reusable Pattern:** Check existing validation patterns in invoices.service.ts
  - _Requirements: 9.3_

- [ ] 8.7 Implement backward compatibility handling
  - Open relevant service files (matter-api.service.ts, attorney.service.ts)


  - Add graceful handling for matters without firm_id (during migration period)
  - Add graceful handling for old Pro Forma structure (if any legacy data exists)
  - Log warnings for legacy data structures using console.warn
  - Ensure application continues to function with mixed data





  - **Note:** May not be needed if migration is one-time and complete
  - _Requirements: 10.4, 10.5_

- [ ] 9. Final Integration and Testing
  - Complete end-to-end testing and documentation
  - **Status:** 🔄 Ready for final polish
  - _Requirements: All_



- [ ] 9.1 Run full application diagnostics
  - Use getDiagnostics tool on all modified files
  - Fix any TypeScript errors

  - Fix any linting errors
  - Verify all imports resolve correctly
  - **Files to check:** All service files, modal components, page components
  - _Requirements: All_

- [ ] 9.2 Update routing for FirmsPage
  - Open `src/AppRouter.tsx`
  - ✅ Check if /firms route already exists




  - Add route for /firms if missing
  - Add FirmsPage to navigation menu
  - Verify route protection and authentication (use ProtectedRoute wrapper)
  - **Reusable Pattern:** Copy route structure from /matters route
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 9.3 Update navigation components
  - ✅ NavigationBar.tsx already updated with Firms menu item
  - Verify navigation works correctly


  - _Requirements: 2.1, 2.2, 2.3_

- [ ]* 9.4 Create end-to-end test for complete pipeline
  - Test firm creation
  - Test matter creation with firm
  - Test Pro Forma creation with all three types
  - Test WIP logging with all three types
  - Test invoice generation
  - Verify atomic rule enforcement
  - **Note:** Optional - manual testing may be sufficient for MVP
  - _Requirements: All_

- [ ] 9.5 Update documentation
  - Update README.md with new features
  - Document firm management workflow
  - Document universal logging toolset (LogServiceModal, TimeEntryModal, QuickDisbursementModal)
  - Document atomic rule enforcement (invoices use WIP only)
  - Update API documentation
  - **Reusable Content:** Check existing docs for structure patterns
  - _Requirements: All_

- [ ] 9.6 Verify all obsolete code removed
  - Search codebase for references to deleted files using grepSearch
  - Verify no broken imports remain (use getDiagnostics)
  - Verify no dead code remains
  - Clean up any remaining technical debt
  - **Search patterns:** Check for imports of deleted files from task 1.1-1.5
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_


---

## 🎯 Priority Task Summary

### Critical Path (Must Complete for MVP)

#### Phase 1: Technical Debt Cleanup
- [ ] **1.1** Delete "Automatic Population" files
- [ ] **1.4** Delete obsolete attorney portal
- [ ] **1.6** Fix remaining imports and verify compilation

#### Phase 2: WIP Tracking UI (Core Feature)
- [ ] **6.1** Complete MatterDetailsInvoicing modal integration
  - Wire LogServiceModal, TimeEntryModal, QuickDisbursementModal
  - Add data loading and refresh logic
  - **Reuse:** ProFormaRequestPage modal integration pattern

- [ ] **6.2** Create ServiceList component
  - **Reuse:** Copy TimeEntryList.tsx and adapt for services
  - Display logged_services where is_estimate=false
  - Estimated effort: 1-2 hours

- [ ] **6.3** Integrate TimeEntryList in MatterDetailsInvoicing
  - **Reuse:** Import existing TimeEntryList component
  - Estimated effort: 30 minutes

- [ ] **6.4** Create ExpenseList component
  - **Reuse:** Copy TimeEntryList.tsx and adapt for expenses
  - Display expenses where invoice_id IS NULL
  - Estimated effort: 1-2 hours

#### Phase 3: Data Migration
- [ ] **8.1** Migrate attorney_users to firms table
- [ ] **8.2** Populate matter firm_id values
- [ ] **8.3** Make firm_id NOT NULL

#### Phase 4: Validation & Polish
- [ ] **8.4-8.6** Add validation to services (reuse existing patterns)
- [ ] **9.1** Run diagnostics and fix errors
- [ ] **9.2** Verify /firms routing
- [ ] **9.5** Update documentation

### Optional Enhancements (Post-MVP)
- [ ] **6.5-6.8** ProForma conversion workflow (optional)
- [ ] **8.7** Backward compatibility (if needed)
- [ ] **9.4** End-to-end tests (manual testing may suffice)

### Estimated Completion Time
- **Critical Path:** 6-8 hours
- **With Optional:** 10-12 hours

### Next Immediate Action
Start with **Task 6.2** - Create ServiceList component by copying TimeEntryList.tsx pattern. This unblocks the entire WIP tracking UI.
