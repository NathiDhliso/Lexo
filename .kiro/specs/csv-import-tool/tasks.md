# Implementation Plan: CSV Import Tool

## Overview
This implementation plan breaks down the CSV Import Tool into discrete, actionable coding tasks. The tool provides a 7-step wizard for importing clients and attorneys from CSV files, with validation, duplicate detection, and rollback capabilities.

## Task List

- [ ] 1. Database schema and migrations
  - Create migration file for `import_history` table with all fields and indexes
  - Add RLS policies for import_history table
  - Test migration locally to ensure schema is correct
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 2. TypeScript types and interfaces
  - Create `src/types/import.types.ts` with all interfaces (ParsedCSV, ColumnMapping, ValidationResult, etc.)
  - Define field definitions for clients and attorneys
  - Export types from main types index file
  - _Requirements: 2.1-2.7, 3.1-3.7_

- [ ] 3. CSV parsing and utilities
- [ ] 3.1 Install and configure Papa Parse library
  - Add Papa Parse dependency (`npm install papaparse @types/papaparse`)
  - Create wrapper service for CSV operations
  - _Requirements: 1.1-1.7_

- [ ] 3.2 Create CSVParserService
  - Implement `parseFile()` method for CSV parsing
  - Implement `generateTemplate()` for client and attorney templates
  - Implement `exportToCSV()` for exporting data
  - Add file validation (type, size checks)
  - _Requirements: 1.1-1.7, 10.1-10.7_

- [ ] 3.3 Create ColumnMappingService
  - Implement `autoMapColumns()` for intelligent column detection
  - Implement `validateMapping()` to check required fields
  - Add common column name patterns for auto-detection
  - _Requirements: 2.1-2.7, 3.1-3.7_

- [ ] 3.4 Create DataValidationService
  - Implement `validateData()` for batch validation
  - Implement `validateRow()` for single row validation
  - Add email format validation
  - Add phone format validation
  - Add required field validation
  - _Requirements: 4.1-4.7_

- [ ] 3.5 Create DuplicateDetectionService
  - Implement `detectDuplicates()` for finding potential duplicates
  - Implement `calculateMatch()` for similarity scoring
  - Add matching logic for clients (email, name+phone)
  - Add matching logic for attorneys (email, name+firm)
  - _Requirements: 5.1-5.7_

- [ ]* 3.6 Write unit tests for services
  - Test CSV parsing with various formats
  - Test column auto-mapping
  - Test data validation rules
  - Test duplicate detection algorithms
  - _Requirements: 1.1-5.7_

- [ ] 4. Import API service
- [ ] 4.1 Create ImportService class
  - Extend BaseApiService for import_history table
  - Implement CRUD operations for import history
  - Implement `createImportHistory()` method
  - Implement `updateImportHistory()` method
  - _Requirements: 8.1-8.7_

- [ ] 4.2 Implement batch import execution
  - Implement `executeImport()` method with batch processing
  - Implement `processBatch()` for inserting records
  - Add progress tracking and callbacks
  - Handle errors gracefully during batch processing
  - _Requirements: 7.1-7.7_

- [ ] 4.3 Implement rollback functionality
  - Implement `rollbackImport()` method
  - Add time-based rollback restrictions (24 hours)
  - Handle record deletion and state restoration
  - _Requirements: 9.1-9.7_

- [ ] 4.4 Add import history queries
  - Implement `getImportHistory()` with filtering
  - Implement `getImportDetails()` for single import
  - Add pagination support
  - _Requirements: 8.1-8.7_

- [ ]* 4.5 Write unit tests for ImportService
  - Test batch processing logic
  - Test rollback functionality
  - Test import history queries
  - Test error handling
  - _Requirements: 7.1-9.7_

