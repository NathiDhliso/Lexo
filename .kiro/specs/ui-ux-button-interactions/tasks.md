# Implementation Plan

- [x] 1. Set up core button component infrastructure



  - Create `src/components/ui/Button.tsx` with all variants (primary, secondary, ghost, danger, success)
  - Implement button size variants (sm, md, lg) with proper styling
  - Add loading state with spinner component
  - Add disabled state styling
  - Implement icon support with left/right positioning
  - Add TypeScript interfaces for ButtonProps and AsyncButtonProps
  - Apply Mpondo Gold and Judicial Blue theme colors
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ]* 1.1 Write unit tests for Button component
  - Test all variant renderings
  - Test loading and disabled states
  - Test icon positioning
  - Test click handlers

  - _Requirements: 11.1, 11.2, 11.3_

- [x] 2. Create AsyncButton component with automatic state management

  - Create `src/components/ui/AsyncButton.tsx` extending base Button
  - Implement automatic loading state on async operations
  - Add error handling with toast notifications
  - Add success feedback mechanism
  - Prevent double-submission during loading
  - _Requirements: 5.2, 5.3, 5.4, 12.2_

- [ ]* 2.1 Write unit tests for AsyncButton
  - Test async operation handling
  - Test loading state management
  - Test error scenarios



  - Test double-click prevention
  - _Requirements: 5.2, 5.3, 5.4_


- [x] 3. Implement toast notification system

  - Create `src/services/toast.service.ts` with ToastService interface
  - Create `src/components/ui/Toast.tsx` component
  - Create `src/components/ui/ToastContainer.tsx` for managing multiple toasts
  - Implement success, error, warning, and info variants
  - Add auto-dismiss with configurable duration
  - Add manual dismiss functionality
  - Implement toast positioning (top-right, bottom-right, etc.)
  - _Requirements: 6.4, 14.1, 14.2, 14.3_

- [-]* 3.1 Write unit tests for toast system

  - Test toast creation and dismissal
  - Test auto-dismiss timing
  - Test multiple toasts stacking
  - Test toast variants
  - _Requirements: 6.4_

- [x] 4. Create modal management system



  - Create `src/contexts/ModalContext.tsx` with modal state management
  - Create `src/components/ui/Modal.tsx` base component
  - Implement modal open/close animations
  - Add focus trap within modal
  - Implement body scroll lock when modal is open
  - Add Escape key handler to close modal
  - Add overlay click handler (configurable)
  - Implement modal size variants (sm, md, lg, xl, full)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.5_

- [ ]* 4.1 Write unit tests for modal system
  - Test modal open/close
  - Test focus trap
  - Test Escape key handling

  - Test overlay click handling
  - Test scroll lock



  - _Requirements: 4.1, 4.2, 4.3, 4.4_


- [ ] 5. Create confirmation dialog component
  - Create `src/components/ui/ConfirmationDialog.tsx`
  - Implement info, warning, and danger variants


  - Add customizable confirm/cancel buttons
  - Implement async confirmation handling
  - Add loading state during confirmation action
  - _Requirements: 6.1, 6.2_

- [x] 6. Implement form validation system
  - Create `src/hooks/useForm.ts` with form state management
  - Implement validation on blur and submit
  - Create validation rule types (required, email, min, max, pattern, custom)
  - Add error message display logic
  - Implement dirty state tracking
  - Add form reset functionality
  - Track touched fields
  - _Requirements: 5.1, 5.5, 14.2_




- [ ]* 6.1 Write unit tests for form validation
  - Test validation rules
  - Test error message display
  - Test dirty state tracking
  - Test form reset
  - _Requirements: 5.1_

- [x] 7. Create loading state components
  - Create `src/components/ui/Spinner.tsx` component
  - Create `src/components/ui/SkeletonLoader.tsx` for content placeholders
  - Create `src/components/ui/ProgressBar.tsx` for long operations
  - Implement loading overlay component
  - _Requirements: 12.1, 12.3, 12.4, 12.5_

