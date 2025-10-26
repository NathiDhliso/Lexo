# Requirements Document

## Introduction

The Quick Brief Capture feature enhances the existing QuickAddMatterModal to provide advocates with a streamlined, phone-optimized interface for capturing matter details when attorneys call them. This feature addresses the "Path B" workflow where advocates need to quickly accept and document briefs without requiring the attorney to use the portal.

The current QuickAddMatterModal is a simple form. This enhancement transforms it into an intelligent, multi-step questionnaire with preconfigured answer buttons, custom template management, and profile-based personalization that learns from the advocate's usage patterns.

## Requirements

### Requirement 1: Multi-Step Questionnaire Interface

**User Story:** As an advocate receiving a phone call from an attorney, I want to quickly capture matter details through a guided questionnaire, so that I can focus on the conversation rather than navigating complex forms.

#### Acceptance Criteria

1. WHEN the advocate clicks "Quick Brief Entry" button on MattersPage THEN the system SHALL display a modal with a multi-step questionnaire interface
2. WHEN the questionnaire is displayed THEN the system SHALL show a progress indicator displaying "Step X of 6"
3. WHEN the advocate is on any step THEN the system SHALL display the current question in large, clear text
4. WHEN the advocate completes a step THEN the system SHALL automatically advance to the next step
5. WHEN the advocate clicks "Previous" THEN the system SHALL navigate back to the previous step without losing entered data
6. WHEN the advocate reaches the final step THEN the system SHALL display a "Save & Accept Brief" button instead of "Next"

### Requirement 2: Preconfigured Answer Buttons

**User Story:** As an advocate, I want to select answers by clicking large buttons rather than typing, so that I can capture information quickly while on the phone.

#### Acceptance Criteria

1. WHEN a question is displayed THEN the system SHALL show preconfigured answer options as clickable buttons
2. WHEN an answer button is clicked THEN the system SHALL visually indicate selection with a checkmark
3. WHEN a button is selected THEN the system SHALL highlight it with the theme color (judicial-blue or mpondo-gold)
4. WHEN preconfigured answers don't match the attorney's response THEN the system SHALL provide a "[+ Add Custom]" button
5. WHEN "[+ Add Custom]" is clicked THEN the system SHALL display a text input field below the buttons
6. WHEN a custom answer is entered THEN the system SHALL automatically save it to the advocate's profile for future use
7. WHEN buttons are displayed THEN the system SHALL ensure minimum touch target size of 44x44px for mobile accessibility

### Requirement 3: Attorney & Firm Selection (Question 1)

**User Story:** As an advocate, I want to quickly select the instructing attorney and firm from my existing contacts, so that I don't have to re-enter information for repeat clients.

#### Acceptance Criteria

1. WHEN Question 1 is displayed THEN the system SHALL show a dropdown of existing firms
2. WHEN a firm is selected THEN the system SHALL display a filtered dropdown of attorneys associated with that firm
3. WHEN an attorney is selected THEN the system SHALL auto-populate their contact details
4. WHEN the attorney is not in the system THEN the system SHALL provide a "Quick Add Firm/Attorney" option
5. WHEN "Quick Add" is selected THEN the system SHALL display inline fields for firm name, attorney name, and email
6. WHEN new firm/attorney details are entered THEN the system SHALL validate email format before proceeding
7. WHEN validation passes THEN the system SHALL save the new firm/attorney to the database

### Requirement 4: Matter Title Templates (Question 2)

**User Story:** As an advocate, I want to use predefined matter title templates, so that I can maintain consistent naming conventions across my matters.

#### Acceptance Criteria

1. WHEN Question 2 is displayed THEN the system SHALL show preconfigured title templates as buttons
2. WHEN a template button is clicked THEN the system SHALL populate the title field with the template text
3. WHEN a template contains placeholders like "[Client Name]" THEN the system SHALL allow the advocate to edit the populated text
4. WHEN the advocate types a custom title THEN the system SHALL save it as a new template option
5. WHEN templates are displayed THEN the system SHALL show the 5 most recently used templates first
6. IF no templates exist THEN the system SHALL provide default templates: "Contract Dispute - [Client Name]", "Opinion on [Topic]", "Court Appearance - [Case Name]"

### Requirement 5: Type of Work Selection (Question 3)

**User Story:** As an advocate, I want to quickly categorize the type of work requested, so that I can track different service types and bill appropriately.

#### Acceptance Criteria

1. WHEN Question 3 is displayed THEN the system SHALL show quick select buttons for common work types
2. WHEN the system displays work types THEN it SHALL include: Opinion, Court Appearance, Drafting, Research, Consultation, Heads of Argument
3. WHEN a work type button is clicked THEN the system SHALL show a checkmark indicator
4. WHEN "[+ Add Custom]" is clicked THEN the system SHALL display a text input for custom work type
5. WHEN a custom work type is entered THEN the system SHALL save it to the advocate's profile
6. WHEN work types are displayed THEN the system SHALL show the advocate's most frequently used types first

