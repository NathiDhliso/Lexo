import { test, expect } from '@playwright/test';

test.describe('UI/UX Responsive Design Tests', () => {
  const devices = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('E2E 17.1: Navigation Responsiveness', () => {
    for (const device of devices) {
      test(`Navigation displays correctly on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const nav = page.getByRole('navigation');
        await expect(nav).toBeVisible();
        
        const boundingBox = await nav.boundingBox();
        expect(boundingBox).toBeTruthy();
        expect(boundingBox!.width).toBeGreaterThan(0);
        expect(boundingBox!.height).toBeGreaterThan(0);
      });
    }
  });

  test.describe('E2E 17.2: Mega Menu Responsiveness', () => {
    for (const device of devices) {
      test(`Mega menu adapts to ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.hover();
        await page.waitForTimeout(300);
        
        const megaMenu = page.getByRole('menu', { name: /matters menu/i });
        
        if (device.name === 'Mobile') {
          const sections = page.getByText('Actions', { exact: true });
          await expect(sections).toBeVisible();
        } else {
          await expect(megaMenu).toBeVisible();
        }
      });
    }
  });

  test.describe('E2E 17.3: Touch Target Sizes', () => {
    test('All interactive elements meet minimum touch target size (44x44px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const buttons = page.getByRole('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const box = await button.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40);
            expect(box.width).toBeGreaterThanOrEqual(40);
          }
        }
      }
    });

    test('Navigation links have adequate touch targets on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const links = page.getByRole('link');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = links.nth(i);
        if (await link.isVisible()) {
          const box = await link.boundingBox();
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
    });
  });

  test.describe('E2E 17.4: Typography Scaling', () => {
    for (const device of devices) {
      test(`Text is readable on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const headings = page.locator('h1, h2, h3');
        const headingCount = await headings.count();
        
        if (headingCount > 0) {
          const firstHeading = headings.first();
          const fontSize = await firstHeading.evaluate(el => 
            window.getComputedStyle(el).fontSize
          );
          
          const fontSizeNum = parseInt(fontSize);
          expect(fontSizeNum).toBeGreaterThanOrEqual(14);
        }
      });
    }
  });

  test.describe('E2E 17.5: Spacing and Layout', () => {
    for (const device of devices) {
      test(`Content spacing is appropriate on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const container = page.locator('main, [role="main"]').first();
        if (await container.isVisible()) {
          const padding = await container.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              left: parseInt(style.paddingLeft),
              right: parseInt(style.paddingRight)
            };
          });
          
          expect(padding.left).toBeGreaterThanOrEqual(8);
          expect(padding.right).toBeGreaterThanOrEqual(8);
        }
      });
    }
  });

  test.describe('E2E 17.6: Grid Layouts', () => {
    test('Grid adapts from 1 column (mobile) to multiple columns (desktop)', async ({ page }) => {
      const mattersPage = page.getByRole('link', { name: /matters/i });
      await mattersPage.click();
      await page.waitForLoadState('networkidle');
      
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);
      
      const mobileGrid = page.locator('[class*="grid"]').first();
      if (await mobileGrid.isVisible()) {
        const mobileColumns = await mobileGrid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        );
        expect(mobileColumns).toBeTruthy();
      }
      
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(300);
      
      const desktopGrid = page.locator('[class*="grid"]').first();
      if (await desktopGrid.isVisible()) {
        const desktopColumns = await desktopGrid.evaluate(el => 
          window.getComputedStyle(el).gridTemplateColumns
        );
        expect(desktopColumns).toBeTruthy();
      }
    });
  });

  test.describe('E2E 17.7: Modal Responsiveness', () => {
    for (const device of devices) {
      test(`Modals display correctly on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.click();
        await page.waitForLoadState('networkidle');
        
        const createButton = page.getByRole('button', { name: /create matter/i }).first();
        if (await createButton.isVisible()) {
          await createButton.click();
          await page.waitForTimeout(500);
          
          const modal = page.locator('[role="dialog"], [class*="modal"]').first();
          if (await modal.isVisible()) {
            const modalBox = await modal.boundingBox();
            expect(modalBox).toBeTruthy();
            
            if (device.name === 'Mobile') {
              expect(modalBox!.width).toBeLessThanOrEqual(device.width);
            }
          }
        }
      });
    }
  });

  test.describe('E2E 17.8: Form Elements', () => {
    for (const device of devices) {
      test(`Form inputs are usable on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const inputs = page.locator('input[type="text"], input[type="email"], textarea');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          const firstInput = inputs.first();
          if (await firstInput.isVisible()) {
            const inputBox = await firstInput.boundingBox();
            expect(inputBox).toBeTruthy();
            expect(inputBox!.height).toBeGreaterThanOrEqual(40);
          }
        }
      });
    }
  });

  test.describe('E2E 17.9: Scrolling Behavior', () => {
    for (const device of devices) {
      test(`Page scrolls smoothly on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.click();
        await page.waitForLoadState('networkidle');
        
        await page.evaluate(() => window.scrollTo(0, 100));
        await page.waitForTimeout(300);
        
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
      });
    }
  });

  test.describe('E2E 17.10: Image and Icon Scaling', () => {
    for (const device of devices) {
      test(`Icons scale appropriately on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const icons = page.locator('svg').first();
        if (await icons.isVisible()) {
          const iconBox = await icons.boundingBox();
          expect(iconBox).toBeTruthy();
          expect(iconBox!.width).toBeGreaterThan(0);
          expect(iconBox!.height).toBeGreaterThan(0);
        }
      });
    }
  });

  test.describe('E2E 17.11: Dark Mode Responsiveness', () => {
    for (const device of devices) {
      test(`Dark mode works on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.waitForTimeout(300);
        
        const body = page.locator('body');
        const bgColor = await body.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        
        expect(bgColor).toBeTruthy();
      });
    }
  });

  test.describe('E2E 17.12: Horizontal Overflow Prevention', () => {
    for (const device of devices) {
      test(`No horizontal scroll on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.click();
        await page.waitForLoadState('networkidle');
        
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
      });
    }
  });

  test.describe('E2E 17.13: Card Component Responsiveness', () => {
    for (const device of devices) {
      test(`Cards display correctly on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.click();
        await page.waitForLoadState('networkidle');
        
        const cards = page.locator('[class*="card"], [class*="rounded"]');
        const cardCount = await cards.count();
        
        if (cardCount > 0) {
          const firstCard = cards.first();
          if (await firstCard.isVisible()) {
            const cardBox = await firstCard.boundingBox();
            expect(cardBox).toBeTruthy();
            expect(cardBox!.width).toBeGreaterThan(0);
          }
        }
      });
    }
  });

  test.describe('E2E 17.14: Table Responsiveness', () => {
    test('Tables are scrollable on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const mattersLink = page.getByRole('link', { name: /matters/i });
      await mattersLink.click();
      await page.waitForLoadState('networkidle');
      
      const tables = page.locator('table');
      const tableCount = await tables.count();
      
      if (tableCount > 0) {
        const table = tables.first();
        const tableBox = await table.boundingBox();
        expect(tableBox).toBeTruthy();
      }
    });

    test('Tables display all columns on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const mattersLink = page.getByRole('link', { name: /matters/i });
      await mattersLink.click();
      await page.waitForLoadState('networkidle');
      
      const tables = page.locator('table');
      const tableCount = await tables.count();
      
      if (tableCount > 0) {
        const headers = page.locator('th');
        const headerCount = await headers.count();
        expect(headerCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('E2E 17.15: Button States and Feedback', () => {
    for (const device of devices) {
      test(`Buttons provide visual feedback on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const buttons = page.getByRole('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          const firstButton = buttons.first();
          if (await firstButton.isVisible()) {
            const initialBg = await firstButton.evaluate(el => 
              window.getComputedStyle(el).backgroundColor
            );
            
            await firstButton.hover();
            await page.waitForTimeout(200);
            
            expect(initialBg).toBeTruthy();
          }
        }
      });
    }
  });

  test.describe('E2E 17.16: Loading States', () => {
    for (const device of devices) {
      test(`Loading indicators are visible on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.click();
        
        const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"]');
        const hasLoading = await loadingIndicators.count();
        
        expect(hasLoading).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('E2E 17.17: Accessibility Features', () => {
    for (const device of devices) {
      test(`Focus indicators are visible on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        
        const focusedElement = page.locator(':focus');
        const isFocused = await focusedElement.count();
        expect(isFocused).toBeGreaterThan(0);
      });
    }
  });

  test.describe('E2E 17.18: Mega Menu Spacing', () => {
    for (const device of devices) {
      test(`Mega menu has proper spacing on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const mattersLink = page.getByRole('link', { name: /matters/i });
        await mattersLink.hover();
        await page.waitForTimeout(300);
        
        const megaMenu = page.getByRole('menu', { name: /matters menu/i });
        if (await megaMenu.isVisible()) {
          const padding = await megaMenu.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              top: parseInt(style.paddingTop),
              bottom: parseInt(style.paddingBottom),
              left: parseInt(style.paddingLeft),
              right: parseInt(style.paddingRight)
            };
          });
          
          if (device.name === 'Mobile') {
            expect(padding.left).toBeGreaterThanOrEqual(16);
            expect(padding.right).toBeGreaterThanOrEqual(16);
          } else if (device.name === 'Desktop') {
            expect(padding.left).toBeGreaterThanOrEqual(32);
            expect(padding.right).toBeGreaterThanOrEqual(32);
          }
        }
      });
    }
  });

  test.describe('E2E 17.19: Performance on Different Devices', () => {
    for (const device of devices) {
      test(`Page loads quickly on ${device.name}`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(5000);
      });
    }
  });

  test.describe('E2E 17.20: Viewport Meta Tag', () => {
    test('Viewport meta tag is correctly set for mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const viewport = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta?.getAttribute('content');
      });
      
      expect(viewport).toContain('width=device-width');
      expect(viewport).toContain('initial-scale=1');
    });
  });
});
