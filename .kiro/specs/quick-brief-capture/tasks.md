# Implementation Plan

- [x] 1. Set up database schema and seed data



  - Create `advocate_quick_templates` table with proper indexes
  - Seed system default templates for work types, practice areas, and issue templates
  - Create RLS policies for template access control


  - _Requirements: 10, 15_

- [x] 2. Implement QuickBriefTemplateService




- [x] 2.1 Create base service class extending BaseApiService

  - Implement `getTemplatesByCategory()` method to fetch and merge system/custom templates
  - Implement `upsertTemplate()` method to add or increment usage count
  - Implement `deleteTemplate()` method for custom template removal
  - _Requirements: 10_


- [ ] 2.2 Add import/export functionality
  - Implement `exportTemplates()` method to generate JSON export
  - Implement `importTemplates()` method to parse and merge imported templates
  - Add validation for imported template data
  - _Requirements: 10_

- [-] 3. Build core UI components




- [x] 3.1 Create ProgressIndicator component


  - Display current step number and total steps
  - Show visual progress bar with completed/active/pending states
  - Use theme colors (judicial-blue for active, mpondo-gold for completed)
  - _Requirements: 1_


- [ ] 3.2 Create AnswerButtonGrid component

  - Render template items as clickable buttons in grid layout
  - Implement selection state with checkmark indicator
  - Add "[+ Add Custom]" button that shows input field
  - Display usage indicators (⭐) for top 3 most used templates
  - Ensure minimum 44x44px touch targets for mobile
  - _Requirements: 2, 12_

- [ ] 3.3 Create CustomAnswerInput component
  - Show text input field when custom answer is needed
  - Implement validation based on field type
  - Auto-save custom answer to templates on blur
  - Show success feedback when template is saved
  - _Requirements: 2_

- [ ] 4. Implement questionnaire step components
- [ ] 4.1 Create FirmAttorneySelector component (Step 1)
  - Implement firm dropdown populated from firms table
  - Implement filtered attorney dropdown based on selected firm
  - Add "Quick Add Firm/Attorney" inline form
  - Auto-populate attorney details when firm is selected
  - Validate email format before proceeding
  - _Requirements: 3_

- [ ] 4.2 Create MatterTitleInput component (Step 2)
  - Display title template buttons from advocate's saved templates
  - Show text input for custom title or editing template
  - Implement placeholder replacement (e.g., [Client Name])
  - Save custom titles as new templates
  - Show 5 most recently used templates first
  - _Requirements: 4_

- [ ] 4.3 Create WorkTypeSelector component (Step 3)
  - Display work type buttons (Opinion, Court Appearance, Drafting, etc.)
  - Implement single selection with checkmark indicator
  - Add custom work type input
  - Sort by usage frequency (most used first)
  - _Requirements: 5_

- [ ] 4.4 Create PracticeAreaSelector component (Step 4)
  - Display practice area buttons (Labour Law, Commercial, Tax, etc.)
  - Implement single selection with checkmark indicator
  - Add custom practice area input
  - Sort by usage frequency (most used first)
  - _Requirements: 6_

- [ ] 4.5 Create UrgencyDeadlineSelector component (Step 5)
  - Display urgency level buttons (Same Day, 1-2 Days, Within a Week, etc.)
  - Auto-calculate deadline date based on selected urgency
  - Show date picker for "Custom Date" option
  - Display calculated deadline date prominently
  - Validate that deadline is in the future
  - _Requirements: 7_

- [ ] 4.6 Create BriefSummaryEditor component (Step 6)
  - Display issue template buttons (Breach of Contract, Employment Dispute, etc.)
  - Populate textarea with template text when button clicked
  - Allow editing of populated template text
  - Position cursor at placeholder text (e.g., [edit: specify details])
  - Add reference links section with URL input and validation
  - Support multiple reference links
  - Show character count indicator
  - Mark as optional but show warning if empty
  - _Requirements: 8, 9_

- [ ] 5. Enhance QuickBriefCaptureModal
- [ ] 5.1 Implement multi-step navigation
  - Add state management for current step (1-6)
  - Implement "Next" button that advances to next step
  - Implement "Previous" button that goes back without losing data
  - Show "Save & Accept Brief" button on final step
  - Disable "Next" if current step validation fails
  - _Requirements: 1_

