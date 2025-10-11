# Implementation Plan: Calendar Integration

## Overview
This implementation plan focuses on building a simple, universal calendar integration using the iCalendar (.ics) standard format. The feature allows advocates to export events from LexoHub to any calendar application with one click.

## Task List

- [ ] 1. ICS generation service
- [ ] 1.1 Create ICSGeneratorService utility class
  - Implement core .ics file building logic
  - Implement date/time formatting functions (ISO 8601, UTC, date-only)
  - Implement text escaping for .ics format
  - Implement alarm/reminder formatting
  - Add file download trigger function
  - _Requirements: 9.1-9.7_

- [ ] 1.2 Implement event-specific generators
  - Implement `generateCourtDateEvent()` method
  - Implement `generateDeadlineEvent()` method
  - Implement `generateMeetingEvent()` method
  - Implement `generatePaymentReminderEvent()` method
  - Implement description formatting for each event type
  - _Requirements: 1.1-1.7, 2.1-2.6, 5.1-5.6, 7.1-7.6_

- [ ] 1.3 Implement bulk export functionality
  - Implement `generateBulkEvents()` method
  - Handle multiple events in single .ics file
  - Add event parsing helpers
  - _Requirements: 3.1-3.7_

- [ ] 1.4 Add mobile platform detection
  - Detect iOS devices
  - Detect Android devices
  - Implement iOS-specific .ics handling (data URL)
  - Implement standard download for other platforms
  - _Requirements: 8.1-8.7_

- [ ]* 1.5 Write unit tests for ICSGeneratorService
  - Test .ics file generation for each event type
  - Test date formatting functions
  - Test text escaping
  - Test alarm formatting
  - Test RFC 5545 compliance
  - _Requirements: 9.1-9.7_

- [ ] 2. Calendar settings and preferences
- [ ] 2.1 Create calendar settings types
  - Define TypeScript interfaces for reminder settings
  - Define default reminder configurations
  - _Requirements: 4.1-4.7_

- [ ] 2.2 Create CalendarSettingsService
  - Implement settings storage in localStorage
  - Implement `getReminderSettings()` method
  - Implement `updateReminderSettings()` method
  - Implement default settings initialization
  - _Requirements: 4.1-4.7_

- [ ] 2.3 Create CalendarSettingsPanel component
  - Form for configuring reminder preferences
  - Separate sections for each event type
  - Checkbox inputs for reminder times
  - Save button with success feedback
  - _Requirements: 4.1-4.7_

- [ ] 2.4 Integrate settings into user preferences
  - Add calendar settings to user preferences page
  - Ensure settings persist across sessions
  - _Requirements: 4.5, 4.6, 4.7_

- [ ]* 2.5 Write tests for settings
  - Test settings storage and retrieval
  - Test default settings
  - Test settings panel component
  - _Requirements: 4.1-4.7_

- [ ] 3. CalendarButton component
- [ ] 3.1 Create CalendarButton component
  - Reusable button component with calendar icon
  - Props for event type and data
  - Click handler to generate and download .ics
  - Support for different variants (primary, secondary, icon-only)
  - Support for different sizes
  - _Requirements: 1.1-1.7, 2.1-2.6, 5.1-5.6, 7.1-7.6_

- [ ] 3.2 Add success feedback
  - Toast notification on successful download
  - Different messages for single vs bulk export
  - Error handling with user-friendly messages
  - _Requirements: 10.1-10.7_

- [ ] 3.3 Handle edge cases
  - Missing required data
  - Invalid dates
  - Browser download blocking
  - Mobile platform differences
  - _Requirements: 8.1-8.7, 10.4, 10.5_

- [ ]* 3.4 Write component tests
  - Test button rendering
  - Test click handling
  - Test .ics generation
  - Test error scenarios
  - _Requirements: 1.1-10.7_

- [ ] 4. Bulk export functionality
- [ ] 4.1 Create BulkExportModal component
  - Modal with date range selector
  - Event type checkboxes (court dates, deadlines, meetings, payments)
  - Preview list of events to be exported
  - Event count display
  - Export button
  - _Requirements: 3.1-3.7_

