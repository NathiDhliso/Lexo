# Implementation Plan: Retainer Management UI

## Overview
This implementation plan focuses on building the user interface layer for LexoHub's existing retainer management system. The backend (database, API service, business logic) is already complete. Tasks focus on creating React components, hooks, and integrating retainer functionality into the existing UI.

## Task List

- [ ] 1. TypeScript types and utilities
  - Create `src/types/retainer.types.ts` with UI-specific interfaces (RetainerDisplayData, RetainerStats, etc.)
  - Create utility functions for balance calculations, percentage calculations, and color determination
  - Create date formatting utilities for transaction display
  - Export types from main types index
  - _Requirements: All_

- [ ] 2. Custom React hooks
- [ ] 2.1 Create useRetainer hook
  - Implement data fetching for retainer by matter ID using React Query
  - Implement mutations for create, deposit, drawdown, refund operations
  - Add optimistic updates for better UX
  - Handle loading and error states
  - Implement cache invalidation strategy
  - _Requirements: 1.1-1.7, 2.1-2.6, 3.1-3.8, 7.1-7.7_

- [ ] 2.2 Create useRetainerTransactions hook
  - Implement transaction history fetching with pagination
  - Add filtering by transaction type
  - Handle loading and error states
  - _Requirements: 4.1-4.7_

- [ ] 2.3 Create useAllRetainers hook
  - Fetch low balance retainers
  - Fetch expiring retainers
  - Aggregate statistics for dashboard
  - _Requirements: 5.1-5.7_

- [ ]* 2.4 Write unit tests for hooks
  - Test useRetainer data fetching and mutations
  - Test useRetainerTransactions pagination
  - Test useAllRetainers aggregation
  - Test error handling scenarios
  - _Requirements: All_

- [ ] 3. Core retainer components
- [ ] 3.1 Create RetainerBalanceCard component
  - Display current balance prominently with large typography
  - Implement progress bar with color coding (green/yellow/red)
  - Show percentage remaining and absolute amounts
  - Add quick action buttons (Add Deposit, Apply to Invoice, View History)
  - Implement dropdown menu for additional actions (Refund, Renew, Cancel, Edit)
  - Handle loading and empty states
  - _Requirements: 1.5, 1.6, 1.7, 6.1-6.7_

- [ ] 3.2 Create EmptyRetainerState component
  - Display when no retainer exists for matter
  - Show call-to-action to create retainer
  - Include brief explanation of retainer benefits
  - _Requirements: 1.1, 1.2_

- [ ] 3.3 Create RetainerBadge component
  - Small badge for matter cards showing balance
  - Color-coded based on percentage remaining
  - Tooltip on hover with full details
  - Click handler for quick preview
  - _Requirements: 6.1, 6.2_

- [ ]* 3.4 Write component tests
  - Test RetainerBalanceCard rendering and color coding
  - Test EmptyRetainerState call-to-action
  - Test RetainerBadge tooltip and click behavior
  - _Requirements: 1.1-6.7_

- [ ] 4. Retainer management modals
- [ ] 4.1 Create CreateRetainerModal component
  - Form with all required fields (type, amount, billing period, dates, auto-renew, notes)
  - Optional initial deposit field
  - Client-side validation (positive amounts, valid dates)
  - Submit handler that creates retainer and optional initial deposit
  - Success/error toast notifications
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 4.2 Create AddDepositModal component
  - Form with amount, reference, description, date fields
  - Show current balance and calculated new balance
  - Client-side validation
  - Visual feedback with green color theme
  - Success/error handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 4.3 Create ApplyRetainerModal component
  - Form with amount to apply and description
  - Show available balance and invoice amount
  - Calculate and display remaining balances (retainer and invoice)
  - Slider or quick-select buttons for common percentages
  - Validation: amount cannot exceed available balance or invoice amount
  - Success/error handling
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 4.4 Create ProcessRefundModal component
  - Form with refund amount and reason
  - Show available balance
  - Validation: amount cannot exceed balance, reason required
  - Confirmation step before processing
  - Success/error handling
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 4.5 Create EditRetainerModal component
  - Form for editing end date, auto-renew, low balance threshold, notes
  - Disable editing of amount and type (audit integrity)
  - Validation for dates
  - Success/error handling
  - _Requirements: 8.7, 8.8_

