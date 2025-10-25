# Phase 6 Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Run all Phase 6 tests
npm run test:phase6

# Run individual suites
npm run test:visual    # Visual regression
npm run test:a11y      # Accessibility
npm run test:perf      # Performance
npm run test:uat       # UAT scenarios

# Interactive mode
npx playwright test tests/20-accessibility.spec.ts --ui

# Debug mode
npx playwright test tests/19-visual-regression.spec.ts --debug

# View report
npm run test:e2e:report
```

## 📁 File Structure

```
tests/
├── utils/
│   ├── index.ts                      # All utilities exported
│   ├── visual-regression.utils.ts    # Screenshot & layout testing
│   ├── accessibility.utils.ts        # WCAG & a11y testing
│   └── performance.utils.ts          # Performance & Core Web Vitals
├── 19-visual-regression.spec.ts      # ~15 tests
├── 20-accessibility.spec.ts          # ~25 tests
├── 21-performance.spec.ts            # ~20 tests
├── 22-uat-scenarios.spec.ts          # ~20 tests
└── PHASE_6_TESTING_GUIDE.md          # Full guide

.kiro/specs/ui-ux-overhaul/
└── PHASE_6_COMPLETE.md               # Implementation details
```

## 🎯 What Each Test Suite Does

### Visual Regression (19)
✓ Screenshots across 6 breakpoints  
✓ Component hover/focus states  
✓ Modal dialogs at all sizes  
✓ Empty & error states  

### Accessibility (20)
✓ WCAG AA compliance (axe-core)  
✓ Keyboard navigation  
✓ Color blindness simulation  
✓ Touch targets (44x44px)  

### Performance (21)
✓ Page load < 2s  
✓ Core Web Vitals  
✓ 3G network simulation  
✓ Bundle size analysis  

### UAT (22)
✓ 6 user scenarios  
✓ Task timing  
✓ Mobile workflows  
✓ Error recovery  

## 🧪 Key Utilities

### Visual
```typescript
captureAtBreakpoint(page, 'mobile', 'page-name')
captureAcrossBreakpoints(page, 'name', ['mobile', 'tablet', 'desktop'])
captureHoverState(page, 'button', 'button-name')
```

### Accessibility
```typescript
assertNoA11yViolations(page, { wcagLevel: 'AA' })
verifyFocusIndicator(page, 'button')
verifyTouchTargets(page, 44)
```

### Performance
```typescript
assertPerformanceBudget(page, { lcp: 2500, fcp: 1800 })
setNetworkCondition(page, '3g')
measurePageLoadMetrics(page)
```

## 📊 Success Criteria

| Metric | Target | Test |
|--------|--------|------|
| LCP | < 2.5s | Performance |
| FCP | < 1.8s | Performance |
| TTFB | < 600ms | Performance |
| Bundle | < 2MB | Performance |
| WCAG | AA | Accessibility |
| Touch | ≥ 44px | Accessibility |
| Page Load | < 2s | UAT |

## 🎨 Breakpoints

| Name | Width | Height | Use Case |
|------|-------|--------|----------|
| mobile | 375px | 667px | iPhone SE |
| mobileL | 425px | 812px | iPhone Pro |
| tablet | 768px | 1024px | iPad |
| desktop | 1024px | 768px | Small laptop |
| desktopL | 1440px | 900px | Desktop |
| desktopXL | 1920px | 1080px | Large screen |

## 🔧 Common Patterns

### Import utilities
```typescript
import { 
  captureAtBreakpoint,
  assertNoA11yViolations,
  measurePageLoadMetrics 
} from './utils';
```

### Test structure
```typescript
test('Description with success criteria', async ({ page }) => {
  await page.goto('/page');
  await page.waitForLoadState('networkidle');
  
  // Your test code
  
  expect(result).toBe(expected);
});
```

### Capture screenshots
```typescript
await captureAcrossBreakpoints(
  page, 
  'component-name', 
  ['mobile', 'tablet', 'desktop'],
  { fullPage: true, animations: 'disabled' }
);
```

## 🐛 Troubleshooting

**Screenshots don't match?**  
→ Check `test-results/` for diffs  
→ Update baselines if changes intentional

**Accessibility violations?**  
→ Check console for detailed info  
→ Visit helpUrl for remediation steps

**Performance failing?**  
→ Close background apps  
→ Adjust budgets if needed  
→ Check network conditions

**Timeouts?**  
→ Increase timeout in test  
→ Check network speed  
→ Verify dev server is running

## 📚 Documentation

- **Full Guide:** `tests/PHASE_6_TESTING_GUIDE.md`
- **Implementation:** `.kiro/specs/ui-ux-overhaul/PHASE_6_COMPLETE.md`
- **Summary:** `PHASE_6_SUMMARY.md`
- **This Card:** `PHASE_6_QUICK_REFERENCE.md`

## ✅ Verification

Quick check that Phase 6 is working:

```bash
# Should run without errors
npm run test:visual

# Should show test report
npm run test:e2e:report
```

## 🎯 Next Actions

1. **Manual UAT** - Conduct user sessions
2. **Analyze Results** - Calculate metrics
3. **Implement Fixes** - Address feedback
4. **CI/CD Setup** - Add to pipeline
5. **Monitor** - Track metrics over time

---

**Phase 6 Complete!** ✨ All tests ready to run. Use `npm run test:phase6` to validate everything.
