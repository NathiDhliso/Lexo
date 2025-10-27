# Billing Workflow Modernization Requirements

## Introduction

This specification addresses critical value proposition gaps and UX friction points in the current billing system that conflict with South African advocates' traditional practice patterns. The system currently treats time-based billing as the primary workflow, creating unnecessary complexity for advocates who primarily work on brief fees (fixed-fee arrangements). This modernization reframes the system to treat both billing models as equally valid, implements matter-level billing preferences, adds essential trust account functionality, and reduces administrative overhead throughout the financial workflow.

## Requirements

### Requirement 1: Matter-Level Billing Model Selection

**User Story:** As an advocate, I want to choose the billing model when creating a matter, so that the system adapts to my preferred workflow rather than forcing me into time-tracking.

#### Acceptance Criteria

1. WHEN creating a new matter THEN the system SHALL present billing model options: "Fixed Brief Fee (default)", "Quick Opinion/Consultation", "Time-Based Billing"
2. WHEN "Fixed Brief Fee" is selected THEN the system SHALL hide all time-tracking prompts and widgets for that matter
3. WHEN "Fixed Brief Fee" is selected THEN the system SHALL display milestone-based progress indicators instead of time entries
4. WHEN "Time-Based Billing" is selected THEN the system SHALL show time-tracking widgets and hourly rate fields
5. IF the user changes billing model after matter creation THEN the system SHALL warn about data implications and require confirmation
6. WHEN viewing a matter THEN the system SHALL clearly indicate which billing model is active

### Requirement 2: User-Level Billing Preferences and Defaults

**User Story:** As an advocate who primarily uses brief fees, I want the system to default to my preferred billing method, so that I don't have to repeatedly select it for every matter.

#### Acceptance Criteria

1. WHEN completing initial onboarding THEN the system SHALL ask "How do you typically bill?" with options: "Mostly brief fees", "Mix of brief fees and hourly", "Primarily time-based"
2. WHEN the user selects "Mostly brief fees" THEN the system SHALL set "Fixed Brief Fee" as the default for new matters
3. WHEN the user selects "Mostly brief fees" THEN the system SHALL hide time-tracking KPIs from the dashboard by default
4. WHEN the user selects "Primarily time-based" THEN the system SHALL show time-tracking widgets prominently
5. IF the user changes their preference in settings THEN the system SHALL update dashboard widgets and defaults accordingly
6. WHEN creating a new matter THEN the system SHALL pre-select the user's default billing model but allow override

### Requirement 3: Progressive Disclosure for Time Tracking

**User Story:** As an advocate using brief fees, I want time-tracking features hidden by default, so that I'm not distracted by irrelevant administrative tasks.

#### Acceptance Criteria

1. WHEN viewing a brief fee matter THEN the system SHALL NOT display timer widgets or time-entry prompts
2. WHEN viewing a brief fee matter THEN the system SHALL show fee milestones: "Brief accepted", "Opinion delivered", "Court appearance completed"
3. WHEN viewing a brief fee matter THEN the system SHALL offer "Advanced: Track time for internal analysis" as an expandable optional section
4. WHEN the user expands advanced time tracking THEN the system SHALL show time-entry fields but mark them as "optional for internal use only"
5. IF the user logs time on a brief fee matter THEN the system SHALL NOT include it in invoices by default
6. WHEN generating an invoice for a brief fee matter THEN the system SHALL show only the agreed fee amount and disbursements

### Requirement 4: Trust Account Management

**User Story:** As an advocate, I must manage trust accounts to comply with Legal Practice Council requirements, so that I can receive client funds, track trust money, and transfer fees properly.

#### Acceptance Criteria

1. WHEN setting up financial settings THEN the system SHALL provide trust account configuration with bank details
2. WHEN receiving payment THEN the system SHALL allow designation as "Trust Account" or "Business Account"
3. WHEN funds are in trust THEN the system SHALL track them separately from business funds with clear visual distinction
4. WHEN issuing a receipt THEN the system SHALL generate trust account receipts with required legal disclosures
5. WHEN transferring fees from trust to business THEN the system SHALL create an audit trail with date, amount, and matter reference
6. WHEN viewing financial reports THEN the system SHALL show trust account balance separately from business account balance
7. IF trust account balance is negative THEN the system SHALL display a critical warning (Legal Practice Council violation)
8. WHEN reconciling accounts THEN the system SHALL provide trust account reconciliation reports

