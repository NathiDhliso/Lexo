/**
 * Visual Regression Tests - Task 19
 * Comprehensive visual regression testing across breakpoints and states
 */

import { test, expect } from '@playwright/test';
import { 
  BREAKPOINTS,
  captureAtBreakpoint,
  captureAcrossBreakpoints,
  captureHoverState,
  captureFocusState,
  captureModal,
  type Breakpoint
} from './utils';

test.describe('Task 19: Visual Regression Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Task 19.1: Setup Visual Regression Testing', () => {
    test('Baseline: Dashboard across breakpoints', async ({ page }) => {
      await captureAcrossBreakpoints(page, 'dashboard', ['mobile', 'tablet', 'desktop', 'desktopXL'], {
        fullPage: true,
        animations: 'disabled',
        mask: ['[data-dynamic-content]'] // Mask dynamic content like dates
      });
    });

    test('Baseline: Matters page across breakpoints', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      await captureAcrossBreakpoints(page, 'matters-page', ['mobile', 'tablet', 'desktop', 'desktopXL'], {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('Baseline: Firms page across breakpoints', async ({ page }) => {
      await page.click('a[href*="firms"]');
      await page.waitForLoadState('networkidle');
      
      await captureAcrossBreakpoints(page, 'firms-page', ['mobile', 'tablet', 'desktop', 'desktopXL'], {
        fullPage: true,
        animations: 'disabled'
      });
    });

    test('Baseline: Invoices page across breakpoints', async ({ page }) => {
      await page.click('a[href*="invoices"]');
      await page.waitForLoadState('networkidle');
      
      await captureAcrossBreakpoints(page, 'invoices-page', ['mobile', 'tablet', 'desktop', 'desktopXL'], {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });

  test.describe('Task 19.2: Test Components Across Breakpoints', () => {
    const breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop'];

    test('Button components at all breakpoints', async ({ page }) => {
      // Navigate to a page with buttons
      const buttons = page.locator('button').first();
      if (await buttons.isVisible()) {
        for (const bp of breakpoints) {
          await captureAtBreakpoint(page, bp, 'buttons-showcase', {
            animations: 'disabled'
          });
        }
      }
    });

    test('Card components at all breakpoints', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      const card = page.locator('[data-matter-id]').first();
      if (await card.isVisible()) {
        for (const bp of breakpoints) {
          const { width, height } = BREAKPOINTS[bp];
          await page.setViewportSize({ width, height });
          await page.waitForTimeout(300);
          
          await expect(card).toHaveScreenshot(`matter-card-${BREAKPOINTS[bp].name}.png`, {
            animations: 'disabled'
          });
        }
      }
    });

    test('Navigation menu at all breakpoints', async ({ page }) => {
      for (const bp of breakpoints) {
        await captureAtBreakpoint(page, bp, 'navigation', {
          animations: 'disabled'
        });
        
        // Test mobile menu if on mobile breakpoint
        if (bp === 'mobile') {
          const menuButton = page.locator('button[aria-label*="menu"]');
          if (await menuButton.isVisible()) {
            await menuButton.click();
            await page.waitForTimeout(300);
            await captureAtBreakpoint(page, bp, 'navigation-mobile-open', {
              animations: 'disabled'
            });
          }
        }
      }
    });

    test('Form inputs at all breakpoints', async ({ page }) => {
      // Try to navigate to settings or profile page with forms
      const settingsLink = page.locator('a[href*="settings"], a[href*="profile"]').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        for (const bp of breakpoints) {
          await captureAtBreakpoint(page, bp, 'form-inputs', {
            animations: 'disabled'
          });
        }
      }
    });

    test('Data tables/lists at all breakpoints', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      for (const bp of breakpoints) {
        await captureAtBreakpoint(page, bp, 'data-list', {
          animations: 'disabled'
        });
      }
    });
  });

  test.describe('Task 19.3: Verify Hover and Focus States', () => {
    test('Button hover states', async ({ page }) => {
      const buttons = await page.locator('button:visible').all();
      
      if (buttons.length > 0) {
        // Test first few buttons
        for (let i = 0; i < Math.min(3, buttons.length); i++) {
          await captureHoverState(page, `button:visible >> nth=${i}`, `button-${i}`, 'desktop');
        }
      }
    });

    test('Link hover states', async ({ page }) => {
      const links = await page.locator('a:visible').all();
      
      if (links.length > 0) {
        // Test navigation links
        for (let i = 0; i < Math.min(3, links.length); i++) {
          await captureHoverState(page, `a:visible >> nth=${i}`, `link-${i}`, 'desktop');
        }
      }
    });

    test('Button focus states', async ({ page }) => {
      const buttons = await page.locator('button:visible').all();
      
      if (buttons.length > 0) {
        for (let i = 0; i < Math.min(3, buttons.length); i++) {
          await captureFocusState(page, `button:visible >> nth=${i}`, `button-focus-${i}`, 'desktop');
        }
      }
    });

    test('Input focus states', async ({ page }) => {
      // Try to find a page with inputs
      const settingsLink = page.locator('a[href*="settings"], a[href*="profile"]').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        const inputs = await page.locator('input:visible, textarea:visible').all();
        if (inputs.length > 0) {
          for (let i = 0; i < Math.min(2, inputs.length); i++) {
            await captureFocusState(page, `input:visible >> nth=${i}`, `input-focus-${i}`, 'desktop');
          }
        }
      }
    });

    test('Card hover effects', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      const cards = await page.locator('[data-matter-id]').all();
      if (cards.length > 0) {
        await captureHoverState(page, '[data-matter-id] >> nth=0', 'matter-card', 'desktop');
      }
    });

    test('Dropdown hover and focus states', async ({ page }) => {
      const dropdowns = await page.locator('select:visible, [role="combobox"]:visible').all();
      
      if (dropdowns.length > 0) {
        await captureHoverState(page, 'select:visible >> nth=0', 'dropdown', 'desktop');
        await captureFocusState(page, 'select:visible >> nth=0', 'dropdown', 'desktop');
      }
    });

    test('Modal dialog states', async ({ page }) => {
      // Try to open a modal
      const modalTriggers = await page.locator('button:has-text("New"), button:has-text("Add"), button:has-text("Create")').all();
      
      if (modalTriggers.length > 0) {
        await modalTriggers[0].click();
        await page.waitForTimeout(500);
        
        const modal = page.locator('[role="dialog"], .modal').first();
        if (await modal.isVisible()) {
          await captureModal(page, '[role="dialog"], .modal', 'create-modal', ['mobile', 'tablet', 'desktop']);
          
          // Close modal
          const closeButton = page.locator('button[aria-label*="close"], button:has-text("Cancel")').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
      }
    });
  });

  test.describe('Visual Regression: Additional Components', () => {
    test('Empty states', async ({ page }) => {
      // Try to find empty states by filtering
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      // Look for filter or search that might show empty state
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('xyznonexistentmatter123');
        await page.waitForTimeout(500);
        
        await captureAcrossBreakpoints(page, 'empty-state', ['mobile', 'tablet', 'desktop'], {
          animations: 'disabled'
        });
      }
    });

    test('Loading states', async ({ page }) => {
      // Capture initial loading states quickly
      const promises = [
        page.goto('/matters'),
        page.screenshot({ path: 'loading-state.png' })
      ];
      
      await Promise.race(promises);
    });

    test('Error states', async ({ page }) => {
      // Test 404 page
      await page.goto('/nonexistent-page-404');
      await page.waitForTimeout(500);
      
      await captureAcrossBreakpoints(page, 'error-404', ['mobile', 'tablet', 'desktop'], {
        fullPage: true,
        animations: 'disabled'
      });
    });
  });
});