- [x] 8. Enhance NavigationBar with active state management

  - Update `src/components/navigation/NavigationBar.tsx`
  - Implement active route highlighting using React Router's useLocation
  - Add smooth transitions between navigation states
  - Ensure logo click navigates to dashboard
  - Add badge support for notification counts
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 9. Implement GlobalCommandBar search functionality

  - Update `src/components/navigation/GlobalCommandBar.tsx`
  - Add keyboard shortcut (Ctrl+K / Cmd+K) to open command bar
  - Implement real-time search suggestions
  - Add navigation to search results
  - Implement recent searches tracking
  - Add keyboard navigation (arrow keys, Enter)
  - _Requirements: 8.1, 8.2, 8.3, 7.6_


- [x] 10. Enhance MobileMegaMenu with touch gestures

  - Update `src/components/navigation/MobileMegaMenu.tsx`
  - Implement swipe-to-close gesture
  - Add smooth open/close animations
  - Ensure minimum touch target size (44x44px)
  - Implement body scroll lock when menu is open
  - Auto-close menu on navigation

  - _Requirements: 13.1, 13.4, 13.5, 3.5_

- [x] 11. Create ReportCard component
  - Create `src/components/reports/ReportCard.tsx`
  - Implement card layout with icon, title, and description
  - Add hover effects with theme colors
  - Add click handler to open report modal
  - Implement tier-based access (show upgrade prompt for locked reports)

  - Add loading state for report cards
  - _Requirements: 2.1, 7.5_

- [x] 12. Implement ReportModal with filters
  - Create `src/components/reports/ReportModal.tsx`
  - Implement filter UI (date range, select, multi-select)
  - Add "Generate Report" button with validation

  - Display report data in table format
  - Add loading state during report generation
  - Implement error handling with retry option
  - _Requirements: 2.1, 2.2, 2.5, 2.6_


- [x] 13. Create report generation service
  - Create `src/services/api/reports.service.ts`
  - Implement API calls for each report type (WIP, Revenue, Pipeline, etc.)

  - Add request/response TypeScript interfaces
  - Implement error handling and retry logic
  - Add response data transformation
  - _Requirements: 2.2, 2.6_

- [x] 14. Implement CSV export functionality
  - Create `src/utils/export.utils.ts`
  - Implement `exportToCSV` function
  - Format report data as CSV
  - Trigger browser download
  - Handle special characters and escaping
  - Add filename with timestamp
  - _Requirements: 2.3_

- [x] 15. Implement PDF export functionality

  - Install and configure PDF generation library (jsPDF or similar)

  - Implement `exportToPDF` function in `src/utils/export.utils.ts`
  - Format report data with proper styling
  - Include charts/visualizations in PDF
  - Add LexoHub branding (logo, colors)

  - Trigger browser download
  - _Requirements: 2.4_

- [x] 16. Create ReportsPage with all report cards
  - Update `src/pages/ReportsPage.tsx`
  - Add all report cards (WIP, Revenue, Pipeline, Client Revenue, Time Entry, Outstanding Invoices, Aging, Matter Profitability, Custom)
  - Implement grid layout responsive to screen size
  - Add page header with description
  - Integrate report modal opening on card click

  - _Requirements: 2.1_

- [x] 17. Implement matter creation modal
  - Create `src/components/matters/MatterCreationModal.tsx`
  - Implement multi-step form (Client Info → Matter Details → Billing Setup)
  - Add form validation for each step
  - Implement step navigation (Next, Back, Submit)
  - Add loading state during matter creation
  - Show success message and navigate to new matter on completion
  - _Requirements: 7.2, 7.4, 5.1, 5.3_


- [ ] 18. Implement pro forma creation modal
  - Create `src/components/invoices/ProFormaCreationModal.tsx`
  - Add form fields (matter selection, line items, amounts)
  - Implement line item addition/removal
  - Add amount calculations
  - Implement form validation
  - Add loading state during creation
  - Show success message on completion
  - _Requirements: 7.3, 7.4, 5.1, 5.3_

