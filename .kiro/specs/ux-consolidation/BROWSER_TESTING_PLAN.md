# Browser Testing Plan - MatterModal Consolidation

**Date:** 2025-01-27
**Component:** MatterModal (consolidated)
**Pages:** MattersPage, MatterWorkbenchPage

## Test Environment Setup

1. Start development server: `npm run dev`
2. Login as advocate user
3. Navigate to Matters page (`/matters`)

## Test Cases

### 1. Quick Add Mode (mode: 'quick-add')

**Trigger:** Click "New Matter" button on MattersPage

**Expected Behavior:**
- [ ] Modal opens with title "Quick Add Matter"
- [ ] Form displays simplified fields (client name, title, attorney, firm)
- [ ] All required fields are marked
- [ ] Form validation works correctly
- [ ] Submit button is disabled until form is valid
- [ ] Cancel button closes modal without saving
- [ ] Submit creates matter and navigates to workbench
- [ ] Success toast appears
- [ ] Matters list refreshes with new matter

**Test Data:**
```
Client Name: Test Client ABC
Matter Title: Quick Add Test Matter
Instructing Attorney: John Smith
Firm: [Select from dropdown]
```

---

### 2. Detail Mode (mode: 'detail')

**Trigger:** Click on a non-active matter card in MattersPage

**Expected Behavior:**
- [ ] Modal opens with title showing matter title
- [ ] Full matter details displayed in tabs
- [ ] All matter information is read-only
- [ ] Edit button is visible and functional
- [ ] Close button works
- [ ] Escape key closes modal
- [ ] Click outside modal closes it

**Test Tabs:**
- [ ] Overview tab shows matter summary
- [ ] Details tab shows full information
- [ ] History tab shows activity log

---

### 3. Edit Mode (mode: 'edit')

**Trigger 1:** Click "Edit" button from detail view
**Trigger 2:** Click edit icon on matter card

**Expected Behavior:**
- [ ] Modal opens with title "Edit Matter"
- [ ] Form pre-populated with existing matter data
- [ ] All fields are editable
- [ ] Form validation works
- [ ] Cancel button closes without saving
- [ ] Save button updates matter
- [ ] Success toast appears
- [ ] Modal closes after save
- [ ] Matters list refreshes with updated data

**Test Changes:**
```
Update Title: [Original] → [Original] (Updated)
Update Client Name: [Original] → [Original] (Modified)
Update Status: [Current] → [Different Status]
```

---

### 4. Accept Brief Mode (mode: 'accept-brief')

**Trigger:** Click "Accept Brief" on a new request card

**Expected Behavior:**
- [ ] Modal opens with title "Accept Brief"
- [ ] Shows matter summary
- [ ] Displays acceptance form
- [ ] Rate card selection available
- [ ] Terms and conditions checkbox
- [ ] Accept button disabled until terms accepted
- [ ] Cancel button closes modal
- [ ] Accept converts matter to active
- [ ] Success toast appears
- [ ] Matter moves from "New Requests" to "Active"
- [ ] Matters list refreshes

**Prerequisites:**
- Have at least one matter with status "new_request"

---

### 5. View Mode (mode: 'view')

**Trigger:** Programmatic (used by other components)

**Expected Behavior:**
- [ ] Modal opens with title "Matter Details"
- [ ] Read-only view of matter information
- [ ] No edit capabilities
- [ ] Close button works
- [ ] Escape key closes modal

**Note:** This mode is similar to 'detail' but simpler. Test if used anywhere.

---

### 6. Create Mode (mode: 'create')

**Trigger:** Not currently used in MattersPage (reserved for future)

**Expected Behavior:**
- [ ] Modal opens with title "Create New Matter"
- [ ] Full matter creation wizard
- [ ] Multi-step form if implemented
- [ ] All fields available
- [ ] Validation on each step
- [ ] Can navigate between steps
- [ ] Submit creates matter
- [ ] Success handling

**Note:** This mode may not be actively used yet. Check if implemented.

---

## Integration Tests

### Modal State Management

**Test:** Open and close modals in sequence
- [ ] Open quick-add → Close → Open detail → Close
- [ ] Open detail → Click edit → Save → Verify modal closes
- [ ] Open accept-brief → Cancel → Verify state cleared
- [ ] Open multiple modals rapidly (stress test)