- [ ] 5.2 Integrate step components
  - Render appropriate step component based on currentStep
  - Pass form data and onChange handlers to each step
  - Collect data from all steps into unified form state
  - Implement step-specific validation
  - _Requirements: 1, 2, 3, 4, 5, 6, 7, 8_

- [ ] 5.3 Add data persistence with localStorage
  - Auto-save form data to localStorage on every change (debounced 500ms)
  - Restore form data from localStorage when modal reopens
  - Clear localStorage on successful submission
  - Show confirmation dialog if user tries to close with unsaved changes
  - Implement 24-hour expiration for stale localStorage data
  - _Requirements: 14_

- [ ] 5.4 Implement form submission
  - Validate all required fields before submission
  - Call `matterApiService.createFromQuickBrief()` with form data
  - Show loading state during submission
  - Display success message on completion
  - Navigate to Matter Workbench for newly created matter
  - Clear form and localStorage after successful submission
  - _Requirements: 11_

- [ ] 6. Enhance MatterApiService
- [ ] 6.1 Implement createFromQuickBrief method
  - Map QuickBriefMatterData to Matter schema
  - Set status to 'active' immediately
  - Set creation_source to 'quick_brief_capture'
  - Set date_instructed, date_accepted, and date_commenced to current date
  - Map urgency level to database enum
  - _Requirements: 11_

- [ ] 6.2 Add document reference creation
  - Create document_references entries for each reference link
  - Handle errors gracefully if reference creation fails
  - _Requirements: 9_

- [ ] 6.3 Implement template usage tracking
  - Call `quickBriefTemplateService.upsertTemplate()` for each selected option
  - Increment usage_count for existing templates
  - Create new templates for custom answers
  - Update last_used_at timestamp
  - _Requirements: 10, 15_

- [ ] 7. Build QuickBriefTemplatesSettings page
- [ ] 7.1 Create settings page layout
  - Add "My Quick Brief Templates" section to Settings page
  - Display templates grouped by category (Matter Types, Practice Areas, etc.)
  - Show template value, usage count, and last used date
  - _Requirements: 10_

- [ ] 7.2 Implement template CRUD operations
  - Add "Edit" button that enables inline editing
  - Add "Delete" button with confirmation dialog
  - Add "Add Template" button for each category
  - Implement reorder functionality (up/down arrows or drag-and-drop)
  - Show "Most Used" indicator (⭐) for top 3 templates
  - _Requirements: 10_

- [ ] 7.3 Add import/export functionality
  - Add "Export Templates" button that downloads JSON file
  - Add "Import Templates" button that accepts JSON file upload
  - Validate imported JSON structure
  - Show import summary (X imported, Y skipped)
  - Handle merge conflicts (keep existing vs. overwrite)
  - _Requirements: 10_

- [ ] 8. Implement mobile optimizations
- [ ] 8.1 Ensure touch-friendly interface
  - Verify all buttons are minimum 44x44px
  - Add adequate spacing between buttons (min 8px)
  - Test on various mobile devices and screen sizes
  - _Requirements: 12_

- [ ] 8.2 Implement responsive layout
  - Stack buttons vertically on screens < 640px
  - Ensure modal fits viewport on all screen sizes
  - Enable vertical scrolling when content exceeds viewport
  - Respect safe area insets for notched devices
  - Ensure minimum font size of 16px to prevent iOS zoom
  - _Requirements: 12_

- [ ] 8.3 Handle keyboard interactions on mobile
  - Adjust modal position when keyboard is displayed
  - Keep active input visible when keyboard appears
  - Implement smooth scroll to focused input
  - _Requirements: 12_

- [ ] 9. Implement accessibility features
- [ ] 9.1 Add keyboard navigation
  - Ensure Tab key moves focus to next interactive element
  - Ensure Shift+Tab moves focus to previous element
  - Ensure Escape key closes modal (with confirmation if dirty)
  - Ensure Enter key activates focused button
  - Show visible focus indicators on all interactive elements
  - _Requirements: 13_

