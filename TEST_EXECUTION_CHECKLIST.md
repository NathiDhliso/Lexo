# Test Execution Checklist

Use this checklist to systematically test all features of LexoHub v2.0.

## Pre-Testing Setup

- [ ] Development server running (`npm run dev`)
- [ ] Database migrations applied
- [ ] Environment variables configured (`.env.test`)
- [ ] Playwright installed (`npx playwright install`)
- [ ] Test data cleared (if needed)

---

## 1. Authentication & User Management

**Test File**: `tests/01-authentication.spec.ts`

- [ ] Test 1.1: Advocate Registration
- [ ] Test 1.2: Advocate Login
- [ ] Test 1.3: Profile Management
- [ ] Test 1.4: Password Reset Request
- [ ] Test 1.5: Invalid Login Credentials

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 2. Pro Forma System

**Test File**: `tests/02-proforma.spec.ts`

- [ ] Test 2.1: Create Pro Forma Request
- [ ] Test 2.2: Generate Pro Forma PDF
- [ ] Test 2.3: Send Pro Forma to Client
- [ ] Test 2.4: Client Response - Accept
- [ ] Test 2.5: Client Response - Negotiate
- [ ] Test 2.6: Client Response - Reject
- [ ] Test 2.7: Edit Draft Pro Forma
- [ ] Test 2.8: Delete Draft Pro Forma

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 3. Engagement Agreements

**Test File**: `tests/03-engagement-agreements.spec.ts`

- [ ] Test 3.1: Create Engagement Agreement from Pro Forma
- [ ] Test 3.2: Send Engagement Agreement to Client
- [ ] Test 3.3: Sign Engagement Agreement
- [ ] Test 3.4: Convert Engagement Agreement to Matter
- [ ] Test 3.5: View Engagement Agreement PDF

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 4. Matter Management

**Test File**: `tests/04-matter-management.spec.ts`

- [ ] Test 4.1: Create Matter (Standard Workflow)
- [ ] Test 4.2: Create Urgent Matter (Skip Pro Forma)
- [ ] Test 4.3: Update Matter State - Pause
- [ ] Test 4.4: Update Matter State - Resume
- [ ] Test 4.5: Update Matter State - On Hold
- [ ] Test 4.6: Update Matter State - Awaiting Court
- [ ] Test 4.7: Update Matter State - Completed
- [ ] Test 4.8: Update Matter State - Archived
- [ ] Test 4.9: Matter Workbench View
- [ ] Test 4.10: Search Matters
- [ ] Test 4.11: Filter Matters by State

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 5. Retainer & Trust Accounts

**Test File**: `tests/05-retainer-trust.spec.ts`

- [ ] Test 5.1: Create Retainer Agreement
- [ ] Test 5.2: Deposit Funds to Trust Account
- [ ] Test 5.3: Drawdown Funds from Trust Account
- [ ] Test 5.4: Low Balance Alert
- [ ] Test 5.5: Retainer Refund
- [ ] Test 5.6: View Trust Transaction History
- [ ] Test 5.7: Multiple Deposits
- [ ] Test 5.8: Insufficient Funds Validation

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 6. Time & Expense Tracking

**Test File**: `tests/06-time-expense-tracking.spec.ts`

- [ ] Test 6.1: Create Time Entry
- [ ] Test 6.2: Create Expense
- [ ] Test 6.3: Edit Time Entry
- [ ] Test 6.4: Delete Time Entry
- [ ] Test 6.5: Bulk Time Entry Creation
- [ ] Test 6.6: Filter Time Entries by Date
- [ ] Test 6.7: Export Time Entries
- [ ] Test 6.8: Upload Expense Receipt
- [ ] Test 6.9: View Unbilled Time and Expenses

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 7. WIP Accumulation & Scope Amendments

**Test File**: `tests/07-wip-scope-amendments.spec.ts`

- [ ] Test 7.1: Verify WIP Auto-Calculation
- [ ] Test 7.2: WIP Widget Display
- [ ] Test 8.1: Automatic Scope Amendment Creation
- [ ] Test 8.2: Manual Scope Amendment Creation
- [ ] Test 8.3: Approve Scope Amendment
- [ ] Test 8.4: Client Approval of Scope Amendment
- [ ] Test 8.5: Reject Scope Amendment
- [ ] Test 8.6: View Scope Amendment History

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 8. Partner Approval & Billing Readiness

**Test File**: `tests/08-partner-approval-billing.spec.ts`

- [ ] Test 9.1: Submit Matter for Partner Approval
- [ ] Test 9.2: Partner Approves Billing
- [ ] Test 9.3: Partner Rejects Billing
- [ ] Test 9.4: View Pending Approvals
- [ ] Test 9.5: Filter Pending Approvals by Date
- [ ] Test 10.1: Check Billing Readiness
- [ ] Test 10.2: Mark Matter Ready to Bill
- [ ] Test 10.3: View Billing Pipeline
- [ ] Test 10.4: Filter Billing Pipeline by Client
- [ ] Test 10.5: Sort Billing Pipeline by Amount

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 9. Invoice Generation

**Test File**: `tests/09-invoice-generation.spec.ts`

- [ ] Test 11.1: Generate Interim Invoice
- [ ] Test 11.2: Generate Milestone Invoice
- [ ] Test 11.3: Generate Final Invoice
- [ ] Test 11.4: Invoice PDF Generation
- [ ] Test 11.5: Send Invoice to Client
- [ ] Test 11.6: Invoice Sequencing
- [ ] Test 11.7: Edit Draft Invoice
- [ ] Test 11.8: Delete Draft Invoice
- [ ] Test 11.9: Preview Invoice Before Sending
- [ ] Test 11.10: Apply Discount to Invoice

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 10. Payment Tracking