- [ ] 4.6 Create RenewRetainerModal component
  - Simple form to set new end date
  - Confirmation message
  - Success/error handling
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 4.7 Create CancelRetainerModal component
  - Require cancellation reason
  - Warning if balance remains (suggest refund first)
  - Confirmation step
  - Success/error handling
  - _Requirements: 8.4, 8.5, 8.6_

- [ ]* 4.8 Write modal component tests
  - Test form validation in all modals
  - Test submission handlers
  - Test error scenarios
  - Test accessibility (keyboard navigation, focus management)
  - _Requirements: 1.1-8.8_

- [ ] 5. Transaction history components
- [ ] 5.1 Create RetainerTransactionHistory component
  - List view of all transactions in reverse chronological order
  - Visual indicators for transaction types (↑ deposit, ↓ drawdown, ⟲ refund)
  - Color coding (green deposits, red drawdowns, orange refunds)
  - Show date, type, amount, description, balance before/after
  - Clickable invoice references that navigate to invoice detail
  - Pagination (20 transactions per page)
  - Export to CSV button
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 5.2 Create TransactionListItem component
  - Individual transaction card/row
  - Responsive layout for mobile
  - Collapsible details on mobile
  - _Requirements: 4.1-4.7, 9.4_

- [ ]* 5.3 Write transaction component tests
  - Test transaction list rendering
  - Test pagination
  - Test export functionality
  - Test invoice link navigation
  - _Requirements: 4.1-4.7_

- [ ] 6. Matter detail page integration
- [ ] 6.1 Create RetainerSection component
  - Container for all retainer UI on matter detail page
  - Conditionally render RetainerBalanceCard or EmptyRetainerState
  - Include RetainerTransactionHistory
  - Handle modal state management
  - _Requirements: 1.1-1.7, 4.1-4.7_

- [ ] 6.2 Integrate RetainerSection into MatterDetailPage
  - Add RetainerSection after matter details, before time entries
  - Pass matterId prop
  - Ensure proper spacing and layout
  - _Requirements: 1.1, 1.5, 1.6_

- [ ] 6.3 Add retainer badge to MatterCard
  - Integrate RetainerBadge component
  - Fetch retainer data for each matter in list
  - Implement quick preview dropdown on click
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7. Dashboard integration
- [ ] 7.1 Create RetainerSummaryWidget component
  - Display summary statistics (active count, total balance, low balance count, expiring count)
  - Show recent activity list
  - "View All" link to retainers page
  - Handle loading and empty states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 7.2 Integrate widget into DashboardPage
  - Add RetainerSummaryWidget to dashboard grid
  - Position appropriately with other widgets
  - Ensure responsive layout
  - _Requirements: 5.1-5.7_

