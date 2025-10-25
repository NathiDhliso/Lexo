# Implementation Plan - Attorney Invitation Workflow

## 📋 Implementation Strategy

This feature builds on existing patterns:
- **Modal Pattern:** Reuse Modal.tsx for InviteAttorneyModal
- **Form Pattern:** Reuse FormInput.tsx for registration and matter request forms
- **Service Pattern:** Extend attorney.service.ts and matter-api.service.ts
- **Auth Pattern:** Follow existing ProtectedRoute pattern

---

- [x] 1. Database Schema Updates


  - Create migration for invitation token columns in firms table
  - Add indexes for token lookups
  - Update matter_status enum to include 'new_request'
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 1.1 Create invitation tokens migration


  - Create `supabase/migrations/YYYYMMDD_add_invitation_tokens_to_firms.sql`
  - Add invitation_token, invitation_token_expires_at, invitation_token_used_at, onboarded_at columns
  - Create index on invitation_token
  - Add comments for documentation
  - _Requirements: 6.1, 6.2, 6.3, 6.4_



- [x] 1.2 Update matter status enum


  - Add 'new_request' to matter_status enum

  - Create index on matters(status) for performance
  - Create composite index on matters(firm_id, status)
  - _Requirements: 6.5_

- [ ] 2. Type Definitions
  - Update Firm interface with invitation token fields
  - Create InvitationTokenResponse interface
  - Create AttorneyRegistrationData interface


  - Create MatterRequest interface
  - _Requirements: All_

- [x] 2.1 Update financial.types.ts

  - Add invitation token fields to Firm interface
  - Create InvitationTokenResponse interface
  - Create AttorneyRegistrationData interface
  - Create MatterRequest interface
  - Export all new types
  - _Requirements: All_



- [x] 3. Service Layer - Attorney Service

  - Implement token generation method
  - Implement token verification method
  - Implement registration via invitation method
  - Add error handling and validation
  - _Requirements: 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_


- [x] 3.1 Implement generateInvitationToken method


  - Generate cryptographically secure token (use crypto.randomUUID())
  - Calculate expiration date (7 days from now)
  - Update firm record with token and expiration
  - Construct invitation link
  - Return InvitationTokenResponse
  - Add error handling with toast notifications
  - _Requirements: 1.3, 1.4, 1.5, 5.1, 5.2_



- [ ] 3.2 Implement verifyInvitationToken method
  - Query firm by firm_id and token
  - Check token exists and matches
  - Check token has not expired
  - Check token has not been used
  - Return firm data if valid
  - Throw descriptive errors for each failure case


  - _Requirements: 2.2, 2.3, 2.4, 5.3, 5.4_


- [ ] 3.3 Implement registerViaInvitation method
  - Verify token again (security double-check)
  - Create Supabase auth user with signUp
  - Include user metadata (attorney_name, phone_number, firm_id, user_type)
  - Update firm record (attorney details, token_used_at, onboarded_at, status)


  - Handle duplicate email errors
  - Handle weak password errors
  - Auto-login user after registration
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 5.5, 5.6, 5.7_

- [x] 4. Service Layer - Matter API Service

  - Implement createMatterRequest method
  - Link matter to firm and advocate
  - Set status to 'new_request'
  - Handle document uploads (optional)
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 4.1 Implement createMatterRequest method




  - Get authenticated user from Supabase
  - Fetch firm to get advocate_id
  - Create matter with status 'new_request'
  - Link to firm_id and advocate_id
  - Pre-fill client info from user metadata
  - Return created matter
  - Add toast notification on success
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_



- [ ]* 4.2 Add document upload support (optional)
  - Check if documents array provided
  - Upload files to Supabase storage
  - Link uploaded files to matter

  - Handle upload errors gracefully
  - _Requirements: 3.4_

- [x] 5. InviteAttorneyModal Component

  - Create modal component
  - Generate token on mount

  - Display invitation link
  - Implement copy-to-clipboard functionality
  - Show expiration info
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 5.1 Create InviteAttorneyModal.tsx

  - Create component file in `src/components/firms/`
  - Define InviteAttorneyModalProps interface
  - Set up state (invitationLink, loading, copied)
  - Reuse Modal component from ui library
  - _Requirements: 1.1, 1.2_

- [x] 5.2 Implement token generation on mount


  - Use useEffect to call generateInvitationToken when modal opens
  - Handle loading state
  - Handle errors with toast notifications
  - Store invitation link in state
  - _Requirements: 1.3, 1.4, 1.5_


- [x] 5.3 Implement copy-to-clipboard
  - Add "Copy Link" button
  - Use navigator.clipboard.writeText()
  - Show visual feedback (toast + button state change)
  - Reset copied state after 3 seconds
  - _Requirements: 1.6_