- [x] 19. Enhance InvoiceDetailsModal with action buttons

  - Update `src/components/invoices/InvoiceDetailsModal.tsx`
  - Add "Record Payment" button with payment form

  - Add "Send Invoice" button with email functionality
  - Add "Download PDF" button
  - Add "Mark as Paid" button with confirmation
  - Implement loading states for all actions
  - Add success/error feedback
  - _Requirements: 6.1, 6.2, 6.3, 6.4_



- [ ] 20. Implement quick action dropdown in navigation
  - Update `src/components/navigation/NavigationBar.tsx`

  - Add "Create" button with dropdown menu
  - Implement dropdown options (Create Matter, Create Pro Forma, Create Invoice)
  - Add keyboard navigation in dropdown
  - Close dropdown on selection or outside click
  - Trigger corresponding modals on selection
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 21. Implement search and filter functionality
  - Create `src/hooks/useSearch.ts` for search state management
  - Create `src/hooks/useFilter.ts` for filter state management
  - Add search input with real-time filtering
  - Implement filter dropdowns (status, date range, client)
  - Add "Clear Filters" button
  - Update URL params with filter state
  - Display empty state when no results
  - _Requirements: 8.4, 8.5, 8.6_

- [x] 22. Implement pagination components
  - Create `src/components/ui/Pagination.tsx`
  - Add page number buttons with current page highlighting
  - Add Previous/Next buttons
  - Implement "Load More" button variant
  - Add loading state during page changes
  - Update URL with page number
  - Disable navigation at boundaries
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_





- [ ] 23. Add accessibility features to all buttons
  - Add aria-label to icon-only buttons
  - Implement aria-expanded for dropdown buttons
  - Add aria-haspopup for menu buttons
  - Ensure visible focus indicators on all buttons
  - Implement keyboard navigation (Tab, Enter, Space)
  - Add aria-describedby for disabled buttons with tooltips
  - Test with screen readers

  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.6_


- [x] 24. Implement responsive button behavior for mobile

  - Ensure all buttons meet 44x44px minimum touch target
  - Add touch feedback (active state styling)
  - Optimize button layouts for mobile screens
  - Implement horizontal scroll for button groups if needed
  - Test on various mobile devices
  - _Requirements: 13.1, 13.2, 13.3, 13.6_

- [x] 25. Create error handling service
  - Create `src/services/error-handler.service.ts`
  - Implement error classification (network, validation, permission, server)
  - Add error recovery strategies
  - Implement retry logic for network errors
  - Add error logging
  - Create user-friendly error messages
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 26. Implement analytics tracking service


  - Create `src/services/analytics.service.ts`
  - Implement button click tracking
  - Add navigation event tracking
  - Track form submission events
  - Track error events
  - Add user flow tracking
  - Ensure privacy compliance (respect user preferences)
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [x] 27. Create comprehensive button documentation


  - Create `src/components/ui/Button.stories.tsx` (Storybook)
  - Document all button variants with examples
  - Add usage guidelines
  - Include accessibility notes
  - Document common patterns
  - Add code examples
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 28. Implement bulk action functionality


  - Create `src/hooks/useSelection.ts` for multi-select state
  - Add checkbox selection to list items
  - Create bulk action toolbar
  - Implement "Select All" functionality
  - Add bulk action buttons (Delete, Archive, Export)
  - Show confirmation dialog for bulk actions
  - Display count of selected items
  - _Requirements: 6.6_

- [x] 29. Add unsaved changes warning


  - Create `src/hooks/useUnsavedChanges.ts`
  - Detect form dirty state
  - Show confirmation dialog on navigation attempt
  - Show confirmation on modal close attempt
  - Implement browser beforeunload warning
  - _Requirements: 5.5_

- [x] 30. Integrate all components and test complete user flows



  - Wire up all modals to their trigger buttons
  - Ensure navigation flows work end-to-end
  - Test report generation and export flows
  - Test matter and invoice creation flows
  - Verify all error handling paths
  - Test accessibility with keyboard navigation
  - Test responsive behavior on mobile devices
  - Verify analytics tracking is working
  - _Requirements: All requirements_