- [ ] 5. Custom React hooks
- [ ] 5.1 Create useImportWizard hook
  - Manage wizard state (current step, data, progress)
  - Implement step navigation (next, back, jump to step)
  - Handle file upload and parsing
  - Handle column mapping
  - Handle validation
  - Handle duplicate resolution
  - _Requirements: 1.1-6.7_

- [ ] 5.2 Create useImportExecution hook
  - Manage import execution state
  - Implement progress tracking
  - Handle batch processing callbacks
  - Handle errors during import
  - _Requirements: 7.1-7.7_

- [ ] 5.3 Create useImportHistory hook
  - Fetch import history with React Query
  - Implement filtering and pagination
  - Handle rollback mutations
  - _Requirements: 8.1-8.7, 9.1-9.7_

- [ ]* 5.4 Write hook tests
  - Test useImportWizard state management
  - Test useImportExecution progress tracking
  - Test useImportHistory data fetching
  - _Requirements: 1.1-9.7_

- [ ] 6. Import wizard steps - File upload
- [ ] 6.1 Create FileUploadStep component
  - Drag-and-drop file upload area
  - File input with validation (type, size)
  - CSV parsing on file selection
  - Preview of first 5 rows
  - Template download button
  - Error handling for invalid files
  - _Requirements: 1.1-1.7, 10.1-10.7_

- [ ] 6.2 Create TemplateDownloadButton component
  - Generate CSV template on click
  - Trigger browser download
  - Show tooltip with tips
  - _Requirements: 10.1-10.7_

- [ ]* 6.3 Write component tests
  - Test file upload and validation
  - Test CSV parsing
  - Test template download
  - Test error states
  - _Requirements: 1.1-1.7, 10.1-10.7_

- [ ] 7. Import wizard steps - Column mapping
- [ ] 7.1 Create ColumnMappingStep component
  - Display CSV columns and system fields side-by-side
  - Implement auto-mapping on mount
  - Dropdowns for manual column mapping
  - Required field indicators
  - Validation of required field mapping
  - Save mapping for future use
  - _Requirements: 2.1-2.7, 3.1-3.7_

- [ ] 7.2 Create ColumnMappingRow component
  - Individual mapping row with CSV column and field dropdown
  - Visual indicator for mapped/unmapped
  - Clear/reset mapping option
  - _Requirements: 2.1-2.7, 3.1-3.7_

- [ ]* 7.3 Write component tests
  - Test auto-mapping logic
  - Test manual mapping
  - Test required field validation
  - Test mapping persistence
  - _Requirements: 2.1-3.7_

- [ ] 8. Import wizard steps - Validation
- [ ] 8.1 Create ValidationReviewStep component
  - Display validation summary (valid/invalid counts)
  - List all validation errors with row numbers
  - Resolution options (skip invalid, download errors, cancel)
  - Error report download button
  - _Requirements: 4.1-4.7, 11.1-11.7_

- [ ] 8.2 Create ValidationErrorList component
  - Scrollable list of validation errors
  - Group errors by type
  - Show row number, field, error message
  - _Requirements: 4.4, 4.6_

- [ ] 8.3 Create ErrorReportGenerator utility
  - Generate CSV with error details
  - Include original row data and error messages
  - Trigger download
  - _Requirements: 11.1-11.7_

- [ ]* 8.4 Write component tests
  - Test error display
  - Test resolution options
  - Test error report generation
  - _Requirements: 4.1-4.7, 11.1-11.7_

- [ ] 9. Import wizard steps - Duplicate resolution
- [ ] 9.1 Create DuplicateResolutionStep component
  - Display duplicate count and current duplicate index
  - Show existing record vs new record comparison
  - Resolution options (skip, update, create anyway)
  - "Apply to all similar" option
  - Navigation between duplicates
  - _Requirements: 5.1-5.7_

- [ ] 9.2 Create DuplicateComparisonCard component
  - Side-by-side comparison of records
  - Highlight matching fields
  - Show similarity score
  - _Requirements: 5.3, 5.4_