### Requirement 6: Practice Area Selection (Question 4)

**User Story:** As an advocate, I want to categorize matters by practice area, so that I can track my work distribution and expertise areas.

#### Acceptance Criteria

1. WHEN Question 4 is displayed THEN the system SHALL show quick select buttons for practice areas
2. WHEN the system displays practice areas THEN it SHALL include: Labour Law, Commercial, Tax, Constitutional, Criminal, Family, Property
3. WHEN a practice area button is clicked THEN the system SHALL show a checkmark indicator
4. WHEN "[+ Add Custom]" is clicked THEN the system SHALL display a text input for custom practice area
5. WHEN a custom practice area is entered THEN the system SHALL save it to the advocate's profile
6. WHEN practice areas are displayed THEN the system SHALL show the advocate's most frequently used areas first

### Requirement 7: Urgency and Deadline Selection (Question 5)

**User Story:** As an advocate, I want to quickly set urgency levels and deadlines, so that I can prioritize my workload appropriately.

#### Acceptance Criteria

1. WHEN Question 5 is displayed THEN the system SHALL show quick select buttons for urgency levels
2. WHEN the system displays urgency options THEN it SHALL include: [Same Day], [1-2 Days], [Within a Week], [Within 2 Weeks], [Within a Month], [Custom Date: 📅]
3. WHEN "Within a Week" is selected THEN the system SHALL automatically calculate deadline as 7 days from today
4. WHEN "Within 2 Weeks" is selected THEN the system SHALL automatically calculate deadline as 14 days from today
5. WHEN "Within a Month" is selected THEN the system SHALL automatically calculate deadline as 30 days from today
6. WHEN "Custom Date" is selected THEN the system SHALL display a date picker
7. WHEN a deadline is set THEN the system SHALL store both the urgency level and calculated deadline date

### Requirement 8: Brief Summary with Templates (Question 6)

**User Story:** As an advocate, I want to use common issue templates for brief summaries, so that I can quickly document the matter while maintaining professional descriptions.

#### Acceptance Criteria

1. WHEN Question 6 is displayed THEN the system SHALL show common issue template buttons
2. WHEN the system displays issue templates THEN it SHALL include: [Breach of Contract], [Employment Dispute], [Restraint of Trade], [Shareholder Dispute], [Tax Assessment Challenge]
3. WHEN a template button is clicked THEN the system SHALL populate a text area with pre-filled template text
4. WHEN template text is populated THEN the system SHALL allow the advocate to edit the text
5. WHEN template text contains placeholders like "[edit: specify details]" THEN the system SHALL position cursor at the placeholder
6. WHEN "[+ Add Custom Template]" is clicked THEN the system SHALL allow the advocate to create a new template
7. WHEN a custom template is created THEN the system SHALL save it to the advocate's profile
8. IF the advocate skips this step THEN the system SHALL mark the brief summary as optional but recommended

### Requirement 9: Reference Materials Linking (Optional)

**User Story:** As an advocate, I want to link to documents in the attorney's cloud storage, so that I can access reference materials without requiring file uploads.

#### Acceptance Criteria

1. WHEN Question 6 (or 7 if summary is separate) is displayed THEN the system SHALL provide a "🔗 Add links to documents" section
2. WHEN the link section is displayed THEN the system SHALL show a URL input field
3. WHEN a URL is entered THEN the system SHALL validate it as a proper URL format
4. WHEN a valid URL is added THEN the system SHALL allow multiple links to be added
5. WHEN links are displayed THEN the system SHALL show a note: "Documents stay in attorney's cloud storage"
6. WHEN the advocate proceeds without adding links THEN the system SHALL allow this as optional
7. WHEN links are saved THEN the system SHALL store them as document references associated with the matter

### Requirement 10: Template Management in Settings

**User Story:** As an advocate, I want to manage my quick brief templates in settings, so that I can customize and organize my frequently used options.

#### Acceptance Criteria

1. WHEN the advocate navigates to Settings → My Quick Brief Templates THEN the system SHALL display all saved templates
2. WHEN templates are displayed THEN the system SHALL group them by category: Matter Types, Practice Areas, Urgency Presets, Common Issues
3. WHEN a template is displayed THEN the system SHALL show Edit and Delete buttons
4. WHEN the Edit button is clicked THEN the system SHALL allow inline editing of the template text
5. WHEN the Delete button is clicked THEN the system SHALL prompt for confirmation before deletion
6. WHEN templates are displayed THEN the system SHALL show a "Most Used" indicator (⭐) for frequently selected options
7. WHEN templates are displayed THEN the system SHALL provide reorder functionality (up/down arrows or drag-and-drop)
8. WHEN the advocate exports templates THEN the system SHALL generate a JSON file with all templates
9. WHEN the advocate imports templates THEN the system SHALL validate and merge with existing templates

