# Testing Strategy

## Overview
This document outlines the comprehensive testing strategy for LexoHub, addressing the current 48% E2E test pass rate and minimal unit test coverage.

---

## 🎯 Testing Goals

### Short-term (3 months):
- Achieve 100% E2E test pass rate (62/62 tests)
- Achieve 70% unit test coverage for services
- Establish testing standards and policies

### Long-term (6 months):
- Achieve 80% overall code coverage
- Implement automated visual regression testing
- Establish performance testing baseline

---

## 🧪 Testing Pyramid

```
        /\
       /  \
      / E2E \          10% - Full user workflows
     /--------\
    /          \
   / Integration \     20% - Component interactions
  /--------------\
 /                \
/   Unit Tests     \   70% - Business logic, utilities
--------------------
```

---

## 📝 Test Coverage Requirements

### Unit Tests (70% of test suite)

**Target Coverage**: 80% for services, 70% for utilities

**Priority Files for Unit Testing**:

#### Services (23 files):
1. **src/services/api/matter-api.service.ts** (478 lines)
   - Test CRUD operations
   - Test WIP calculations
   - Test state transitions
   - Test error handling

2. **src/services/api/engagement-agreement.service.ts** (347 lines)
   - Test agreement creation
   - Test signature workflows
   - Test scope amendments
   - Test approval processes

3. **src/services/api/billing-readiness.service.ts** (358 lines)
   - Test readiness checks
   - Test validation rules
   - Test approval workflows

4. **src/services/api/credit-note.service.ts** (335 lines)
   - Test credit note generation
   - Test calculations
   - Test invoice adjustments

5. **src/services/invoice-pdf.service.ts** (621 lines)
   - Test PDF generation
   - Test template application
   - Test data formatting

6. **src/services/aws-email.service.ts** (610 lines)
   - Test email sending
   - Test template rendering
   - Test error handling

7. **src/services/aws-document-processing.service.ts** (442 lines)
   - Test document analysis
   - Test data extraction
   - Test error handling

#### Utilities (10 files):
- **src/utils/PricingCalculator.ts** - Pricing calculations
- **src/utils/validation.ts** - Form validation
- **src/utils/error-handling.utils.ts** - Error handling
- **src/utils/export.utils.ts** - Data export
- **src/utils/pdf-template-helper.ts** - PDF helpers

**Unit Test Template**:
```typescript
// src/services/api/__tests__/matter-api.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { matterApiService } from '../matter-api.service';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('MatterApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new matter', async () => {
      // Arrange
      const mockMatter = {
        title: 'Test Matter',
        attorney_id: 'test-attorney-id',
        // ... other fields
      };

      const mockResponse = {
        data: { id: 'test-id', ...mockMatter },
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue(mockResponse)
          })
        })
      } as any);

      // Act
      const result = await matterApiService.create(mockMatter);

      // Assert
      expect(result).toEqual(mockResponse.data);
      expect(supabase.from).toHaveBeenCalledWith('matters');
    });

    it('should throw error when creation fails', async () => {
      // Arrange
      const mockError = { message: 'Database error' };
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      } as any);

      // Act & Assert
      await expect(
        matterApiService.create({})
      ).rejects.toThrow('Database error');
    });
  });

  describe('calculateWIP', () => {
    it('should calculate WIP correctly', async () => {
      // Test implementation
    });

    it('should handle empty time entries', async () => {
      // Test implementation
    });
  });

  // ... more tests
});
```

---

### Integration Tests (20% of test suite)

**Target**: Test component interactions and data flow

**Priority Areas**:
1. Pro Forma → Matter conversion
2. Matter → Invoice generation
3. Payment processing workflow
4. Document upload and processing
5. PDF generation pipeline

**Integration Test Template**:
```typescript
// src/components/matters/__tests__/MatterCreation.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatterCreationModal } from '../MatterCreationModal';
import { matterApiService } from '@/services/api/matter-api.service';

vi.mock('@/services/api/matter-api.service');

describe('Matter Creation Integration', () => {
  it('should create matter from pro forma', async () => {
    // Arrange
    const mockProForma = {
      id: 'pf-123',
      attorney_name: 'John Doe',
      // ... other fields
    };

    render(
      <MatterCreationModal
        proForma={mockProForma}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    // Act
    const titleInput = screen.getByLabelText('Matter Title');
    await userEvent.type(titleInput, 'Test Matter');

    const submitButton = screen.getByRole('button', { name: 'Create Matter' });
    await userEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(matterApiService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Matter',
          source_proforma_id: 'pf-123'
        })
      );
    });
  });
});
```

---

### E2E Tests (10% of test suite)

**Current Status**: 30/62 passing (48%)  
**Target**: 62/62 passing (100%)

**Implementation Plan**:

#### Phase 1: Core Workflow Tests (Weeks 1-2)
**Priority**: Critical path testing

1. **tests/02-proforma.spec.ts** (4 skipped tests)
   - [ ] Test 2.3: View accepted Pro Forma ready for conversion
   - [ ] Test 2.4: View converted Pro Formas
   - [ ] Test 2.7: Client Response - Accept
   - [ ] Test 2.8: Client Response - Negotiate

2. **tests/03-engagement-agreements.spec.ts** (4 skipped tests)
   - [ ] Test 3.2: Create engagement agreement from Pro Forma
   - [ ] Test 3.3: Add client signature
   - [ ] Test 3.4: Add advocate signature
   - [ ] Test 3.5: View finalized agreement