- [ ] 9.3 Implement duplicate resolution logic
  - Track resolution decisions
  - Apply bulk resolutions
  - Handle "update" merge logic
  - _Requirements: 5.5, 5.6, 5.7_

- [ ]* 9.4 Write component tests
  - Test duplicate display
  - Test resolution options
  - Test bulk resolution
  - Test merge logic
  - _Requirements: 5.1-5.7_

- [ ] 10. Import wizard steps - Preview and execution
- [ ] 10.1 Create ImportPreviewStep component
  - Display import summary with all counts
  - Preview table of first 10 records
  - Warning message about irreversibility
  - Confirm button to start import
  - _Requirements: 6.1-6.7_

- [ ] 10.2 Create ImportProgressStep component
  - Progress bar with percentage
  - Records processed count
  - Current operation display
  - Estimated time remaining
  - Prevent window close during import
  - _Requirements: 7.1-7.7_

- [ ] 10.3 Create ImportCompleteStep component
  - Success message with counts
  - Import results summary
  - Links to view imported records
  - Download report button
  - Next steps suggestions
  - _Requirements: 7.5, 7.6, 7.7_

- [ ]* 10.4 Write component tests
  - Test preview display
  - Test progress tracking
  - Test completion display
  - Test navigation to imported records
  - _Requirements: 6.1-7.7_

- [ ] 11. Import wizard container
- [ ] 11.1 Create ImportWizard component
  - Manage wizard state with useImportWizard hook
  - Render current step component
  - Handle step navigation
  - Progress indicator showing current step
  - Handle wizard completion and cancellation
  - _Requirements: All from 1.1-7.7_

- [ ] 11.2 Create WizardProgressIndicator component
  - Visual step indicator (1/7, 2/7, etc.)
  - Highlight current step
  - Show completed steps
  - _Requirements: All_

- [ ]* 11.3 Write wizard integration tests
  - Test complete wizard flow
  - Test step navigation
  - Test data persistence between steps
  - Test cancellation
  - _Requirements: All from 1.1-7.7_

- [ ] 12. Import page and navigation
- [ ] 12.1 Create ImportPage component
  - Import type selector (clients vs attorneys)
  - Launch wizard for selected type
  - Display import history section
  - Template download buttons
  - _Requirements: 1.1, 8.1-8.7, 10.1-10.7_

- [ ] 12.2 Create ImportTypeCard component
  - Card for each import type
  - Icon and description
  - "Start Import" button
  - "Download Template" button
  - _Requirements: 1.1, 10.1-10.7_

- [ ] 12.3 Add route and navigation
  - Create `/import` route
  - Add navigation link in main menu or settings
  - Add breadcrumbs
  - _Requirements: All_

- [ ] 13. Import history components
- [ ] 13.1 Create ImportHistoryList component
  - List of past imports with key details
  - Filter by type, status, date range
  - Pagination (20 per page)
  - Click to view details
  - _Requirements: 8.1-8.7_

- [ ] 13.2 Create ImportHistoryItem component
  - Display import summary in list
  - Status indicator (success/partial/failed)
  - Rollback button (if eligible)
  - View details button
  - _Requirements: 8.1-8.7, 9.1-9.7_

- [ ] 13.3 Create ImportDetailModal component
  - Full import details
  - List of imported records with links
  - List of skipped records with reasons
  - Error log (if any)
  - Export report button
  - Rollback button (if eligible)
  - _Requirements: 8.3, 8.4, 8.5, 9.1-9.7_

- [ ] 13.4 Implement rollback confirmation
  - Confirmation dialog with warnings
  - Show records to be deleted/restored
  - Progress indicator during rollback
  - Success/error messaging
  - _Requirements: 9.1-9.7_

- [ ]* 13.5 Write history component tests
  - Test history list display
  - Test filtering and pagination
  - Test detail modal
  - Test rollback flow
  - _Requirements: 8.1-9.7_