### Requirement 11: Matter Creation and Activation

**User Story:** As an advocate, I want matters captured through Quick Brief Entry to be immediately active, so that I can start working without additional approval steps.

#### Acceptance Criteria

1. WHEN the advocate clicks "Save & Accept Brief" THEN the system SHALL create a new matter with status "Active"
2. WHEN the matter is created THEN the system SHALL populate all fields from the questionnaire responses
3. WHEN the matter is created THEN the system SHALL set the advocate_id to the current user
4. WHEN the matter is created THEN the system SHALL generate a unique matter reference number
5. WHEN the matter is created THEN the system SHALL display a success message: "Brief accepted! Matter is now active."
6. WHEN the matter is created THEN the system SHALL navigate to the Matter Workbench for the new matter
7. WHEN the matter is created THEN the system SHALL send a confirmation email to the instructing attorney (if email is provided)

### Requirement 12: Mobile Optimization

**User Story:** As an advocate using a mobile device, I want the Quick Brief Entry to work seamlessly on my phone, so that I can capture briefs while away from my desk.

#### Acceptance Criteria

1. WHEN the modal is displayed on mobile THEN the system SHALL ensure all buttons are minimum 44x44px touch targets
2. WHEN the modal is displayed on mobile THEN the system SHALL stack buttons vertically if screen width is less than 640px
3. WHEN the modal content exceeds viewport height THEN the system SHALL enable vertical scrolling
4. WHEN the modal is displayed THEN the system SHALL respect safe area insets for notched devices
5. WHEN text is displayed THEN the system SHALL ensure minimum font size of 16px to prevent zoom on iOS
6. WHEN the keyboard is displayed THEN the system SHALL adjust modal position to keep active input visible
7. WHEN the modal is displayed THEN the system SHALL support swipe gestures for navigation between steps

### Requirement 13: Accessibility and Keyboard Navigation

**User Story:** As an advocate using keyboard navigation, I want to complete the questionnaire without using a mouse, so that I can work efficiently.

#### Acceptance Criteria

1. WHEN the modal is opened THEN the system SHALL focus the first interactive element
2. WHEN the Tab key is pressed THEN the system SHALL move focus to the next interactive element
3. WHEN Shift+Tab is pressed THEN the system SHALL move focus to the previous interactive element
4. WHEN the Escape key is pressed THEN the system SHALL close the modal with confirmation if data is entered
5. WHEN Enter is pressed on a button THEN the system SHALL activate that button
6. WHEN Enter is pressed on the last step THEN the system SHALL submit the form
7. WHEN screen reader is active THEN the system SHALL announce step changes and validation errors
8. WHEN buttons are focused THEN the system SHALL show visible focus indicators

### Requirement 14: Data Persistence and Auto-Save

**User Story:** As an advocate, I want my progress to be saved if I accidentally close the modal, so that I don't lose captured information.

#### Acceptance Criteria

1. WHEN the advocate enters data in any step THEN the system SHALL save it to browser localStorage
2. WHEN the modal is reopened THEN the system SHALL restore previously entered data from localStorage
3. WHEN the advocate completes the questionnaire THEN the system SHALL clear the localStorage data
4. WHEN the advocate explicitly cancels THEN the system SHALL prompt: "You have unsaved changes. Discard?"
5. WHEN the advocate confirms discard THEN the system SHALL clear localStorage and close modal
6. WHEN the browser crashes or closes THEN the system SHALL retain data in localStorage for 24 hours
7. WHEN 24 hours pass THEN the system SHALL automatically clear stale localStorage data

### Requirement 15: Analytics and Usage Tracking

**User Story:** As a system administrator, I want to track Quick Brief Entry usage patterns, so that I can optimize the feature based on real usage data.

#### Acceptance Criteria

1. WHEN a matter is created via Quick Brief Entry THEN the system SHALL log the event with timestamp
2. WHEN a custom template is created THEN the system SHALL track which field it was added to
3. WHEN a preconfigured button is clicked THEN the system SHALL increment its usage counter
4. WHEN the questionnaire is completed THEN the system SHALL record the total time taken
5. WHEN the questionnaire is abandoned THEN the system SHALL record which step was last active
6. WHEN analytics are viewed THEN the system SHALL display: total briefs captured, average completion time, most used templates
7. WHEN analytics are viewed THEN the system SHALL respect user privacy and not expose individual advocate data without consent
