# Requirements Document - Attorney Invitation Workflow

## Introduction

This feature transforms the firm management system into a complete attorney onboarding workflow. Instead of manually creating attorney accounts, advocates can now invite attorneys via a secure link. Attorneys register themselves, submit matter requests, and the system automatically links everything to the correct firm.

This replaces the old ProForma request workflow with a cleaner, attorney-first invitation system.

---

## Requirements

### Requirement 1: Invite Attorney from Firms Page

**User Story:** As an advocate, I want to invite an attorney from a firm card, so that they can register and submit matter requests.

#### Acceptance Criteria

1. WHEN viewing the FirmsPage THEN each FirmCard SHALL display an "Invite Attorney" button
2. WHEN clicking "Invite Attorney" THEN the system SHALL open an InviteAttorneyModal
3. WHEN the modal opens THEN the system SHALL generate a unique, secure invitation token
4. WHEN the token is generated THEN the system SHALL store it in the firms table with an expiration date
5. WHEN the token is stored THEN the system SHALL display a copyable invitation link in the format `/register-firm?firm_id=[id]&token=[token]`
6. WHEN the user copies the link THEN the system SHALL provide visual feedback (toast notification)

---

### Requirement 2: Attorney Registration via Invitation Link

**User Story:** As an attorney, I want to register using an invitation link, so that I can access the system and submit matter requests.

#### Acceptance Criteria

1. WHEN an attorney clicks the invitation link THEN the system SHALL navigate to `/register-firm` route
2. WHEN the page loads THEN the system SHALL extract firm_id and token from URL parameters
3. WHEN the token is extracted THEN the system SHALL verify the token is valid and not expired
4. IF the token is invalid or expired THEN the system SHALL display an error message
5. IF the token is valid THEN the system SHALL fetch and display the firm's name ("Welcome, [Firm Name]!")
6. WHEN the firm data is loaded THEN the system SHALL display a registration form with fields:
   - Attorney name (pre-filled from firm data if available)
   - Contact number
   - Email (pre-filled from firm data)
   - Password
   - Confirm password
7. WHEN the attorney submits the form THEN the system SHALL create their user account
8. WHEN the account is created THEN the system SHALL mark the firm as "onboarded" or "active"
9. WHEN registration succeeds THEN the system SHALL redirect to SubmitMatterRequestPage

---

### Requirement 3: Matter Request Submission

**User Story:** As a newly registered attorney, I want to submit a matter request, so that the advocate can review and accept my case.

#### Acceptance Criteria

1. WHEN redirected after registration THEN the system SHALL display SubmitMatterRequestPage
2. WHEN the page loads THEN the system SHALL automatically include the firm_id from the attorney's session
3. WHEN the page loads THEN the system SHALL display a matter request form with fields:
   - Matter title
   - Brief description
   - Matter type (dropdown)
   - Urgency level (dropdown)
   - Optional: Upload key documents
4. WHEN the attorney submits the form THEN the system SHALL create a new matter with status "New Request"
5. WHEN the matter is created THEN the system SHALL link it to the firm_id
6. WHEN the matter is created THEN the system SHALL link it to the advocate who owns the firm
7. WHEN submission succeeds THEN the system SHALL display a success message
8. WHEN submission succeeds THEN the system SHALL provide a confirmation with matter reference number

---

### Requirement 4: Advocate Views New Matter Requests

**User Story:** As an advocate, I want to see new matter requests from attorneys, so that I can review and accept them.

#### Acceptance Criteria

1. WHEN a matter request is submitted THEN it SHALL appear on the advocate's MattersPage
2. WHEN viewing the matter THEN it SHALL display status "New Request" or similar
3. WHEN viewing the matter THEN it SHALL show the linked firm information
4. WHEN viewing the matter THEN the advocate SHALL be able to accept or reject the request
5. WHEN the advocate accepts THEN the matter status SHALL change to "Active"
6. WHEN the advocate rejects THEN the matter status SHALL change to "Rejected" with optional reason

---

### Requirement 5: Security and Token Management

**User Story:** As a system administrator, I want invitation tokens to be secure and expire, so that unauthorized access is prevented.

#### Acceptance Criteria

1. WHEN generating a token THEN the system SHALL create a cryptographically secure random token
2. WHEN storing a token THEN the system SHALL include an expiration timestamp (default: 7 days)
3. WHEN verifying a token THEN the system SHALL check it matches the stored token
4. WHEN verifying a token THEN the system SHALL check it has not expired
5. WHEN a token is used successfully THEN the system SHALL mark it as "used" or delete it
6. WHEN a token expires THEN the system SHALL not allow registration with that token
7. IF a token verification fails THEN the system SHALL log the attempt for security monitoring

---

### Requirement 6: Database Schema Updates

**User Story:** As a developer, I want the database to support invitation tokens, so that the workflow can function correctly.

#### Acceptance Criteria

1. WHEN the migration runs THEN the firms table SHALL have an invitation_token column (TEXT, nullable)
2. WHEN the migration runs THEN the firms table SHALL have an invitation_token_expires_at column (TIMESTAMPTZ, nullable)
3. WHEN the migration runs THEN the firms table SHALL have an invitation_token_used_at column (TIMESTAMPTZ, nullable)
4. WHEN the migration runs THEN the firms table SHALL have an onboarded_at column (TIMESTAMPTZ, nullable)
5. WHEN the migration runs THEN the matters table SHALL support status "new_request"
6. WHEN the migration runs THEN appropriate indexes SHALL be created for token lookups

---

## Edge Cases and Error Handling

### Token Expiration
- Display clear message: "This invitation link has expired. Please contact the advocate for a new invitation."
- Provide advocate contact information if available

### Token Already Used
- Display message: "This invitation has already been used. If you need access, please contact the advocate."

### Firm Already Onboarded
- Allow re-invitation but warn that firm already has an account
- Option to "resend invitation" which generates a new token

### Network Errors
- Display user-friendly error messages
- Provide retry options
- Save form data locally to prevent data loss

### Duplicate Email
- Check if email already exists during registration
- Display message: "An account with this email already exists. Please log in instead."
- Provide link to login page

---

## Non-Functional Requirements

### Performance
- Token generation should complete in < 100ms
- Token verification should complete in < 200ms
- Page loads should complete in < 2 seconds

### Security
- Tokens must be cryptographically secure (minimum 32 characters)
- HTTPS required for all invitation links
- Rate limiting on token verification attempts
- Tokens should be single-use

### Usability
- Invitation link should be easily copyable (one-click copy)
- Registration form should have clear validation messages
- Success states should be clearly communicated
- Mobile-responsive design for all pages

### Accessibility
- All forms should be keyboard navigable
- Screen reader compatible
- Clear focus indicators
- ARIA labels on all interactive elements