- [ ] 14. Mobile responsiveness
- [ ] 14.1 Optimize wizard for mobile
  - Responsive layouts for all steps
  - Touch-friendly file upload
  - Vertical layout for column mapping
  - Simplified duplicate resolution
  - Bottom sheets for actions
  - _Requirements: 12.1-12.7_

- [ ] 14.2 Optimize tables for mobile
  - Horizontal scroll for wide tables
  - Collapsible details
  - Touch-friendly interactions
  - _Requirements: 12.3, 12.4_

- [ ] 14.3 Test on mobile devices
  - Test file upload on iOS and Android
  - Test wizard navigation
  - Test form inputs
  - Verify responsive layouts
  - _Requirements: 12.1-12.7_

- [ ] 15. Error handling and edge cases
- [ ] 15.1 Implement comprehensive error handling
  - File upload errors (invalid format, too large)
  - CSV parsing errors
  - Validation errors
  - Import execution errors
  - Network errors
  - Display user-friendly error messages
  - _Requirements: 4.1-4.7, 11.1-11.7_

- [ ] 15.2 Add loading states
  - File parsing loader
  - Validation in progress
  - Duplicate detection loader
  - Import progress indicator
  - Rollback progress
  - _Requirements: All_

- [ ] 15.3 Handle edge cases
  - Empty CSV files
  - CSV with only headers
  - Very large files (near limit)
  - All rows invalid
  - All rows duplicates
  - Import timeout scenarios
  - _Requirements: All_

- [ ] 16. Accessibility
- [ ] 16.1 Ensure WCAG 2.1 AA compliance
  - Keyboard navigation through wizard
  - Screen reader announcements for steps
  - ARIA labels on all interactive elements
  - Focus management in modals
  - Color contrast verification
  - _Requirements: 12.6, 12.7_

- [ ] 16.2 Add helpful hints and guidance
  - Tooltips for all actions
  - Inline help text
  - Example data in templates
  - Error recovery suggestions
  - _Requirements: 10.6, 10.7, 11.6_

- [ ] 17. Performance optimization
- [ ] 17.1 Optimize CSV parsing
  - Stream large files if possible
  - Show parsing progress for large files
  - Debounce validation during mapping
  - _Requirements: 1.1-1.7_

- [ ] 17.2 Optimize duplicate detection
  - Limit comparison to relevant fields
  - Cache existing records
  - Use efficient matching algorithms
  - _Requirements: 5.1-5.7_

- [ ] 17.3 Optimize batch processing
  - Tune batch size for performance
  - Implement retry logic for failed batches
  - Prevent UI blocking during import
  - _Requirements: 7.1-7.7_

- [ ] 18. Documentation and polish
- [ ] 18.1 Add user-facing documentation
  - Help text for each wizard step
  - CSV formatting guidelines
  - Troubleshooting common issues
  - Video tutorial or walkthrough
  - _Requirements: All_

- [ ] 18.2 Final polish and refinements
  - Review all UI components for consistency
  - Ensure all loading states are handled
  - Verify all error states display properly
  - Test complete user flows end-to-end
  - _Requirements: All_

- [ ]* 19. Integration and E2E testing
  - Write integration tests for complete import flow
  - Test client import end-to-end
  - Test attorney import end-to-end
  - Test error recovery flows
  - Test rollback functionality
  - Test import history
  - Test mobile responsiveness
  - Test accessibility compliance
  - _Requirements: All from Requirement 1-12_

## Notes

- Tasks marked with `*` are optional unit/integration tests that can be skipped for MVP
- Each task should be completed and tested before moving to the next
- All tasks reference specific requirements from the requirements document
- Papa Parse library is recommended for CSV parsing (battle-tested, handles edge cases)
- Estimated timeline: 4-5 weeks for complete implementation
- Core functionality (tasks 1-11) can be delivered in 3 weeks for early user feedback
- Consider implementing client import first, then attorney import (similar patterns)