- [x] 5.4 Display invitation details
  - Show firm name
  - Show invitation link in copyable text field
  - Show expiration info ("Expires in 7 days")
  - Show instructions for sending link
  - _Requirements: 1.5_

- [x] 6. FirmCard Component Updates

  - Add "Invite Attorney" button
  - Add state for InviteAttorneyModal
  - Wire button to open modal
  - Render modal conditionally
  - _Requirements: 1.1_

- [x] 6.1 Update FirmCard.tsx


  - Open `src/components/firms/FirmCard.tsx`
  - Add state: `const [showInviteModal, setShowInviteModal] = useState(false)`
  - Add "Invite Attorney" button to card actions
  - Wire button: `onClick={() => setShowInviteModal(true)}`
  - Render InviteAttorneyModal with isOpen={showInviteModal}
  - Pass firm data to modal
  - _Requirements: 1.1_

- [x] 7. AttorneyRegisterPage Component
  - Create public registration page
  - Extract and verify token from URL
  - Display firm welcome message
  - Implement registration form
  - Handle form submission
  - Redirect to matter request page on success
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [x] 7.1 Create AttorneyRegisterPage.tsx


  - Create file in `src/pages/attorney/` (create directory if needed)
  - Set up component structure
  - Define state (firmData, loading, error, formData)
  - Use useSearchParams to extract firm_id and token from URL
  - _Requirements: 2.1, 2.2_


- [x] 7.2 Implement token verification on mount
  - Use useEffect to verify token when component mounts
  - Call attorneyService.verifyInvitationToken(firm_id, token)
  - On success: store firm data and show form
  - On error: display error message with retry option
  - Handle expired, used, and invalid token cases
  - _Requirements: 2.2, 2.3, 2.4_


- [x] 7.3 Implement registration form
  - Create form with fields: attorney_name, phone_number, email, password, confirmPassword
  - Pre-fill attorney_name and email from firm data if available
  - Add form validation (required fields, email format, password strength)
  - Add password confirmation validation
  - Display validation errors inline
  - Use FormInput components from ui library

  - _Requirements: 2.5, 2.6_

- [x] 7.4 Implement form submission
  - Handle form submit event
  - Validate all fields
  - Call attorneyService.registerViaInvitation(formData)
  - Show loading state during submission
  - On success: redirect to `/submit-matter-request`

  - On error: display error message (duplicate email, weak password, etc.)
  - _Requirements: 2.7, 2.8, 2.9_

- [x] 7.5 Add welcome message and UI polish
  - Display "Welcome, [Firm Name]!" heading
  - Show firm logo if available
  - Add progress indicator (Step 1 of 2: Register)
  - Make form mobile-responsive
  - Add accessibility attributes (ARIA labels)
  - _Requirements: 2.5_

- [x] 8. SubmitMatterRequestPage Component

  - Create matter request submission page
  - Get firm_id from user session
  - Implement matter request form
  - Handle form submission
  - Show success confirmation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 8.1 Create SubmitMatterRequestPage.tsx



  - Create file in `src/pages/attorney/`
  - Set up component structure
  - Define state (formData, submitting, submitted, matterReference)
  - Get authenticated user and firm_id from session
  - _Requirements: 3.1, 3.2_


- [ ] 8.2 Implement matter request form
  - Create form with fields: title, description, matter_type, urgency_level
  - Add matter_type dropdown (reuse options from existing matter forms)
  - Add urgency_level dropdown (low, standard, high)
  - Add description textarea with character count
  - Use FormInput components from ui library
  - _Requirements: 3.3, 3.4_


- [ ] 8.3 Implement form submission
  - Handle form submit event
  - Validate all required fields
  - Call matterApiService.createMatterRequest({ ...formData, firm_id })
  - Show loading state during submission
  - On success: show confirmation with matter reference number
  - On error: display error message

  - _Requirements: 3.5, 3.6, 3.7_

- [ ] 8.4 Add success confirmation UI
  - Display success message with checkmark icon
  - Show matter reference number
  - Provide "Submit Another Request" button
  - Provide "View My Requests" link (future feature)
  - Add progress indicator (Step 2 of 2: Complete)
  - _Requirements: 3.8_

- [ ]* 8.5 Add document upload field (optional)
  - Add file input for document uploads
  - Support multiple files
  - Show file preview/list
  - Validate file types and sizes
  - Wire to document upload in service
  - _Requirements: 3.4_

- [x] 9. Routing Updates


  - Add public route for /register-firm
  - Add protected route for /submit-matter-request
  - Ensure proper authentication checks
  - _Requirements: 2.1, 3.1_

