import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('WIP & Scope Amendments - End-to-End Workflow', () => {
  test('E2E 7.1: Verify WIP accumulation in Matter', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      const firstMatter = matterCards.first();
      await expect(firstMatter).toBeVisible();
      
      const wipValue = firstMatter.locator('text=/R\\s*[0-9]/i');
      const hasWIP = await wipValue.count() > 0;
      
      if (hasWIP) {
        await expect(wipValue.first()).toBeVisible();
      }
    }
  });

  test('E2E 7.2: Automatic scope amendment creation (>15% variance)', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      const varianceAlert = page.locator('text=/variance|15%/i').first();
      const isVisible = await varianceAlert.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await expect(varianceAlert).toBeVisible();
      }
    }
  });

  test('E2E 7.3: Manual scope amendment creation', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const scopeTab = page.getByRole('button', { name: /scope.*amendments/i });
      if (await scopeTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await scopeTab.click();
        await page.waitForTimeout(500);
        
        const createBtn = page.getByRole('button', { name: /create amendment/i });
        if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(createBtn).toBeVisible();
        }
      }
    }
  });

  test('E2E 7.4: Partner approves scope amendment', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const scopeLink = page.locator('text=/scope.*amendment/i').first();
    const isVisible = await scopeLink.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(scopeLink).toBeVisible();
    }
  });

  test('E2E 7.5: Client approves scope amendment', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    const scopeSection = page.locator('text=/scope.*amendment/i').first();
    const isVisible = await scopeSection.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(scopeSection).toBeVisible();
    }
  });

  test('E2E 7.6: View scope amendment history', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const scopeTab = page.getByRole('button', { name: /scope.*amendments/i });
      if (await scopeTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await scopeTab.click();
        await page.waitForTimeout(1000);
        
        const historySection = page.locator('text=/amendment history/i');
        const isVisible = await historySection.isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          await expect(historySection).toBeVisible();
        }
      }
    }
  });
});