- [ ] 4.2 Implement date range selection
  - Date pickers for start and end dates
  - Default to next 30 days
  - Validation (end date after start date)
  - _Requirements: 3.2, 3.3_

- [ ] 4.3 Implement event preview
  - Fetch events in selected date range
  - Filter by selected event types
  - Display first 10-20 events
  - Show total count
  - _Requirements: 3.3, 3.4_

- [ ] 4.4 Implement bulk export execution
  - Generate single .ics file with all events
  - Trigger download
  - Success message with event count
  - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [ ]* 4.5 Write modal tests
  - Test date range selection
  - Test event filtering
  - Test preview display
  - Test bulk export
  - _Requirements: 3.1-3.7_

- [ ] 5. Integration with matter pages
- [ ] 5.1 Add CalendarButton to matter detail page
  - Add button next to court date field
  - Add button next to expected completion date
  - Add button next to any other deadline fields
  - Ensure proper spacing and alignment
  - _Requirements: 1.1-1.7, 2.1-2.6_

- [ ] 5.2 Add CalendarButton to matter cards
  - Add icon button to matter card header or actions
  - Show for matters with upcoming dates
  - Tooltip explaining functionality
  - _Requirements: 1.1-1.7_

- [ ] 5.3 Handle multiple deadlines per matter
  - Display separate button for each deadline
  - Group deadlines visually if many exist
  - _Requirements: 2.5_

- [ ] 6. Integration with invoice pages
- [ ] 6.1 Add CalendarButton to invoice detail page
  - Add "Add Payment Reminder" button near due date
  - Use payment-specific event generation
  - _Requirements: 7.1-7.6_

- [ ] 6.2 Add CalendarButton to invoice list
  - Add icon button to invoice cards with due dates
  - Show only for unpaid invoices
  - _Requirements: 7.1-7.6_

- [ ] 6.3 Include payment reminders in bulk export
  - Add "Payment Due Dates" checkbox to bulk export modal
  - Fetch unpaid invoices in date range
  - Generate payment reminder events
  - _Requirements: 7.7_

- [ ] 7. Integration with dashboard
- [ ] 7.1 Add bulk export button to dashboard
  - Prominent "Export Upcoming Deadlines" button
  - Position in header or quick actions area
  - Opens BulkExportModal
  - _Requirements: 3.1-3.7_

- [ ] 7.2 Add calendar buttons to deadline widgets
  - If dashboard shows upcoming deadlines widget
  - Add calendar button next to each deadline
  - _Requirements: 1.1-2.6_

- [ ] 8. Event descriptions and links
- [ ] 8.1 Implement rich event descriptions
  - Include matter title and reference number
  - Include client name
  - Include event-specific details
  - Add link back to LexoHub
  - Format with line breaks for readability
  - _Requirements: 6.1-6.7_

- [ ] 8.2 Test description formatting
  - Verify descriptions display correctly in various calendar apps
  - Test URL links work in calendar apps
  - Test special character escaping
  - _Requirements: 6.1-6.7, 9.4_

- [ ] 9. Mobile optimization
- [ ] 9.1 Test iOS calendar integration
  - Test .ics file opening on iPhone
  - Test .ics file opening on iPad
  - Verify events add correctly to iOS Calendar
  - Test with different iOS versions
  - _Requirements: 8.1-8.7_

- [ ] 9.2 Test Android calendar integration
  - Test .ics file download on Android
  - Test opening .ics files
  - Verify events add correctly to Google Calendar
  - Test with different Android versions
  - _Requirements: 8.1-8.7_

- [ ] 9.3 Optimize button sizes for mobile
  - Ensure touch-friendly button sizes (44x44px minimum)
  - Test tap targets on small screens
  - Verify tooltips work on mobile
  - _Requirements: 8.7_

- [ ] 10. Calendar compatibility testing
- [ ] 10.1 Test with Google Calendar
  - Import .ics files
  - Verify all event details display correctly
  - Test reminders work
  - Test on web and mobile app
  - _Requirements: 9.7_