### Requirement 5: Flexible Invoice Numbering with Audit Trail

**User Story:** As an advocate who occasionally issues invoices outside the system, I want flexibility in invoice numbering while maintaining SARS compliance, so that I can manage all my invoicing without conflicts.

#### Acceptance Criteria

1. WHEN configuring invoice settings THEN the system SHALL allow choice between "Strict Sequential" and "Flexible with Gaps"
2. WHEN "Strict Sequential" is selected THEN the system SHALL enforce no gaps and track voids with explanations
3. WHEN "Flexible with Gaps" is selected THEN the system SHALL allow manual invoice number entry with validation
4. WHEN a gap is detected in flexible mode THEN the system SHALL log it in the audit trail with reason
5. IF an invoice is voided THEN the system SHALL require a reason and maintain the void in the sequence
6. WHEN generating SARS reports THEN the system SHALL include all invoices, voids, and gaps with explanations
7. WHEN the year changes THEN the system SHALL offer to reset numbering or continue the sequence based on user preference

### Requirement 6: Smart Disbursement VAT Handling

**User Story:** As an advocate, I want the system to intelligently handle VAT on disbursements, so that I don't have to manually toggle VAT for every court fee and transcript.

#### Acceptance Criteria

1. WHEN logging a disbursement THEN the system SHALL suggest VAT applicability based on disbursement type
2. WHEN disbursement type is "Court filing fee" or "Transcript" THEN the system SHALL default to "VAT: No"
3. WHEN disbursement type is "Travel" or "Accommodation" THEN the system SHALL default to "VAT: Yes"
4. WHEN the user creates custom disbursement types THEN the system SHALL allow setting default VAT behavior
5. IF VAT treatment is incorrect THEN the system SHALL allow easy correction with audit trail
6. WHEN generating invoices THEN the system SHALL clearly separate VAT-inclusive and VAT-exempt disbursements
7. WHEN generating VAT reports THEN the system SHALL correctly categorize disbursements for SARS compliance

### Requirement 7: Expedited Brief Fee Workflow (Path B Enhancement)

**User Story:** As an advocate handling urgent matters, I want to start work immediately and formalize the brief later, so that I can respond to same-day briefs and emergency applications.

#### Acceptance Criteria

1. WHEN creating a matter in "Quick Brief" mode THEN the system SHALL allow starting work before formal quote approval
2. WHEN a matter is marked "Urgent" THEN the system SHALL skip the pro forma approval step by default
3. WHEN starting urgent work THEN the system SHALL capture: attorney name, matter type, agreed fee, and brief date
4. WHEN the urgent matter is created THEN the system SHALL generate a confirmation email to the attorney
5. IF formal documentation arrives later THEN the system SHALL allow attaching it to the existing matter
6. WHEN viewing urgent matters THEN the system SHALL display a visual indicator (e.g., orange "URGENT" badge)
7. WHEN generating an invoice for urgent work THEN the system SHALL include the agreed fee without requiring prior quote approval

### Requirement 8: Simplified Attorney Connection Workflow

**User Story:** As an advocate with established attorney relationships, I want to capture briefs quickly without formal invitation bureaucracy, so that I can focus on legal work rather than administrative setup.

#### Acceptance Criteria

1. WHEN creating a matter THEN the system SHALL allow entering attorney details manually without requiring firm setup
2. WHEN attorney details are entered manually THEN the system SHALL offer to "Send invitation later" as optional
3. WHEN the user has recurring attorneys THEN the system SHALL provide an attorney quick-select list
4. WHEN selecting a recurring attorney THEN the system SHALL auto-fill firm details from previous matters
5. IF the attorney is not yet registered THEN the system SHALL still allow matter creation and invoicing
6. WHEN generating an invoice for an unregistered attorney THEN the system SHALL use email delivery instead of portal notification
7. WHEN the attorney later registers THEN the system SHALL offer to link historical matters to their account

### Requirement 9: Scope Amendment for All Billing Models

**User Story:** As an advocate, I need to handle scope changes regardless of billing model, so that I can properly document and bill for expanded work on any matter.

#### Acceptance Criteria