- [ ] 8. Invoice generation integration
- [ ] 8.1 Create RetainerApplicationPrompt component
  - Display during invoice creation if retainer exists
  - Show available balance and invoice amount
  - Suggest application amount (full or partial)
  - Quick action buttons (Apply Full, Apply Partial, Don't Apply)
  - Calculate and display balance due after application
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.2 Integrate prompt into invoice creation flow
  - Check for active retainer when creating invoice
  - Show RetainerApplicationPrompt if retainer available
  - Handle retainer application before invoice finalization
  - Update invoice balance due calculation
  - _Requirements: 10.1-10.5_

- [ ] 8.3 Update invoice display to show retainer application
  - Show retainer applied amount on invoice detail view
  - Display calculation: Invoice Total - Retainer Applied = Balance Due
  - Link to retainer transaction from invoice
  - _Requirements: 10.6, 3.7_

- [ ] 9. Retainers list page
- [ ] 9.1 Create RetainerListItem component
  - Display matter name, client name, balance, percentage, status
  - Progress bar with color coding
  - Warning badges for low balance and expiring
  - Click to navigate to matter detail
  - _Requirements: 5.4, 5.5, 5.6, 5.7_

- [ ] 9.2 Create RetainersListPage component
  - List of all retainers across all matters
  - Filter tabs (All, Active, Low Balance, Expiring, Cancelled)
  - Search by matter or client name
  - Sort options (balance, percentage, last activity, expiry)
  - Pagination for large lists
  - _Requirements: 5.4, 5.5, 5.6, 5.7_

- [ ] 9.3 Add route and navigation
  - Create `/retainers` route
  - Add navigation link in main menu
  - Add "View All" link from dashboard widget
  - _Requirements: 5.3, 5.7_

- [ ] 10. Mobile responsiveness
- [ ] 10.1 Optimize RetainerBalanceCard for mobile
  - Vertical stack layout
  - Full-width progress bar
  - Bottom sheet for actions on mobile
  - Touch-friendly button sizes
  - _Requirements: 9.1, 9.2_

- [ ] 10.2 Optimize transaction history for mobile
  - Compact card layout
  - Collapsible transaction details
  - Swipe gestures for actions
  - _Requirements: 9.3, 9.4_

- [ ] 10.3 Optimize modals for mobile
  - Full-screen modals on small screens
  - Numeric keyboard for amount inputs
  - Date picker optimized for touch
  - _Requirements: 9.2, 9.3_

- [ ] 10.4 Optimize dashboard widget for mobile
  - Horizontal scroll for stat cards
  - Collapsed recent activity (expandable)
  - Touch-friendly interactions
  - _Requirements: 9.1, 9.4, 9.5_

- [ ] 10.5 Test all components on mobile devices
  - Test on iOS and Android
  - Verify touch interactions
  - Check responsive layouts
  - Test form inputs and keyboards
  - _Requirements: 9.1-9.5_

- [ ] 11. Error handling and validation
- [ ] 11.1 Implement comprehensive client-side validation
  - Positive amount validation for all monetary inputs
  - Date validation (no past dates for start, no future for transactions)
  - Balance validation for drawdowns and refunds
  - Required field validation
  - _Requirements: 1.3, 2.3, 3.3, 7.3_

- [ ] 11.2 Implement error handling for all operations
  - Handle insufficient balance errors
  - Handle retainer not found errors
  - Handle cancelled retainer transaction attempts
  - Display user-friendly error messages
  - Provide recovery suggestions
  - _Requirements: All_

- [ ] 11.3 Add loading states
  - Skeleton loaders for retainer data
  - Button loading states during mutations
  - Progress indicators for long operations
  - _Requirements: All_

- [ ] 12. Accessibility improvements
- [ ] 12.1 Ensure WCAG 2.1 AA compliance
  - Verify color contrast ratios (4.5:1 minimum)
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works throughout
  - Test with screen readers
  - _Requirements: All_

- [ ] 12.2 Implement focus management
  - Trap focus in modals
  - Return focus to trigger element on modal close
  - Visible focus indicators
  - Logical tab order
  - _Requirements: All_

- [ ] 13. Performance optimization
- [ ] 13.1 Implement caching strategy
  - Cache retainer data with appropriate TTL
  - Implement optimistic updates for mutations
  - Lazy load transaction history
  - Defer dashboard widget loading
  - _Requirements: All_

- [ ] 13.2 Optimize rendering
  - Memoize expensive calculations
  - Use React.memo for pure components
  - Implement virtual scrolling for long transaction lists
  - Debounce search inputs
  - _Requirements: All_

- [ ] 14. Documentation and polish
- [ ] 14.1 Add user-facing help text
  - Tooltips for all actions and fields
  - Help text explaining retainer concepts
  - Inline guidance for first-time users
  - _Requirements: All_

- [ ] 14.2 Final polish and refinements
  - Review all UI components for consistency
  - Ensure all loading states are handled
  - Verify all error states display properly
  - Test complete user flows end-to-end
  - _Requirements: All_

- [ ]* 15. Integration and E2E testing
  - Write integration tests for complete retainer lifecycle
  - Test matter integration (create, deposit, drawdown, refund)
  - Test invoice integration (apply retainer, verify balance due)
  - Test dashboard integration (stats, recent activity)
  - Test mobile responsiveness
  - Test error scenarios and recovery
  - Test accessibility compliance
  - _Requirements: All from Requirement 1-10_

## Notes

- Tasks marked with `*` are optional unit/integration tests that can be skipped for MVP
- Backend (RetainerService, database tables) already exists - no backend work needed
- Focus is purely on UI/UX implementation
- Each task should be completed and tested before moving to the next
- All tasks reference specific requirements from the requirements document
- Estimated timeline: 3-4 weeks for complete implementation
- Core functionality (tasks 1-8) can be delivered in 2 weeks for early user feedback
