# Implementation Plan: Smart Document Linking

## Overview
This implementation plan breaks down the Smart Document Linking feature into discrete, actionable coding tasks. Each task builds incrementally on previous work, with early validation of core functionality.

## Task List

- [ ] 1. Database schema and migrations
  - Create migration file for `matter_document_links` table with all fields, indexes, and RLS policies
  - Add function `get_matter_document_count()` for computed document counts
  - Test migration locally to ensure schema is correct
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.1, 7.2, 7.3_

- [ ] 2. TypeScript types and interfaces
  - Create `src/types/document-link.types.ts` with all interfaces (DocumentLink, CreateDocumentLinkRequest, etc.)
  - Define enums for DocumentCategory, StorageProvider, DocumentType
  - Export types from main types index file
  - _Requirements: 1.1, 1.2, 2.1, 2.2_

- [ ] 3. API service layer
- [ ] 3.1 Create DocumentLinksService class
  - Implement `DocumentLinksService` extending `BaseApiService`
  - Implement core CRUD methods: `createDocumentLink`, `updateDocumentLink`, `deleteDocumentLink`
  - Implement `getByMatter` with filtering, sorting, and pagination support
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.1, 5.2, 5.3_

- [ ] 3.2 Implement query and utility methods
  - Implement `getDocumentCount`, `getRecentDocuments` methods
  - Implement `trackAccess` method to update access count and timestamp
  - Implement `getByCategory` and `getByTags` filtering methods
  - Implement `searchDocuments` for cross-matter search
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 6.5_

- [ ] 3.3 Implement bulk operations
  - Implement `createBulk` method for adding multiple document links
  - Add validation and error handling for bulk operations
  - Return detailed success/failure report for each URL
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 3.4 Write unit tests for DocumentLinksService
  - Test all CRUD operations with mock data
  - Test filtering, sorting, and pagination logic
  - Test bulk operations and error scenarios
  - Test access tracking functionality
  - _Requirements: All from Requirement 1-7_

- [ ] 4. Custom React hooks
- [ ] 4.1 Create useDocumentLinks hook
  - Implement data fetching with React Query or SWR
  - Implement mutations for create, update, delete operations
  - Add optimistic updates for better UX
  - Handle loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3_

- [ ] 4.2 Create useDocumentSearch hook
  - Implement debounced search functionality (300ms delay)
  - Combine search with category and tag filters
  - Handle pagination state
  - _Requirements: 2.3, 2.4, 2.5_


- [ ] 5. Core UI components
- [ ] 5.1 Create DocumentLinkCard component
  - Display document name, category, date, and description
  - Show storage provider icon
  - Implement click handler to open document in new tab
  - Add action menu (edit, delete, copy link)
  - Track access when document is opened
  - _Requirements: 1.5, 1.6, 5.1, 5.5, 6.5_

- [ ] 5.2 Create DocumentLinkList component
  - Display list/grid of DocumentLinkCard components
  - Implement empty state with call-to-action
  - Add loading skeleton for better perceived performance
  - Support compact mode for embedded views
  - _Requirements: 1.5, 2.5, 2.6, 3.1_

- [ ] 5.3 Create DocumentCategoryFilter component
  - Dropdown or button group for category selection
  - Show document count per category
  - Support "All Categories" option
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5.4 Create DocumentSearchBar component
  - Search input with debouncing
  - Clear button when search is active
  - Show search result count
  - Integrate with useDocumentSearch hook
  - _Requirements: 2.5, 2.6_

- [ ]* 5.5 Write component tests
  - Test DocumentLinkCard rendering and interactions
  - Test DocumentLinkList with various data states
  - Test filter and search components
  - Test accessibility compliance
  - _Requirements: 1.1-8.5_

- [ ] 6. Document management modals
- [ ] 6.1 Create AddDocumentLinkModal component
  - Form with fields: name, URL, provider, category, description, tags
  - Client-side URL validation
  - Duplicate URL detection with warning
  - Success/error toast notifications
  - Support both create and edit modes
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [ ] 6.2 Create BulkAddDocumentModal component
  - Textarea for pasting multiple URLs (one per line)
  - Common category and tags fields
  - URL parsing and validation logic
  - Progress indicator during bulk save
  - Success summary with failure details
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6.3 Create DocumentQuickPreview component
  - Dropdown/popover showing recent documents
  - Display most recent 5 documents
  - Click to open document directly
  - "View all" link to full document list
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 6.4 Write modal component tests
  - Test form validation in AddDocumentLinkModal
  - Test bulk URL parsing and validation
  - Test quick preview dropdown behavior
  - Test modal open/close states
  - _Requirements: 1.1-6.5_

- [ ] 7. Matter detail page integration
- [ ] 7.1 Add Documents section to matter detail page
  - Create new "Documents" tab or section
  - Display DocumentLinkList component
  - Add "Add Document" and "Bulk Add" buttons
  - Show document count in section header
  - _Requirements: 1.1, 1.2, 3.1, 6.1_