**Test File**: `tests/10-payment-tracking.spec.ts`

- [ ] Test 12.1: Record Full Payment
- [ ] Test 12.2: Record Partial Payment
- [ ] Test 12.3: Multiple Partial Payments
- [ ] Test 12.4: Payment History View
- [ ] Test 12.5: Payment Method - Credit Card
- [ ] Test 12.6: Payment Method - Cash
- [ ] Test 12.7: Payment Method - Cheque
- [ ] Test 12.8: Edit Payment Record
- [ ] Test 12.9: Delete Payment Record
- [ ] Test 12.10: Overpayment Validation

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 11. Payment Disputes & Credit Notes

**Test File**: `tests/11-disputes-credit-notes.spec.ts`

- [ ] Test 13.1: Create Payment Dispute
- [ ] Test 13.2: Respond to Dispute
- [ ] Test 13.3: Resolve Dispute - Credit Note
- [ ] Test 13.4: Resolve Dispute - Settled
- [ ] Test 13.5: Escalate Dispute
- [ ] Test 14.1: Create Credit Note
- [ ] Test 14.2: Issue Credit Note
- [ ] Test 14.3: Apply Credit Note to Invoice
- [ ] Test 14.4: Cancel Credit Note
- [ ] Test 14.5: View Credit Note PDF
- [ ] Test 14.6: Credit Note Amount Validation
- [ ] Test 14.7: Multiple Credit Notes for Same Invoice

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 12. Attorney Portal

**Test File**: `tests/12-attorney-portal.spec.ts`

- [ ] Test 15.1: Attorney Registration
- [ ] Test 15.2: Attorney Login
- [ ] Test 15.3: Grant Matter Access to Attorney
- [ ] Test 15.4: Attorney Dashboard
- [ ] Test 15.5: Attorney Views Matters
- [ ] Test 15.6: Attorney Approves Pro Forma
- [ ] Test 15.7: Attorney Views Invoices
- [ ] Test 15.8: Attorney Makes Payment
- [ ] Test 15.9: Attorney Notification Center
- [ ] Test 15.10: Revoke Attorney Access
- [ ] Test 15.11: Attorney Profile Update
- [ ] Test 15.12: Attorney Download Invoice PDF
- [ ] Test 15.13: Attorney View Matter Details
- [ ] Test 15.14: Attorney Filter Overdue Invoices

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 13. Notifications & Audit Trail

**Test File**: `tests/13-notifications-audit.spec.ts`

- [ ] Test 16.1: Pro Forma Request Notification
- [ ] Test 16.2: Invoice Issued Notification
- [ ] Test 16.3: Payment Received Notification
- [ ] Test 16.4: Low Balance Notification
- [ ] Test 16.5: Overdue Invoice Notification
- [ ] Test 16.6: Notification Preferences
- [ ] Test 16.7: Mark Notification as Read
- [ ] Test 16.8: Filter Notifications by Type
- [ ] Test 17.1: Verify Audit Log Entries
- [ ] Test 17.2: View Audit Trail
- [ ] Test 17.3: Audit Log Immutability
- [ ] Test 17.4: Filter Audit Trail by Date
- [ ] Test 17.5: Search Audit Trail by User
- [ ] Test 17.6: View Audit Entry Details
- [ ] Test 17.7: Export Audit Trail

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 14. Reports & Analytics

**Test File**: `tests/14-reports-analytics.spec.ts`

- [ ] Test 18.1: WIP Report
- [ ] Test 18.2: Revenue Report
- [ ] Test 18.3: Matter Pipeline Report
- [ ] Test 18.4: Export WIP Report to CSV
- [ ] Test 18.5: Filter Revenue Report by Matter Type
- [ ] Test 18.6: Client Revenue Report
- [ ] Test 18.7: Time Entry Summary Report
- [ ] Test 18.8: Outstanding Invoices Report
- [ ] Test 18.9: Aging Report
- [ ] Test 18.10: Matter Profitability Report
- [ ] Test 18.11: Dashboard Analytics
- [ ] Test 18.12: Export Report to PDF
- [ ] Test 18.13: Custom Date Range Report

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## 15. End-to-End Workflows

**Test File**: `tests/15-e2e-workflows.spec.ts`

- [ ] E2E Test 1: Complete Standard Workflow
- [ ] E2E Test 2: Urgent Matter Workflow
- [ ] E2E Test 3: Dispute Resolution Workflow
- [ ] E2E Test 4: Scope Amendment Workflow
- [ ] E2E Test 5: Multi-Invoice Matter Workflow

**Status**: ⬜ Not Started | 🔄 In Progress | ✅ Passed | ❌ Failed

**Notes**:
```
_______________________________________________________
```

---

## Summary

### Overall Progress

- **Total Tests**: 150+
- **Passed**: ___
- **Failed**: ___
- **Skipped**: ___
- **Pass Rate**: ___%

### Critical Issues Found

1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

### Recommendations

1. _______________________________________________________
2. _______________________________________________________
3. _______________________________________________________

### Sign-off

- [ ] All critical tests passed
- [ ] All blockers resolved
- [ ] Ready for production

**Tested By**: _______________________

**Date**: _______________________

**Signature**: _______________________

---

## Quick Commands

Run all tests:
```bash
npm run test:e2e
```

Run specific category:
```bash
npx playwright test tests/01-authentication.spec.ts
```

View report:
```bash
npm run test:e2e:report
```