3. **tests/04-matter-management.spec.ts** (2 skipped tests)
   - [ ] Test 4.7: Add time entry to matter
   - [ ] Test 4.8: Add expense to matter

#### Phase 2: Supporting Features (Weeks 3-4)
**Priority**: Secondary workflows

4. **tests/05-retainer-trust.spec.ts** (7 skipped tests)
   - [ ] Test 5.2: Create retainer agreement
   - [ ] Test 5.3: Deposit funds to trust account
   - [ ] Test 5.4: Drawdown funds from trust account
   - [ ] Test 5.5: View transaction history
   - [ ] Test 5.6: Low balance alert
   - [ ] Test 5.7: Refund remaining balance
   - [ ] Test 5.8: Reconciliation report

5. **tests/07-wip-scope-amendments.spec.ts** (5 skipped tests)
   - [ ] Test 7.2: WIP exceeds pro forma estimate
   - [ ] Test 7.3: Create scope amendment
   - [ ] Test 7.4: Submit amendment for approval
   - [ ] Test 7.5: Approve scope amendment
   - [ ] Test 7.6: Reject scope amendment

#### Phase 3: Advanced Features (Weeks 5-6)
**Priority**: Complex workflows

6. **tests/08-partner-approval-billing.spec.ts** (6 skipped tests)
   - [ ] Test 8.1: Submit matter for partner approval
   - [ ] Test 8.2: Partner reviews matter
   - [ ] Test 8.3: Partner approves billing
   - [ ] Test 8.4: Partner rejects billing
   - [ ] Test 8.5: Billing readiness checks
   - [ ] Test 8.6: Approval pipeline stats

7. **tests/09-invoice-generation.spec.ts** (2 skipped tests)
   - [ ] Test 9.5: Generate interim invoice
   - [ ] Test 9.6: Generate milestone invoice

8. **tests/10-payment-tracking.spec.ts** (2 skipped tests)
   - [ ] Test 10.4: Payment dispute workflow
   - [ ] Test 10.5: Credit note generation

**E2E Test Template**:
```typescript
// tests/02-proforma.spec.ts
import { test, expect } from '@playwright/test';
import { navigateToCoreFeature, clickButton, waitForToast } from './utils/test-helpers';

test.describe('Pro Forma System - Complete Workflow', () => {
  test('Test 2.3: View accepted Pro Forma ready for conversion', async ({ page }) => {
    // Navigate to Pro Forma page
    await navigateToCoreFeature(page, 'Pro Forma');
    
    // Filter by accepted status
    await page.click('button:has-text("Accepted")');
    
    // Wait for pro formas to load
    await page.waitForSelector('[data-testid="proforma-card"]');
    
    // Verify "Convert to Matter" button is visible
    const convertButton = page.locator('button:has-text("Convert to Matter")').first();
    await expect(convertButton).toBeVisible();
    
    // Click convert button
    await convertButton.click();
    
    // Verify conversion modal opens
    await expect(page.locator('[data-testid="convert-modal"]')).toBeVisible();
  });
});
```

---

## 🔧 Testing Tools & Setup

### Unit Testing: Vitest
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### E2E Testing: Playwright
```typescript
// playwright.config.ts (already configured)
// Key features:
// - Global authentication setup
// - Shared auth state across tests
// - Screenshot on failure
// - HTML reporter
```

### Test Commands:
```bash
# Unit tests
npm run test              # Run all unit tests
npm run test:ui           # Run with UI
npm run test:coverage     # Run with coverage report

# E2E tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run in headed mode
npm run test:e2e:debug    # Run in debug mode
npm run test:e2e:report   # Show test report
```

---

## 📊 Test Metrics & Monitoring

### Coverage Targets:
- **Overall**: 75% code coverage
- **Services**: 80% code coverage
- **Utilities**: 80% code coverage
- **Components**: 60% code coverage
- **E2E**: 100% test pass rate

### Quality Metrics:
- **Test execution time**: < 5 minutes for unit tests
- **E2E execution time**: < 15 minutes for full suite
- **Flaky test rate**: < 2%
- **Test maintenance time**: < 10% of development time

### Monitoring:
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/index.html

# Check coverage thresholds
npm run test:coverage -- --reporter=json-summary
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow:
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hooks:
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting
npm run lint

# Run unit tests for changed files
npm run test -- --changed

# Check TypeScript
npm run typecheck
```

---

## 📋 Testing Checklist

### For New Features:
- [ ] Write unit tests for business logic
- [ ] Write integration tests for component interactions
- [ ] Write E2E tests for user workflows
- [ ] Achieve 80% coverage for new code
- [ ] All tests pass locally
- [ ] All tests pass in CI/CD

### For Bug Fixes:
- [ ] Write test that reproduces the bug
- [ ] Fix the bug
- [ ] Verify test now passes
- [ ] Add regression test to prevent recurrence

### For Refactoring:
- [ ] Ensure all existing tests still pass
- [ ] Update tests if behavior changes
- [ ] Maintain or improve coverage
- [ ] No performance regression

---

## 🔄 Review Schedule

- **Daily**: Monitor test failures in CI/CD
- **Weekly**: Review test coverage reports
- **Monthly**: Review and update testing strategy
- **Quarterly**: Comprehensive testing audit

---

## 📚 Resources

### Documentation:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

### Internal:
- [TECHNICAL_DEBT.md](../TECHNICAL_DEBT.md)
- [COMPONENT_REFACTORING_PLAN.md](./COMPONENT_REFACTORING_PLAN.md)

---

**Last Updated**: 2025-01-12  
**Next Review**: 2025-02-12  
**Document Owner**: QA Team