### Navigation Flow

**Test:** Matter creation to workbench navigation
- [ ] Create matter via quick-add
- [ ] Verify navigation to `/matter-workbench/{matterId}`
- [ ] Verify matter data loaded correctly
- [ ] Back button returns to matters list

### Data Refresh

**Test:** List updates after modal operations
- [ ] Create matter → Verify appears in list
- [ ] Edit matter → Verify changes reflected
- [ ] Accept brief → Verify status change
- [ ] Archive matter → Verify removed from active

---

## Error Handling Tests

### Network Errors

**Test:** Simulate API failures
- [ ] Create matter with network error → Error toast shown
- [ ] Edit matter with network error → Error toast shown
- [ ] Accept brief with network error → Error toast shown
- [ ] Modal remains open on error
- [ ] User can retry operation

### Validation Errors

**Test:** Invalid form submissions
- [ ] Submit empty required fields → Validation errors shown
- [ ] Submit invalid email → Email validation error
- [ ] Submit invalid phone → Phone validation error
- [ ] Error messages are clear and helpful

### Edge Cases

**Test:** Unusual scenarios
- [ ] Open modal with invalid matterId → Error message shown
- [ ] Open modal with deleted matter → Graceful error
- [ ] Rapid clicking submit button → Prevents duplicate submissions
- [ ] Close modal during API call → Request cancelled

---

## Accessibility Tests

### Keyboard Navigation

- [ ] Tab key navigates through form fields
- [ ] Enter key submits form (when valid)
- [ ] Escape key closes modal
- [ ] Focus trapped within modal
- [ ] Focus returns to trigger element on close

### Screen Reader

- [ ] Modal title announced when opened
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Close button has proper aria-label

---

## Performance Tests

### Load Time

- [ ] Modal opens in < 100ms
- [ ] Form renders without lag
- [ ] Large matter lists don't slow modal

### Memory

- [ ] Modal properly unmounts on close
- [ ] No memory leaks after multiple open/close cycles
- [ ] Event listeners cleaned up

---

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Responsive Design Tests

### Desktop (1920x1080)
- [ ] Modal centered and properly sized
- [ ] All content visible without scrolling (where appropriate)
- [ ] Buttons properly aligned

### Laptop (1366x768)
- [ ] Modal fits within viewport
- [ ] Content scrollable if needed
- [ ] No horizontal scroll

### Tablet (768x1024)
- [ ] Modal adapts to smaller width
- [ ] Touch targets appropriately sized
- [ ] Form fields stack vertically

### Mobile (375x667)
- [ ] Modal takes appropriate space
- [ ] Form fields full width
- [ ] Buttons stack vertically
- [ ] Scrolling works smoothly

---

## Regression Tests

### Old Modal Behavior

Verify that all functionality from old modals still works:

- [ ] MatterDetailModal features preserved
- [ ] EditMatterModal features preserved
- [ ] QuickAddMatterModal features preserved
- [ ] AcceptBriefModal features preserved

### Integration Points

- [ ] NewRequestCard still triggers correct modal
- [ ] Matter cards still open correct views
- [ ] Navigation still works correctly
- [ ] Bulk actions still function

---

## Test Results Template

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Browser:** [Browser + Version]
**Environment:** [Dev/Staging/Prod]

### Quick Add Mode
- Status: ✅ Pass / ❌ Fail
- Issues: [List any issues]

### Detail Mode
- Status: ✅ Pass / ❌ Fail
- Issues: [List any issues]

### Edit Mode
- Status: ✅ Pass / ❌ Fail
- Issues: [List any issues]

### Accept Brief Mode
- Status: ✅ Pass / ❌ Fail
- Issues: [List any issues]

### Overall Assessment
- Critical Issues: [Count]
- Minor Issues: [Count]
- Recommendation: [Ship / Fix Issues / Major Rework]
```

---

## Known Issues

Document any known issues here:

1. [Issue description]
   - Severity: Critical / High / Medium / Low
   - Workaround: [If available]
   - Fix planned: [Yes/No]

---

## Sign-off

- [ ] All critical tests passed
- [ ] All accessibility tests passed
- [ ] All browsers tested
- [ ] Performance acceptable
- [ ] Ready for production

**Tested by:** _______________
**Date:** _______________
**Approved by:** _______________
**Date:** _______________