- [ ] 7.2 Integrate document search and filters
  - Add DocumentSearchBar to documents section
  - Add DocumentCategoryFilter component
  - Add tag filter dropdown
  - Add sort options (date, name, type)
  - Wire up all filters to useDocumentSearch hook
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7.3 Implement document actions
  - Wire up edit action to open AddDocumentLinkModal
  - Wire up delete action with confirmation dialog
  - Implement copy link to clipboard functionality
  - Show success/error toasts for all actions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8. Matter list page integration
- [ ] 8.1 Add document indicator to MatterCard
  - Display document icon/badge when matter has documents
  - Show document count on hover tooltip
  - Add click handler to show DocumentQuickPreview
  - _Requirements: 3.1, 3.2, 3.5_

- [ ] 8.2 Implement quick preview functionality
  - Integrate DocumentQuickPreview component
  - Load recent documents on indicator click
  - Handle loading and error states
  - Allow opening documents without navigating to matter detail
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 9. Time entry integration
- [ ] 9.1 Add document linking to time entry form
  - Add optional "Related Document" field to time entry form
  - Dropdown showing documents for the current matter
  - Option to quick-add new document from time entry form
  - _Requirements: 6.1, 6.2_

- [ ] 9.2 Display linked documents in time entry views
  - Show linked document in time entry list/detail views
  - Make document name clickable to open document
  - Display document icon next to time entries with linked documents
  - _Requirements: 6.2, 6.5_

- [ ] 10. Invoice integration
- [ ] 10.1 Add document attachment to invoice generation
  - Allow selecting documents to reference in invoice
  - Display selected documents in invoice preview
  - Store document references in invoice metadata
  - _Requirements: 6.3, 6.5_

- [ ] 10.2 Display attached documents in invoice views
  - Show attached documents in invoice detail view
  - Allow opening documents from invoice view
  - Include document references in PDF generation (future)
  - _Requirements: 6.3, 6.5_

- [ ] 11. Audit trail integration
- [ ] 11.1 Log document operations to audit trail
  - Log create, update, delete operations
  - Log document access events
  - Include relevant metadata (matter_id, document_name, category)
  - _Requirements: 5.6, 6.6, 7.6_

- [ ] 11.2 Display document events in matter timeline
  - Add document events to matter activity timeline
  - Show "Document added", "Document updated", "Document deleted" events
  - Make event entries clickable to view document (if not deleted)
  - _Requirements: 6.4, 6.5_

- [ ] 12. Mobile responsiveness
- [ ] 12.1 Optimize document list for mobile
  - Implement responsive grid/list layout
  - Use bottom sheet for modals on mobile
  - Larger tap targets for touch interaction
  - Collapsible filters for small screens
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 12.2 Implement touch gestures
  - Swipe actions for edit/delete on mobile
  - Pull-to-refresh for document list
  - Touch-friendly dropdown menus
  - _Requirements: 8.3, 8.5_

- [ ] 13. Error handling and validation
- [ ] 13.1 Implement comprehensive error handling
  - Handle invalid URL format with clear error messages
  - Detect and warn about duplicate URLs
  - Handle inaccessible documents gracefully
  - Display user-friendly error messages for all error types
  - _Requirements: 1.7, 5.3, 5.4, 7.1-7.5_

- [ ] 13.2 Add validation and user feedback
  - Client-side form validation for all inputs
  - Real-time validation feedback
  - Success toasts for all operations
  - Error recovery suggestions
  - _Requirements: 1.1-1.7, 4.1-4.4, 5.1-5.6_

- [ ] 14. Performance optimization
- [ ] 14.1 Implement pagination and lazy loading
  - Add pagination to document list (20 items per page)
  - Implement virtual scrolling for large lists (100+ items)
  - Lazy load document metadata on scroll
  - _Requirements: 2.6, 8.1_

- [ ] 14.2 Add caching and optimistic updates
  - Cache document counts per matter
  - Cache recent documents list
  - Implement optimistic UI updates for create/update/delete
  - Invalidate cache appropriately on mutations
  - _Requirements: 1.1-1.7, 5.1-5.6_

- [ ] 15. Documentation and polish
- [ ] 15.1 Add user-facing documentation
  - Create help text for document linking feature
  - Add tooltips for all actions and fields
  - Create onboarding tour for first-time users
  - _Requirements: All_

- [ ] 15.2 Final polish and refinements
  - Review all UI components for consistency
  - Ensure all loading states are handled
  - Verify all error states display properly
  - Test complete user flows end-to-end
  - _Requirements: All_

- [ ]* 16. Integration and E2E testing
  - Write integration tests for complete document lifecycle
  - Test matter integration (create, view, delete)
  - Test search and filter combinations
  - Test bulk operations with various scenarios
  - Test mobile responsiveness
  - Test error scenarios and recovery
  - _Requirements: All from Requirement 1-8_

## Notes

- Tasks marked with `*` are optional unit/integration tests that can be skipped for MVP
- Each task should be completed and tested before moving to the next
- All tasks reference specific requirements from the requirements document
- Focus on core functionality first (tasks 1-8), then enhance with integrations (tasks 9-12)
- Performance optimization (task 14) can be done incrementally as needed