- [x] 9.1 Update AppRouter.tsx


  - Open `src/AppRouter.tsx`
  - Add public route: `<Route path="/register-firm" element={<AttorneyRegisterPage />} />`
  - Add protected route: `<Route path="/submit-matter-request" element={<ProtectedRoute><SubmitMatterRequestPage /></ProtectedRoute>} />`
  - Import new page components
  - _Requirements: 2.1, 3.1_

- [x] 10. MattersPage Updates (Optional)


  - Add filter for "New Requests" status
  - Add visual indicator for new request matters
  - Add accept/reject actions (future enhancement)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 10.1 Add new request filter to MattersPage


  - Open `src/pages/MattersPage.tsx`
  - Add "New Requests" tab or filter option
  - Filter matters where status === 'new_request'
  - Display count of new requests
  - _Requirements: 4.1, 4.2_

- [x] 10.2 Add visual indicator for new requests

  - Add badge or highlight for matters with 'new_request' status
  - Show firm name prominently
  - Display submission date
  - _Requirements: 4.3_

- [ ]* 10.3 Add accept/reject actions (optional)
  - Add "Accept" and "Reject" buttons to matter card
  - Implement accept handler (change status to 'active')
  - Implement reject handler (change status to 'rejected')
  - Add confirmation dialog for reject action
  - _Requirements: 4.4, 4.5_

- [ ] 11. Testing and Validation
  - Test complete invitation flow end-to-end
  - Test error scenarios
  - Test security (expired tokens, used tokens)
  - Test mobile responsiveness
  - _Requirements: All_

- [ ] 11.1 Test invitation generation
  - Generate invitation from FirmsPage
  - Verify token is stored in database
  - Verify expiration date is set correctly
  - Verify link format is correct
  - Test copy-to-clipboard functionality
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 11.2 Test registration flow
  - Click invitation link
  - Verify firm name displays correctly
  - Fill and submit registration form
  - Verify user account is created
  - Verify firm is marked as onboarded
  - Verify redirect to matter request page
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 11.3 Test matter request submission
  - Fill and submit matter request form
  - Verify matter is created with correct status
  - Verify matter is linked to firm and advocate
  - Verify success confirmation displays
  - Verify matter appears on advocate's MattersPage
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 11.4 Test error scenarios
  - Test expired token handling
  - Test used token handling
  - Test invalid token handling
  - Test duplicate email registration
  - Test weak password validation
  - Test network error recovery
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 11.5 Test mobile responsiveness
  - Test all pages on mobile viewport
  - Verify forms are usable on mobile
  - Verify buttons are touch-friendly
  - Test copy-to-clipboard on mobile
  - _Requirements: All_

- [ ] 12. Documentation
  - Update README with invitation workflow
  - Document new API methods
  - Add user guide for attorneys
  - Document security considerations
  - _Requirements: All_

- [ ] 12.1 Update README.md
  - Add section on Attorney Invitation Workflow
  - Document the invitation process
  - Add screenshots or diagrams
  - Document environment variables if any
  - _Requirements: All_

- [ ] 12.2 Create attorney user guide
  - Create `docs/ATTORNEY_INVITATION_GUIDE.md`
  - Document how to use invitation links
  - Document registration process
  - Document matter request submission
  - Add troubleshooting section
  - _Requirements: All_

---

## 🎯 Implementation Order

### Phase 1: Foundation (Tasks 1-4)
1. Database migrations
2. Type definitions
3. Service layer methods
4. Test service methods

### Phase 2: UI Components (Tasks 5-8)
1. InviteAttorneyModal
2. FirmCard updates
3. AttorneyRegisterPage
4. SubmitMatterRequestPage

### Phase 3: Integration (Tasks 9-10)
1. Routing updates
2. MattersPage updates
3. End-to-end testing

### Phase 4: Polish (Tasks 11-12)
1. Comprehensive testing
2. Documentation
3. Bug fixes

---

## 📊 Estimated Completion Time

- **Phase 1 (Foundation):** 2-3 hours
- **Phase 2 (UI Components):** 3-4 hours
- **Phase 3 (Integration):** 1-2 hours
- **Phase 4 (Polish):** 1-2 hours

**Total:** 7-11 hours

---

## 🔑 Key Success Criteria

✅ Advocate can generate invitation link from FirmsPage  
✅ Attorney can register using invitation link  
✅ Attorney can submit matter request after registration  
✅ Matter appears on advocate's MattersPage with correct linkage  
✅ Expired/used tokens are properly rejected  
✅ All forms have proper validation  
✅ Mobile-responsive design  
✅ Comprehensive error handling  

