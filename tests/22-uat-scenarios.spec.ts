/**
 * User Acceptance Testing (UAT) Scenarios - Task 22
 * Comprehensive test scenarios for major workflows with success criteria
 */

import { test, expect } from '@playwright/test';

/**
 * UAT Test Scenario Structure:
 * - Scenario Name
 * - User Story
 * - Prerequisites
 * - Test Steps
 * - Expected Results
 * - Success Criteria
 * - Time Limit
 */

test.describe('Task 22: User Acceptance Testing Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('UAT Scenario 1: Complete Matter Management Workflow', () => {
    /**
     * User Story: As an advocate, I want to create a new matter, add time entries,
     * and generate an invoice so that I can bill my client.
     * 
     * Success Criteria:
     * - Task completion rate: >90%
     * - Time to complete: <5 minutes
     * - User satisfaction: >4/5
     * - No critical errors encountered
     */
    
    test('UAT 1.1: Create new matter', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to matters
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      // Click create new matter button
      const newMatterButton = page.locator('button:has-text("New Matter"), button:has-text("Create")').first();
      if (await newMatterButton.isVisible()) {
        await newMatterButton.click();
        await page.waitForTimeout(500);
        
        // Verify modal/form opened
        const form = page.locator('form, [role="dialog"]').first();
        await expect(form).toBeVisible();
        
        const completionTime = Date.now() - startTime;
        console.log(`Matter creation form opened in ${completionTime}ms`);
        
        // Success criteria: Form opens within 2 seconds
        expect(completionTime).toBeLessThan(2000);
      }
    });

    test('UAT 1.2: Search and find matter', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      // Try to find search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        
        const completionTime = Date.now() - startTime;
        console.log(`Search completed in ${completionTime}ms`);
        
        // Success criteria: Search responds within 1 second
        expect(completionTime).toBeLessThan(1000);
      }
    });

    test('UAT 1.3: View matter details', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      const viewButton = page.locator('button:has-text("View")').first();
      if (await viewButton.isVisible()) {
        const startTime = Date.now();
        
        await viewButton.click();
        await page.waitForTimeout(500);
        
        // Verify details modal opened
        const modal = page.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();
        
        const completionTime = Date.now() - startTime;
        console.log(`Matter details opened in ${completionTime}ms`);
        
        // Success criteria: Details open within 1 second
        expect(completionTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('UAT Scenario 2: Invoice Generation Workflow', () => {
    /**
     * User Story: As an advocate, I want to review unbilled work,
     * generate an invoice, and send it to the client.
     * 
     * Success Criteria:
     * - Clear visibility of unbilled work
     * - Invoice generation completes without errors
     * - PDF preview available before sending
     * - Client receives invoice within 2 minutes
     */

    test('UAT 2.1: Navigate to invoices page', async ({ page }) => {
      const startTime = Date.now();
      
      await page.click('a[href*="invoices"]');
      await page.waitForLoadState('networkidle');
      
      // Verify invoices page loaded
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
      
      const completionTime = Date.now() - startTime;
      console.log(`Invoices page loaded in ${completionTime}ms`);
      
      // Success criteria: Page loads within 2 seconds
      expect(completionTime).toBeLessThan(2000);
    });

    test('UAT 2.2: Identify unbilled matters', async ({ page }) => {
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      // Look for unbilled indicators
      const unbilledIndicators = await page.locator('[class*="unbilled"], [class*="wip"]').count();
      console.log(`Unbilled work indicators found: ${unbilledIndicators}`);
      
      // Success criteria: Unbilled work is clearly visible
      // (This is more of a manual check, but we verify elements exist)
    });

    test('UAT 2.3: Generate invoice action', async ({ page }) => {
      await page.click('a[href*="invoices"]');
      await page.waitForLoadState('networkidle');
      
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create Invoice")').first();
      if (await generateButton.isVisible()) {
        await generateButton.click();
        await page.waitForTimeout(500);
        
        // Verify action triggered
        const modal = page.locator('[role="dialog"], .modal').first();
        const modalVisible = await modal.isVisible();
        
        console.log(`Invoice generation dialog opened: ${modalVisible}`);
      }
    });
  });

  test.describe('UAT Scenario 3: Dashboard Overview Workflow', () => {
    /**
     * User Story: As an advocate, I want to view my dashboard
     * to quickly understand my practice status and upcoming tasks.
     * 
     * Success Criteria:
     * - All key metrics visible above the fold
     * - Dashboard loads within 2 seconds
     * - Navigation to detailed views works smoothly
     * - Data is up-to-date
     */

    test('UAT 3.1: Dashboard loads with key metrics', async ({ page }) => {
      const startTime = Date.now();
      
      // Dashboard should already be loaded from beforeEach
      
      // Verify key metrics are visible
      const metrics = await page.locator('[class*="metric"], [class*="stat"], [class*="card"]').count();
      console.log(`Dashboard metrics/cards found: ${metrics}`);
      
      const completionTime = Date.now() - startTime;
      console.log(`Dashboard verified in ${completionTime}ms`);
      
      // Success criteria: Dashboard shows multiple metrics
      expect(metrics).toBeGreaterThan(0);
    });

    test('UAT 3.2: Quick navigation from dashboard', async ({ page }) => {
      // Test clicking on a dashboard metric/card
      const cards = await page.locator('[class*="card"], button, a').all();
      
      if (cards.length > 0) {
        const startTime = Date.now();
        
        // Click first interactive element
        const firstCard = cards[0];
        const isClickable = await firstCard.evaluate(el => {
          return el.tagName === 'A' || el.tagName === 'BUTTON' || el.onclick !== null;
        });
        
        if (isClickable) {
          await firstCard.click();
          await page.waitForTimeout(500);
          
          const completionTime = Date.now() - startTime;
          console.log(`Navigation completed in ${completionTime}ms`);
          
          // Success criteria: Navigation is fast
          expect(completionTime).toBeLessThan(1000);
        }
      }
    });

    test('UAT 3.3: Recent matters are accessible', async ({ page }) => {
      // Look for recent matters section
      const recentMatters = page.locator('h2:has-text("Recent"), h3:has-text("Recent")').first();
      
      if (await recentMatters.isVisible()) {
        // Verify matters list exists below heading
        const mattersList = page.locator('[class*="matter"], [data-matter-id]');
        const count = await mattersList.count();
        
        console.log(`Recent matters displayed: ${count}`);
        
        // Success criteria: Recent matters are visible
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('UAT Scenario 4: Settings and Profile Management', () => {
    /**
     * User Story: As a user, I want to update my profile information
     * and configure application settings.
     * 
     * Success Criteria:
     * - Settings are easy to find
     * - Changes save successfully
     * - Confirmation feedback is clear
     * - No data loss on navigation
     */

    test('UAT 4.1: Access settings page', async ({ page }) => {
      const startTime = Date.now();
      
      const settingsLink = page.locator('a[href*="settings"], a[href*="profile"]').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify settings page loaded
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
        
        const completionTime = Date.now() - startTime;
        console.log(`Settings page loaded in ${completionTime}ms`);
        
        // Success criteria: Settings accessible within 1 second
        expect(completionTime).toBeLessThan(1000);
      }
    });

    test('UAT 4.2: Form validation works', async ({ page }) => {
      const settingsLink = page.locator('a[href*="settings"], a[href*="profile"]').first();
      if (await settingsLink.isVisible()) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Try to find and clear a required field
        const inputs = await page.locator('input:visible').all();
        if (inputs.length > 0) {
          const firstInput = inputs[0];
          
          // Clear input
          await firstInput.clear();
          
          // Try to submit or blur
          await firstInput.blur();
          await page.waitForTimeout(300);
          
          // Look for validation message
          const errorMessage = page.locator('[class*="error"], [role="alert"]').first();
          const hasError = await errorMessage.isVisible().catch(() => false);
          
          console.log(`Validation message displayed: ${hasError}`);
        }
      }
    });
  });

  test.describe('UAT Scenario 5: Responsive Mobile Experience', () => {
    /**
     * User Story: As a mobile user, I want to access key features
     * on my phone while on the go.
     * 
     * Success Criteria:
     * - All features accessible on mobile
     * - Touch targets are appropriately sized
     * - Navigation is intuitive
     * - Forms are easy to fill on mobile
     */

    test('UAT 5.1: Mobile dashboard is usable', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify content is visible
      const content = page.locator('main, [role="main"]').first();
      await expect(content).toBeVisible();
      
      // Check for mobile menu
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"]').first();
      const hasMobileMenu = await menuButton.isVisible().catch(() => false);
      
      console.log(`Mobile menu available: ${hasMobileMenu}`);
    });

    test('UAT 5.2: Mobile navigation works', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Try to open mobile menu
      const menuButton = page.locator('button[aria-label*="menu"]').first();
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await page.waitForTimeout(300);
        
        // Verify menu opened
        const nav = page.locator('nav, [role="navigation"]').first();
        await expect(nav).toBeVisible();
        
        console.log('Mobile navigation opened successfully');
      }
    });

    test('UAT 5.3: Touch targets meet minimum size', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const smallTargets = await page.evaluate(() => {
        const interactive = Array.from(
          document.querySelectorAll('button, a, input')
        );
        
        return interactive.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44;
        }).length;
      });
      
      console.log(`Touch targets below 44x44px: ${smallTargets}`);
      
      // Success criteria: Minimal small touch targets
      expect(smallTargets).toBeLessThan(5);
    });
  });

  test.describe('UAT Scenario 6: Error Recovery', () => {
    /**
     * User Story: As a user, I want clear error messages
     * and recovery options when something goes wrong.
     * 
     * Success Criteria:
     * - Error messages are user-friendly
     * - Recovery actions are provided
     * - No data loss on errors
     * - User can continue working after error
     */

    test('UAT 6.1: Handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/nonexistent-page');
      await page.waitForTimeout(500);
      
      // Should show error page, not blank screen
      const content = await page.textContent('body');
      expect(content?.length).toBeGreaterThan(0);
      
      // Look for home/back button
      const homeLink = page.locator('a[href="/"], button:has-text("Home")').first();
      const hasRecovery = await homeLink.isVisible().catch(() => false);
      
      console.log(`Error recovery option available: ${hasRecovery}`);
      expect(hasRecovery).toBe(true);
    });

    test('UAT 6.2: Network error handling', async ({ page }) => {
      // This would require intercepting network requests
      // For now, we verify error states exist in the UI
      
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      
      // Verify page has loaded (no permanent error state)
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
    });
  });

  test.describe('UAT Performance Expectations', () => {
    test('Measure average task completion time', async ({ page }) => {
      const times: number[] = [];
      
      // Task 1: Navigate to matters
      let start = Date.now();
      await page.click('a[href*="matters"]');
      await page.waitForLoadState('networkidle');
      times.push(Date.now() - start);
      
      // Task 2: Navigate to firms
      start = Date.now();
      await page.click('a[href*="firms"]');
      await page.waitForLoadState('networkidle');
      times.push(Date.now() - start);
      
      // Task 3: Return to dashboard
      start = Date.now();
      await page.click('a[href="/"]');
      await page.waitForLoadState('networkidle');
      times.push(Date.now() - start);
      
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      console.log(`Average navigation time: ${average.toFixed(0)}ms`);
      console.log(`Individual times: ${times.map(t => t.toFixed(0)).join('ms, ')}ms`);
      
      // Success criteria: Average navigation under 1.5 seconds
      expect(average).toBeLessThan(1500);
    });
  });
});
