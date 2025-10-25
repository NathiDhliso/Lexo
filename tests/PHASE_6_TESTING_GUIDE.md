# Phase 6 Testing Guide

## Quick Start

Run all Phase 6 tests:
```bash
npm run test:phase6
```

Or run individual test suites:
```bash
# Visual regression tests
npx playwright test tests/19-visual-regression.spec.ts

# Accessibility tests
npx playwright test tests/20-accessibility.spec.ts

# Performance tests
npx playwright test tests/21-performance.spec.ts

# UAT scenarios
npx playwright test tests/22-uat-scenarios.spec.ts
```

## Test Suite Overview

### 19-visual-regression.spec.ts (~15 tests)
Tests UI consistency across breakpoints and states:
- Dashboard, Matters, Firms, Invoices pages
- Components: buttons, cards, navigation, forms
- Hover and focus states
- Modal dialogs
- Empty and error states

### 20-accessibility.spec.ts (~25 tests)
Tests WCAG compliance and usability:
- Automated axe-core scans (WCAG AA)
- Keyboard navigation (Tab, Escape, Enter, Space, Arrows)
- Focus indicators and ARIA attributes
- Image alt text and form labels
- Color contrast and heading hierarchy
- Touch target sizes (44x44px)
- Color blindness simulation (4 types)

### 21-performance.spec.ts (~20 tests)
Tests performance and optimization:
- Page load times (< 2s target)
- Core Web Vitals (LCP, FCP, TTFB)
- Network throttling (3G, slow-3G)
- Bundle size analysis
- Long task monitoring
- Image optimization
- Lazy loading verification

### 22-uat-scenarios.spec.ts (~20 tests)
Tests real user workflows:
- Matter management workflow
- Invoice generation workflow
- Dashboard navigation
- Settings management
- Mobile responsive experience
- Error recovery

## Running Tests in Different Modes

### UI Mode (Interactive)
```bash
npx playwright test tests/20-accessibility.spec.ts --ui
```

### Debug Mode
```bash
npx playwright test tests/19-visual-regression.spec.ts --debug
```

### Headed Mode (See Browser)
```bash
npx playwright test --headed tests/21-performance.spec.ts
```

### Specific Test
```bash
npx playwright test -g "Dashboard passes WCAG AA compliance"
```

### Generate Report
```bash
npx playwright test tests/20-accessibility.spec.ts
npx playwright show-report
```

## Test Utilities

All utilities are exported from `tests/utils/index.ts`:

```typescript
import {
  // Visual Regression
  captureAtBreakpoint,
  captureAcrossBreakpoints,
  captureHoverState,
  
  // Accessibility
  runAccessibilityScan,
  assertNoA11yViolations,
  verifyFocusIndicator,
  
  // Performance
  measurePageLoadMetrics,
  assertPerformanceBudget,
  setNetworkCondition
} from './utils';
```

## Success Criteria

### Visual Regression
- ✅ Baseline screenshots captured for all pages
- ✅ All components tested across 3+ breakpoints
- ✅ Hover and focus states verified

### Accessibility
- ✅ No critical WCAG violations
- ✅ All interactive elements keyboard accessible
- ✅ Color contrast meets AA standards
- ✅ Touch targets ≥ 44x44px

### Performance
- ✅ LCP < 2.5s
- ✅ FCP < 1.8s
- ✅ Page loads < 2s on good connection
- ✅ Page loads < 10s on 3G

### UAT
- ✅ All workflows complete without errors
- ✅ Task completion times documented
- ✅ Mobile experience validated

## Troubleshooting

### Tests Failing Due to Timing
Increase timeouts in specific tests or globally in `playwright.config.ts`.

### Screenshots Don't Match
Review screenshot diffs in `test-results/`. Consider updating baselines if changes are intentional.

### Accessibility Violations
Check console output for detailed violation information including:
- Rule ID
- Impact level (critical/serious/moderate/minor)
- Affected elements
- Remediation suggestions
- Help URL

### Performance Tests Failing
Performance can vary by environment. Consider:
- Running on dedicated test machine
- Adjusting performance budgets
- Checking for background processes
- Validating network conditions

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run Phase 6 Tests
  run: |
    npx playwright test tests/19-visual-regression.spec.ts
    npx playwright test tests/20-accessibility.spec.ts
    npx playwright test tests/21-performance.spec.ts
    npx playwright test tests/22-uat-scenarios.spec.ts

- name: Upload Test Results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: phase-6-test-results
    path: |
      test-results/
      playwright-report/
```

## Next Steps

After Phase 6 tests pass:
1. Conduct manual UAT sessions (Task 22.2)
2. Analyze UAT results (Task 22.3)
3. Implement critical fixes (Task 22.4)
4. Set up continuous monitoring
5. Schedule regular accessibility audits

## Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
