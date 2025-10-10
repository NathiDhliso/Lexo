# LexoHub Playwright E2E Tests

Comprehensive end-to-end testing suite for LexoHub v2.0 based on the COMPREHENSIVE_TESTING_GUIDE.md.

## Test Structure

```
tests/
├── fixtures/
│   └── auth.fixture.ts          # Authentication fixtures and helpers
├── utils/
│   └── test-helpers.ts          # Reusable test helper functions
├── 01-authentication.spec.ts    # Authentication & User Management tests
├── 02-proforma.spec.ts          # Pro Forma System tests
├── 03-engagement-agreements.spec.ts  # Engagement Agreement tests
├── 04-matter-management.spec.ts # Matter Management tests
├── 05-retainer-trust.spec.ts    # Retainer & Trust Account tests
├── 06-time-expense-tracking.spec.ts  # Time & Expense Tracking tests
├── 07-wip-scope-amendments.spec.ts   # WIP & Scope Amendment tests
├── 08-partner-approval-billing.spec.ts  # Partner Approval & Billing tests
├── 09-invoice-generation.spec.ts     # Invoice Generation tests
├── 10-payment-tracking.spec.ts       # Payment Tracking tests
├── 11-disputes-credit-notes.spec.ts  # Disputes & Credit Notes tests
├── 12-attorney-portal.spec.ts        # Attorney Portal tests
├── 13-notifications-audit.spec.ts    # Notifications & Audit Trail tests
├── 14-reports-analytics.spec.ts      # Reports & Analytics tests
└── 15-e2e-workflows.spec.ts          # End-to-End Workflow tests
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Set up environment variables:
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/01-authentication.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "Test 1.1: Advocate Registration"
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

### 1. Authentication & User Management (5 tests)
- Advocate registration
- Advocate login
- Profile management
- Password reset
- Invalid credentials handling

### 2. Pro Forma System (8 tests)
- Create pro forma request
- Generate PDF
- Send to client
- Client acceptance
- Client negotiation
- Client rejection
- Edit draft
- Delete draft

### 3. Engagement Agreements (5 tests)
- Create from pro forma
- Send to client
- Digital signature workflow
- Convert to matter
- View PDF

### 4. Matter Management (11 tests)
- Create standard matter
- Create urgent matter
- State transitions (pause, resume, hold, court, completed, archived)
- Workbench view
- Search and filter

### 5. Retainer & Trust Accounts (8 tests)
- Create retainer agreement
- Deposit funds
- Drawdown funds
- Low balance alerts
- Refunds
- Transaction history
- Multiple deposits
- Insufficient funds validation

### 6. Time & Expense Tracking (9 tests)
- Create time entry
- Create expense
- Edit time entry
- Delete time entry
- Bulk creation
- Filter by date
- Export to CSV
- Upload receipts
- View unbilled items

### 7. WIP & Scope Amendments (7 tests)
- WIP auto-calculation
- WIP widget display
- Automatic scope amendment creation
- Manual scope amendment
- Approve amendments
- Client approval
- Reject amendments

### 8. Partner Approval & Billing (10 tests)
- Submit for approval
- Partner approves
- Partner rejects
- View pending approvals
- Filter approvals
- Check billing readiness
- Mark ready to bill
- View billing pipeline
- Filter pipeline
- Sort by amount

### 9. Invoice Generation (10 tests)
- Generate interim invoice
- Generate milestone invoice
- Generate final invoice
- PDF generation
- Send to client
- Invoice sequencing
- Edit draft
- Delete draft
- Preview invoice
- Apply discount

### 10. Payment Tracking (10 tests)
- Record full payment
- Record partial payment
- Multiple partial payments
- Payment history
- Various payment methods (EFT, Credit Card, Cash, Cheque)
- Edit payment
- Delete payment
- Overpayment validation

### 11. Disputes & Credit Notes (13 tests)
- Create dispute
- Respond to dispute
- Resolve with credit note
- Resolve as settled
- Escalate dispute
- Create credit note
- Issue credit note
- Apply credit note
- Cancel credit note
- View PDF
- Amount validation
- Multiple credit notes

### 12. Attorney Portal (14 tests)
- Attorney registration
- Attorney login
- Grant matter access
- Dashboard view
- View matters
- Approve pro forma
- View invoices
- Make payment
- Notification center
- Revoke access
- Profile update
- Download PDF
- View matter details
- Filter overdue invoices

### 13. Notifications & Audit Trail (13 tests)
- Pro forma notifications
- Invoice notifications
- Payment notifications
- Low balance notifications
- Overdue notifications
- Notification preferences
- Mark as read
- Filter by type
- Audit log entries
- View audit trail
- Audit immutability
- Filter by date
- Export audit trail

### 14. Reports & Analytics (13 tests)
- WIP report
- Revenue report
- Matter pipeline
- Export to CSV
- Filter by matter type
- Client revenue report
- Time entry summary
- Outstanding invoices
- Aging report
- Matter profitability
- Dashboard analytics
- Export to PDF
- Custom date range

### 15. End-to-End Workflows (5 tests)
- Complete standard workflow (pro forma → payment)
- Urgent matter workflow
- Dispute resolution workflow
- Scope amendment workflow
- Multi-invoice matter workflow

## Total Test Count

**150+ individual test cases** covering all major features and workflows.

## Test Data

Tests use dynamically generated test data to avoid conflicts:
- Email addresses include timestamps
- Unique identifiers for all entities
- Automatic cleanup after tests

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Cleanup**: Tests clean up after themselves
3. **Fixtures**: Reusable authentication and setup fixtures
4. **Helpers**: Common actions abstracted into helper functions
5. **Assertions**: Clear, descriptive assertions
6. **Waiting**: Proper waiting for async operations
7. **Selectors**: Stable selectors using data attributes

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
- name: Run Playwright tests
  run: npm run test:e2e
```

## Debugging

1. Use `--debug` flag to step through tests
2. Use `--headed` to see browser actions
3. Use `--ui` for interactive debugging
4. Check screenshots in `test-results/` on failure
5. View traces in Playwright UI

## Contributing

When adding new tests:
1. Follow existing naming conventions
2. Use helper functions from `test-helpers.ts`
3. Add proper assertions and error messages
4. Update this README with new test descriptions
5. Ensure tests are isolated and can run independently

## Support

For issues or questions about tests, refer to:
- COMPREHENSIVE_TESTING_GUIDE.md
- Playwright documentation: https://playwright.dev