- [ ] 9.2 Add screen reader support
  - Add aria-labels to all buttons and inputs
  - Add aria-describedby for helper text and errors
  - Announce step changes to screen readers
  - Announce validation errors
  - Make progress indicator accessible with aria-valuenow
  - _Requirements: 13_

- [ ] 9.3 Implement focus management
  - Focus first interactive element when modal opens
  - Implement focus trap within modal
  - Restore focus to trigger button when modal closes
  - _Requirements: 13_

- [ ] 10. Add analytics and usage tracking
- [ ] 10.1 Implement event logging
  - Log "quick_brief_started" event when modal opens
  - Log "quick_brief_step_completed" for each step
  - Log "quick_brief_submitted" when matter is created
  - Log "quick_brief_abandoned" when modal is closed without submission
  - Log "custom_template_added" when advocate creates custom template
  - _Requirements: 15_

- [ ] 10.2 Track performance metrics
  - Record total time taken to complete questionnaire
  - Record time spent on each step
  - Track which step users abandon most frequently
  - Track template usage frequency
  - _Requirements: 15_

- [ ] 10.3 Create analytics dashboard (optional)
  - Display total briefs captured via Quick Brief Entry
  - Show average completion time
  - Display most used templates by category
  - Show abandonment rate by step
  - _Requirements: 15_

- [ ] 11. Update MattersPage integration
- [ ] 11.1 Update button to trigger enhanced modal
  - Ensure "Quick Brief Entry" button opens QuickBriefCaptureModal
  - Pass onConfirm handler that calls matterApiService.createFromQuickBrief
  - Handle success by refreshing matters list and navigating to workbench
  - Handle errors with appropriate error messages
  - _Requirements: 11_

- [ ] 11.2 Add keyboard shortcut (optional)
  - Register Ctrl+Shift+Q (or Cmd+Shift+Q on Mac) shortcut
  - Open Quick Brief Capture modal when shortcut is pressed
  - Add shortcut hint to button tooltip
  - _Requirements: 1_

- [ ] 12. Testing and quality assurance
- [ ]* 12.1 Write unit tests for components
  - Test ProgressIndicator renders correctly
  - Test AnswerButtonGrid selection and custom input
  - Test each step component's validation logic
  - Test QuickBriefTemplateService methods
  - _Requirements: All_

- [ ] 12.2 Write integration tests
  - Test complete questionnaire flow from start to finish
  - Test matter creation with all data populated correctly
  - Test template saving and retrieval
  - Test localStorage persistence and restoration
  - Test navigation to Matter Workbench after submission
  - _Requirements: All_

- [ ] 12.3 Perform accessibility audit
  - Test keyboard navigation through entire flow
  - Test with screen reader (NVDA, JAWS, or VoiceOver)
  - Verify all ARIA attributes are correct
  - Check color contrast ratios meet WCAG AA standards
  - _Requirements: 13_

- [ ] 12.4 Conduct mobile testing
  - Test on iOS devices (iPhone 12, 13, 14)
  - Test on Android devices (various screen sizes)
  - Verify touch targets are adequate
  - Test with on-screen keyboard
  - Verify responsive layout on all screen sizes
  - _Requirements: 12_

- [ ] 12.5 Performance testing
  - Measure modal open time (target: < 200ms)
  - Measure step transition time (target: < 100ms)
  - Measure template load time (target: < 300ms)
  - Measure form submission time (target: < 1000ms)
  - Verify auto-save doesn't cause UI lag
  - _Requirements: All_

- [ ] 13. Documentation and deployment
- [ ] 13.1 Update user documentation
  - Add Quick Brief Capture section to user guide
  - Create video tutorial showing the feature in action
  - Document keyboard shortcuts
  - Document template management in settings
  - _Requirements: All_

- [ ] 13.2 Create migration guide
  - Document database migration steps
  - Provide rollback plan if needed
  - Document feature flag configuration
  - _Requirements: All_

- [ ] 13.3 Deploy with feature flag
  - Enable feature for beta users first
  - Monitor error rates and performance metrics
  - Gather user feedback
  - Gradually roll out to all users
  - _Requirements: All_