- [ ] 10.2 Test with Outlook
  - Import .ics files
  - Verify all event details display correctly
  - Test reminders work
  - Test on desktop and web versions
  - _Requirements: 9.7_

- [ ] 10.3 Test with Apple Calendar
  - Import .ics files on macOS
  - Import .ics files on iOS
  - Verify all event details display correctly
  - Test reminders work
  - _Requirements: 9.7_

- [ ] 10.4 Test with other calendar apps
  - Test with Thunderbird
  - Test with any other popular calendar apps
  - Document any compatibility issues
  - _Requirements: 9.7_

- [ ] 11. Error handling and edge cases
- [ ] 11.1 Handle missing data gracefully
  - Provide sensible defaults for optional fields
  - Skip events with missing required data
  - Log warnings for debugging
  - _Requirements: All_

- [ ] 11.2 Handle invalid dates
  - Validate dates before generating .ics
  - Show error message for invalid dates
  - Prevent .ics generation with bad data
  - _Requirements: 9.3_

- [ ] 11.3 Handle browser download blocking
  - Detect when download is blocked
  - Show instructions to allow downloads
  - Provide alternative (copy .ics content)
  - _Requirements: 10.5_

- [ ] 11.4 Add error logging
  - Log .ics generation errors
  - Log download errors
  - Include context for debugging
  - _Requirements: All_

- [ ] 12. User feedback and guidance
- [ ] 12.1 Add success messages
  - Toast for single event export
  - Toast for bulk export with count
  - Clear, actionable messages
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 12.2 Add help documentation
  - Tooltip explaining "Add to Calendar" feature
  - Help text in bulk export modal
  - Link to calendar integration guide
  - Troubleshooting tips
  - _Requirements: 10.6, 10.7_

- [ ] 12.3 Add onboarding hints
  - Feature discovery notification for first-time users
  - Highlight calendar buttons on first visit
  - _Requirements: 10.6_

- [ ] 13. Performance optimization
- [ ] 13.1 Optimize .ics generation
  - Generate files client-side (no server calls)
  - Cache reminder settings
  - Debounce bulk export preview
  - _Requirements: All_

- [ ] 13.2 Optimize bulk export
  - Limit preview to reasonable number of events
  - Paginate if many events
  - Show loading state during generation
  - _Requirements: 3.1-3.7_

- [ ] 14. Accessibility
- [ ] 14.1 Ensure keyboard accessibility
  - All calendar buttons keyboard accessible
  - Modal keyboard navigation
  - Focus management
  - _Requirements: All_

- [ ] 14.2 Add ARIA labels
  - Descriptive labels for calendar buttons
  - Screen reader announcements for actions
  - _Requirements: All_

- [ ] 15. Documentation and polish
- [ ] 15.1 Add user-facing documentation
  - How to use "Add to Calendar" feature
  - How to bulk export deadlines
  - How to configure reminder settings
  - Troubleshooting guide
  - _Requirements: All_

- [ ] 15.2 Final polish and refinements
  - Review all UI components for consistency
  - Ensure all loading states are handled
  - Verify all error states display properly
  - Test complete user flows end-to-end
  - _Requirements: All_

- [ ]* 16. Integration and E2E testing
  - Write integration tests for complete calendar flow
  - Test single event export end-to-end
  - Test bulk export end-to-end
  - Test settings persistence
  - Test mobile compatibility
  - Test calendar app compatibility
  - _Requirements: All from Requirement 1-10_

## Notes

- Tasks marked with `*` are optional unit/integration tests that can be skipped for MVP
- Each task should be completed and tested before moving to the next
- All tasks reference specific requirements from the requirements document
- No backend work required - all client-side implementation
- Estimated timeline: 1-2 weeks for complete implementation
- Core functionality (tasks 1-7) can be delivered in 1 week
- Focus on RFC 5545 compliance to ensure broad compatibility
- Test with multiple calendar applications during development