1. WHEN a brief fee matter expands in scope THEN the system SHALL provide a "Request Scope Amendment" option
2. WHEN requesting a scope amendment THEN the system SHALL capture: original scope, expanded scope, additional fee, reason
3. WHEN a scope amendment is submitted THEN the system SHALL notify the attorney and request approval
4. WHEN the attorney approves THEN the system SHALL update the matter fee and create an audit trail entry
5. IF the attorney declines THEN the system SHALL notify the advocate and maintain the original scope
6. WHEN viewing matter history THEN the system SHALL display all scope amendments with dates and amounts
7. WHEN generating an invoice THEN the system SHALL itemize original fee and scope amendment fees separately

### Requirement 10: Positive Payment Tracking UX

**User Story:** As an advocate, I want payment tracking that helps me manage cash flow without creating stress, so that I can focus on collection strategies rather than feeling overwhelmed by overdue amounts.

#### Acceptance Criteria

1. WHEN viewing payment status THEN the system SHALL use neutral language: "Payment pending" instead of "Overdue"
2. WHEN an invoice is unpaid for 30+ days THEN the system SHALL show "Follow-up suggested" instead of red "OVERDUE" warnings
3. WHEN viewing the dashboard THEN the system SHALL show "Collection opportunities" instead of "Aging debt"
4. WHEN filtering invoices THEN the system SHALL offer "Needs attention" filter instead of "Overdue" filter
5. IF the user wants detailed aging THEN the system SHALL provide it in a dedicated "Collections Report" rather than on every page
6. WHEN viewing payment progress THEN the system SHALL emphasize positive metrics: "80% collected this month" instead of "20% outstanding"
7. WHEN an invoice is partially paid THEN the system SHALL show progress bar with encouraging messaging: "R5,000 of R10,000 received"

### Requirement 11: Mobile-First Quick Actions

**User Story:** As an advocate who works from court and chambers, I want essential actions optimized for mobile, so that I can manage matters and invoicing from my phone.

#### Acceptance Criteria

1. WHEN accessing the system on mobile THEN the system SHALL display a mobile-optimized quick actions menu
2. WHEN on mobile THEN the system SHALL provide one-tap actions: "Log disbursement", "Record payment", "Send invoice"
3. WHEN creating a matter on mobile THEN the system SHALL use a simplified 2-step process instead of 4 steps
4. WHEN viewing matters on mobile THEN the system SHALL use card-based layout with swipe gestures
5. IF the user is in court THEN the system SHALL allow offline disbursement logging with sync when online
6. WHEN using voice input THEN the system SHALL support voice-to-text for matter descriptions and notes
7. WHEN viewing invoices on mobile THEN the system SHALL provide "Share via WhatsApp" option for attorney communication

### Requirement 12: Brief Fee Templates by Matter Type

**User Story:** As an advocate, I want pre-configured fee templates based on matter type and my seniority, so that I can create invoices in under 60 seconds.

#### Acceptance Criteria

1. WHEN setting up the system THEN the system SHALL provide default brief fee templates: "Opinion", "Court appearance", "Consultation", "Drafting"
2. WHEN creating a template THEN the system SHALL allow setting: matter type, base fee, seniority multiplier, typical disbursements
3. WHEN creating a new matter THEN the system SHALL suggest templates based on matter type
4. WHEN selecting a template THEN the system SHALL pre-fill fee amount and common disbursements
5. IF the user adjusts a template fee THEN the system SHALL offer to "Save as new template" or "Use once"
6. WHEN generating an invoice from a template THEN the system SHALL complete in under 60 seconds
7. WHEN viewing templates THEN the system SHALL show usage statistics: "Used 15 times this year, avg fee R8,500"

## Success Metrics

- Brief fee matters created without time-tracking: >80%
- Time to create invoice with template: <60 seconds
- User satisfaction with billing workflow: >4.5/5
- Trust account compliance: 100% (no negative balances)
- Mobile task completion rate: >90%
- Scope amendment usage: >30% of matters
- Attorney connection time: <2 minutes

## Constraints

- Must maintain SARS compliance for all invoice numbering approaches
- Trust account features must comply with Legal Practice Council regulations
- Cannot break existing time-tracking functionality for users who need it
- Must support gradual migration from current workflow
- Mobile features must work on iOS and Android
- Offline functionality must sync reliably when connection restored

## Dependencies

- Existing matter management system
- Current invoicing infrastructure
- Payment tracking system
- Mobile responsive framework
- Cloud storage integration (for document linking)
