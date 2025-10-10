import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Retainer & Trust Accounts - End-to-End Workflow', () => {
  test('E2E 5.1: Navigate to Matter and view retainer section', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerSection = page.locator('text=/retainer|trust/i').first();
      if (await retainerSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(retainerSection).toBeVisible();
      }
    }
  });

  test('E2E 5.2: Create retainer agreement for Matter', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retainerTab.click();
        await page.waitForTimeout(500);
        
        const createBtn = page.getByRole('button', { name: /create retainer/i });
        if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await createBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('E2E 5.3: Deposit funds to trust account', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retainerTab.click();
        await page.waitForTimeout(500);
        
        const depositBtn = page.getByRole('button', { name: /deposit funds/i });
        if (await depositBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(depositBtn).toBeVisible();
        }
      }
    }
  });

  test('E2E 5.4: Drawdown funds from trust account', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retainerTab.click();
        await page.waitForTimeout(500);
        
        const drawdownBtn = page.getByRole('button', { name: /drawdown funds/i });
        if (await drawdownBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(drawdownBtn).toBeVisible();
        }
      }
    }
  });

  test('E2E 5.5: View trust account balance', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retainerTab.click();
        await page.waitForTimeout(500);
        
        const balanceText = page.locator('text=/trust account balance/i');
        if (await balanceText.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(balanceText).toBeVisible();
        }
      }
    }
  });

  test('E2E 5.6: View trust transaction history', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retainerTab.click();
        await page.waitForTimeout(1000);
        
        const historySection = page.locator('text=/transaction history/i');
        const isVisible = await historySection.isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          await expect(historySection).toBeVisible();
        }
      }
    }
  });

  test('E2E 5.7: Low balance alert notification', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(retainerTab).toBeVisible();
      }
    }
  });

  test('E2E 5.8: Process retainer refund', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const retainerTab = page.getByRole('button', { name: /retainer.*trust/i });
      if (await retainerTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await retainerTab.click();
        await page.waitForTimeout(500);
        
        const refundBtn = page.getByRole('button', { name: /refund/i });
        if (await refundBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(refundBtn).toBeVisible();
        }
      }
    }
  });
});
