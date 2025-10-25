# Attorney Invitation Workflow - Spec Complete

**Status:** ✅ Ready for Implementation  
**Created:** January 25, 2025  
**Estimated Time:** 7-11 hours

---

## Overview

This spec transforms the firm management system into a complete attorney onboarding workflow. Advocates invite attorneys via secure links, attorneys self-register and submit matter requests, and the system automatically maintains all relationships.

### Key Features

- 🔗 **Secure Invitation Links** - Generate time-limited, single-use invitation tokens
- 👤 **Self-Service Registration** - Attorneys register themselves via invitation links
- 📝 **Matter Request Submission** - Attorneys submit matter requests directly
- 🔄 **Automatic Linkage** - System automatically links matters to firms and advocates
- 🔒 **Security First** - Token expiration, single-use, and rate limiting

---

## Workflow Summary

```
1. Advocate → FirmsPage → Click "Invite Attorney"
2. System → Generate secure token → Display invitation link
3. Advocate → Copy link → Send to attorney (email/SMS)
4. Attorney → Click link → AttorneyRegisterPage
5. System → Verify token → Display firm info
6. Attorney → Fill registration form → Submit
7. System → Create account → Mark firm as onboarded
8. Attorney → Redirect to SubmitMatterRequestPage
9. Attorney → Fill matter request form → Submit
10. System → Create matter with status "new_request"
11. Advocate → See new matter on MattersPage
```

---

## Files Structure

```
.kiro/specs/attorney-invitation-workflow/
├── README.md (this file)
├── requirements.md (6 requirements with acceptance criteria)
├── design.md (complete architecture and design)
└── tasks.md (12 tasks, 35 sub-tasks)
```

---

## Implementation Phases

### Phase 1: Foundation (2-3 hours)
- Database migrations (invitation tokens)
- Type definitions
- Service layer methods (token generation, verification, registration)

### Phase 2: UI Components (3-4 hours)
- InviteAttorneyModal
- FirmCard updates
- AttorneyRegisterPage
- SubmitMatterRequestPage

### Phase 3: Integration (1-2 hours)
- Routing updates
- MattersPage updates
- End-to-end testing

### Phase 4: Polish (1-2 hours)
- Comprehensive testing
- Documentation
- Bug fixes

---

## Key Components

### New Components
1. **InviteAttorneyModal** - Generate and display invitation links
2. **AttorneyRegisterPage** - Public registration page for attorneys
3. **SubmitMatterRequestPage** - Matter request submission form

### Updated Components
1. **FirmCard** - Add "Invite Attorney" button
2. **MattersPage** - Display new request matters (optional)

### New Service Methods
1. **generateInvitationToken()** - Create secure invitation token
2. **verifyInvitationToken()** - Validate token and check expiration
3. **registerViaInvitation()** - Register attorney via invitation
4. **createMatterRequest()** - Create matter from attorney request

---

## Database Changes

### Firms Table
```sql
ALTER TABLE firms
ADD COLUMN invitation_token TEXT,
ADD COLUMN invitation_token_expires_at TIMESTAMPTZ,
ADD COLUMN invitation_token_used_at TIMESTAMPTZ,
ADD COLUMN onboarded_at TIMESTAMPTZ;
```

### Matter Status
```sql
ALTER TYPE matter_status ADD VALUE 'new_request';
```

---

## Security Features

✅ Cryptographically secure tokens (72+ characters)  
✅ Time-limited expiration (7 days default)  
✅ Single-use tokens  
✅ Rate limiting on generation and verification  
✅ HTTPS required  
✅ Input validation and sanitization  

---

## Success Criteria

- [ ] Advocate can generate invitation link from FirmsPage
- [ ] Attorney can register using invitation link
- [ ] Attorney can submit matter request after registration
- [ ] Matter appears on advocate's MattersPage with correct linkage
- [ ] Expired/used tokens are properly rejected
- [ ] All forms have proper validation
- [ ] Mobile-responsive design
- [ ] Comprehensive error handling

---

## Next Steps

To begin implementation:

1. **Review the spec files:**
   - Read `requirements.md` for detailed acceptance criteria
   - Read `design.md` for architecture and component details
   - Read `tasks.md` for step-by-step implementation plan

2. **Start with Phase 1 (Foundation):**
   - Open `tasks.md` in Kiro
   - Click "Start task" next to Task 1.1
   - Follow the implementation plan

3. **Test as you go:**
   - Test each component after implementation
   - Use the testing checklist in Task 11

---

## Related Documentation

- **Pipeline Refactoring Spec:** `.kiro/specs/pipeline-refactoring/`
- **Firms Management:** `src/pages/FirmsPage.tsx`
- **Attorney Service:** `src/services/api/attorney.service.ts`
- **Matter API Service:** `src/services/api/matter-api.service.ts`

---

## Notes

- This spec integrates seamlessly with the completed pipeline refactoring
- Reuses existing UI components (Modal, FormInput, Button, etc.)
- Follows established service patterns
- Optional features marked with "*" in tasks.md
- Estimated 7-11 hours for complete implementation

---

**Ready to implement!** Open `tasks.md` and start with Task 1.1.

