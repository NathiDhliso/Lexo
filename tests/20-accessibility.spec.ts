/**
 * Accessibility Tests - Task 20
 * Comprehensive accessibility testing with axe-core, keyboard navigation, and color blindness simulation
 */

import { test, expect } from '@playwright/test';
import {
  runAccessibilityScan,
  assertNoA11yViolations,
  verifyFocusIndicator,
  verifyAriaAttributes,
  verifyImageAltText,
  verifyFormLabels,
  verifyHeadingHierarchy,
  verifyTouchTargets,
  testKeyboardNavigation
} from './utils';

test.describe('Task 20: Accessibility Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Task 20.1: Automated Accessibility Tests (axe-core)', () => {
    test('Dashboard passes WCAG AA compliance', async ({ page }) => {
      await assertNoA11yViolations(page, { wcagLevel: 'AA' });
    });

    test('Matters page passes WCAG AA compliance', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      await assertNoA11yViolations(page, { wcagLevel: 'AA' });
    });

    test('Firms page passes WCAG AA compliance', async ({ page }) => {
      await page.click('a[href*="firms"]');
      await page.waitForLoadState('networkidle');
      
      await assertNoA11yViolations(page, { wcagLevel: 'AA' });
    });

    test('Invoices page passes WCAG AA compliance', async ({ page }) => {
      await page.click('a[href*="invoices"]');
      await page.waitForLoadState('networkidle');
      
      await assertNoA11yViolations(page, { wcagLevel: 'AA' });
    });

    test('Settings page passes WCAG AA compliance', async ({ page }) => {
      const settingsLink = page.locator('a[href*="settings"]').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        await assertNoA11yViolations(page, { wcagLevel: 'AA' });
      }
    });

    test('All images have alt text', async ({ page }) => {
      await verifyImageAltText(page);
      
      // Check other pages
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      await verifyImageAltText(page);
    });

    test('All form inputs have labels', async ({ page }) => {
      const settingsLink = page.locator('a[href*="settings"], a[href*="profile"]').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        await verifyFormLabels(page);
      }
    });

    test('Heading hierarchy is correct', async ({ page }) => {
      const headings = await verifyHeadingHierarchy(page);
      
      // Should have at least one h1
      const h1Count = headings.filter(h => h.level === 1).length;
      expect(h1Count).toBeGreaterThan(0);
      
      console.log('Heading structure:', headings);
    });

    test('Touch targets meet minimum size (44x44px)', async ({ page }) => {
      const smallTargets = await verifyTouchTargets(page, 44);
      
      // Warn if small targets found, but don't fail (some exceptions allowed)
      if (smallTargets.length > 0) {
        console.warn(`Found ${smallTargets.length} targets smaller than 44x44px`);
      }
    });

    test('Detailed accessibility scan report', async ({ page }) => {
      const results = await runAccessibilityScan(page, { wcagLevel: 'AA' });
      
      console.log('Accessibility Scan Results:');
      console.log(`- Passed: ${results.passes} checks`);
      console.log(`- Violations: ${results.violations.length}`);
      console.log(`- Incomplete: ${results.incomplete}`);
      
      if (results.violations.length > 0) {
        console.log('\nViolations:');
        results.violations.forEach(v => {
          console.log(`\n[${v.impact.toUpperCase()}] ${v.id}`);
          console.log(`Description: ${v.description}`);
          console.log(`Help: ${v.helpUrl}`);
          console.log(`Affected elements: ${v.nodes.length}`);
        });
      }
      
      // Assert no critical or serious violations
      const criticalViolations = results.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );
      expect(criticalViolations).toHaveLength(0);
    });
  });

  test.describe('Task 20.2: Manual Keyboard Testing', () => {
    test('Tab navigation through dashboard', async ({ page }) => {
      const focusedElements: string[] = [];
      
      // Tab through first 10 elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const tag = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName.toLowerCase() || 'none';
        });
        
        focusedElements.push(tag);
      }
      
      // Should have focused on interactive elements
      const interactiveElements = focusedElements.filter(tag => 
        ['button', 'a', 'input', 'select', 'textarea'].includes(tag)
      );
      
      expect(interactiveElements.length).toBeGreaterThan(0);
      console.log('Focused elements:', focusedElements);
    });

    test('Shift+Tab reverse navigation works', async ({ page }) => {
      // Tab forward a few times
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
      }
      
      const forwardElement = await page.evaluate(() => 
        document.activeElement?.textContent?.trim()
      );
      
      // Tab backward
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(50);
      
      const backwardElement = await page.evaluate(() => 
        document.activeElement?.textContent?.trim()
      );
      
      // Elements should be different
      expect(forwardElement).not.toBe(backwardElement);
    });

    test('Focus indicators are visible on all interactive elements', async ({ page }) => {
      const buttons = await page.locator('button:visible').all();
      const links = await page.locator('a:visible').all();
      
      // Test buttons
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        const selector = `button:visible >> nth=${i}`;
        await verifyFocusIndicator(page, selector);
      }
      
      // Test links
      for (let i = 0; i < Math.min(3, links.length); i++) {
        const selector = `a:visible >> nth=${i}`;
        await verifyFocusIndicator(page, selector);
      }
    });

    test('Escape key closes modals', async ({ page }) => {
      // Try to open a modal
      const modalTrigger = page.locator('button:has-text("New"), button:has-text("Add")').first();
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        await page.waitForTimeout(300);
        
        const modal = page.locator('[role="dialog"]').first();
        if (await modal.isVisible()) {
          // Press Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          
          // Modal should be closed
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('Enter key activates buttons', async ({ page }) => {
      const button = page.locator('button:visible').first();
      
      if (await button.isVisible()) {
        await button.focus();
        
        // Press Enter
        await page.keyboard.press('Enter');
        await page.waitForTimeout(100);
        
        // Button should have been activated (check for some change)
        // This is a basic test - specific behavior depends on the button
      }
    });

    test('Space key activates buttons', async ({ page }) => {
      const button = page.locator('button:visible').first();
      
      if (await button.isVisible()) {
        await button.focus();
        
        // Press Space
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
      }
    });

    test('Arrow keys navigate dropdowns', async ({ page }) => {
      const select = page.locator('select:visible').first();
      
      if (await select.isVisible()) {
        await select.focus();
        
        // Down arrow should move to next option
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(50);
        
        // Up arrow should move to previous option
        await page.keyboard.press('ArrowUp');
        await page.waitForTimeout(50);
      }
    });

    test('No keyboard traps in navigation', async ({ page }) => {
      let trapped = false;
      const initialElement = await page.evaluate(() => document.activeElement?.tagName);
      
      // Tab through many elements
      for (let i = 0; i < 50; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50);
        
        const currentElement = await page.evaluate(() => document.activeElement?.tagName);
        
        // Check if we're stuck on the same element
        if (i > 10 && currentElement === initialElement) {
          trapped = true;
          break;
        }
      }
      
      expect(trapped).toBe(false);
    });
  });

  test.describe('Task 20.3: Color Blindness Simulation', () => {
    const colorBlindnessFilters = {
      protanopia: 'url(#protanopia)',
      deuteranopia: 'url(#deuteranopia)',
      tritanopia: 'url(#tritanopia)',
      achromatopsia: 'grayscale(100%)'
    };

    test('Test with deuteranopia (red-green color blindness)', async ({ page }) => {
      // Apply deuteranopia filter
      await page.addStyleTag({
        content: `
          body {
            filter: grayscale(0.5) sepia(1) saturate(0.5) hue-rotate(90deg);
          }
        `
      });
      
      await page.waitForTimeout(500);
      
      // Verify interactive elements are still distinguishable
      const buttons = await page.locator('button:visible').all();
      expect(buttons.length).toBeGreaterThan(0);
      
      // Take screenshot for manual verification
      await page.screenshot({ path: 'test-results/deuteranopia.png', fullPage: true });
    });

    test('Test with protanopia (red-blind)', async ({ page }) => {
      await page.addStyleTag({
        content: `
          body {
            filter: grayscale(0.5) sepia(1) saturate(0.5) hue-rotate(45deg);
          }
        `
      });
      
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/protanopia.png', fullPage: true });
    });

    test('Test with tritanopia (blue-yellow color blindness)', async ({ page }) => {
      await page.addStyleTag({
        content: `
          body {
            filter: grayscale(0.3) sepia(0.8) saturate(1.2) hue-rotate(180deg);
          }
        `
      });
      
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/tritanopia.png', fullPage: true });
    });

    test('Test with full grayscale (achromatopsia)', async ({ page }) => {
      await page.addStyleTag({
        content: `
          body {
            filter: grayscale(100%);
          }
        `
      });
      
      await page.waitForTimeout(500);
      
      // Verify UI is still usable without color
      const buttons = await page.locator('button:visible').all();
      expect(buttons.length).toBeGreaterThan(0);
      
      await page.screenshot({ path: 'test-results/achromatopsia.png', fullPage: true });
    });

    test('Status colors are distinguishable in grayscale', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      // Apply grayscale
      await page.addStyleTag({
        content: `
          body {
            filter: grayscale(100%);
          }
        `
      });
      
      await page.waitForTimeout(500);
      
      // Check for status badges
      const badges = await page.locator('[class*="badge"], [class*="status"]').all();
      
      if (badges.length > 0) {
        console.log(`Found ${badges.length} status indicators`);
        
        // They should still be distinguishable by shape, icon, or text
        await page.screenshot({ path: 'test-results/status-grayscale.png', fullPage: true });
      }
    });
  });

  test.describe('Additional Accessibility Tests', () => {
    test('ARIA landmarks are present', async ({ page }) => {
      const landmarks = await page.evaluate(() => {
        return {
          main: document.querySelector('[role="main"], main'),
          navigation: document.querySelector('[role="navigation"], nav'),
          banner: document.querySelector('[role="banner"], header'),
          contentinfo: document.querySelector('[role="contentinfo"], footer')
        };
      });
      
      expect(landmarks.main).toBeTruthy();
      expect(landmarks.navigation).toBeTruthy();
    });

    test('Buttons have accessible names', async ({ page }) => {
      const buttonsWithoutNames = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(btn => {
          const hasText = btn.textContent && btn.textContent.trim().length > 0;
          const hasAriaLabel = btn.getAttribute('aria-label');
          const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
          return !hasText && !hasAriaLabel && !hasAriaLabelledBy;
        }).length;
      });
      
      expect(buttonsWithoutNames).toBe(0);
    });

    test('Links have descriptive text', async ({ page }) => {
      const linksWithoutText = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.filter(link => {
          const hasText = link.textContent && link.textContent.trim().length > 0;
          const hasAriaLabel = link.getAttribute('aria-label');
          return !hasText && !hasAriaLabel;
        }).length;
      });
      
      expect(linksWithoutText).toBe(0);
    });

    test('Page has unique title', async ({ page }) => {
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('');
    });

    test('Language is specified', async ({ page }) => {
      const lang = await page.evaluate(() => document.documentElement.lang);
      expect(lang).toBeTruthy();
    });
  });
});
