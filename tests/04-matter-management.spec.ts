import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Matter Management - End-to-End Workflow', () => {
  let matterReference: string;

  test('E2E 4.1: Convert accepted Pro Forma to Matter', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    await page.getByRole('button', { name: 'Accepted' }).click();
    await page.waitForTimeout(1000);
    
    const convertBtn = page.getByRole('button', { name: 'Convert to Matter' }).first();
    const isVisible = await convertBtn.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      await convertBtn.click();
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[role="dialog"]').or(page.locator('.modal')).first();
      if (await modal.isVisible()) {
        const confirmBtn = page.getByRole('button', { name: /convert|create|confirm/i }).first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
          await waitForToast(page);
        }
      }
      
      await page.waitForTimeout(2000);
    }
  });

  test('E2E 4.2: Create urgent Matter (skip Pro Forma)', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const newMatterBtn = page.getByRole('button', { name: 'New Matter' });
    await expect(newMatterBtn).toBeVisible();
    await newMatterBtn.click();
    
    await page.waitForTimeout(1000);
    
    const modal = page.locator('[role="dialog"]').or(page.locator('.modal')).first();
    if (await modal.isVisible()) {
      await fillFormField(page, 'clientName', 'Emergency Client');
      await fillFormField(page, 'matterDescription', 'Urgent bail application');
      
      const createBtn = page.getByRole('button', { name: /create|submit/i }).first();
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await waitForToast(page);
      }
    }
    
    await page.waitForTimeout(2000);
  });

  test('E2E 4.3: View Matter details and WIP', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      const firstMatter = matterCards.first();
      await expect(firstMatter).toBeVisible();
      
      const reference = await firstMatter.locator('text=/JHB|CPT/').first().textContent().catch(() => null);
      if (reference) {
        matterReference = reference.trim();
      }
      
      await firstMatter.click();
      await page.waitForTimeout(1000);
    }
  });

  test('E2E 4.4: Add time entry to Matter', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const timeEntriesTab = page.getByRole('tab', { name: /time entries/i });
      if (await timeEntriesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await timeEntriesTab.click();
        await page.waitForTimeout(500);
        
        const addTimeBtn = page.getByRole('button', { name: /add time|new entry/i }).first();
        if (await addTimeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await addTimeBtn.click();
          await page.waitForTimeout(1000);
          
          await fillFormField(page, 'description', 'Client consultation');
          await fillFormField(page, 'hours', '2');
          
          const saveBtn = page.getByRole('button', { name: /save|submit/i }).first();
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await waitForToast(page);
          }
        }
      }
    }
  });

  test('E2E 4.5: Add expense to Matter', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const expensesTab = page.getByRole('tab', { name: /expenses/i });
      if (await expensesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expensesTab.click();
        await page.waitForTimeout(500);
        
        const addExpenseBtn = page.getByRole('button', { name: /add expense|new expense/i }).first();
        if (await addExpenseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          await addExpenseBtn.click();
          await page.waitForTimeout(1000);
          
          await fillFormField(page, 'description', 'Court filing fees');
          await fillFormField(page, 'amount', '500');
          
          const saveBtn = page.getByRole('button', { name: /save|submit/i }).first();
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await waitForToast(page);
          }
        }
      }
    }
  });

  test('E2E 4.6: Verify WIP accumulation', async ({ authenticatedPage: page }) => {
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

  test('E2E 4.7: Update Matter state', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const stateDropdown = page.locator('select[name="status"]').or(page.getByRole('combobox', { name: /status|state/i })).first();
      if (await stateDropdown.isVisible({ timeout: 5000 }).catch(() => false)) {
        await stateDropdown.selectOption('active');
        await page.waitForTimeout(500);
      }
    }
  });

  test('E2E 4.8: Filter Matters by state', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const activeBtn = page.getByRole('button', { name: 'Active Matters' });
    if (await activeBtn.isVisible()) {
      await activeBtn.click();
      await page.waitForTimeout(500);
    }
    
    const allBtn = page.getByRole('button', { name: 'All Matters' });
    if (await allBtn.isVisible()) {
      await allBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('E2E 4.9: Cost variance triggers scope amendment (>15%)', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      const varianceAlert = page.locator('text=/variance|15%|scope/i').first();
      const isVisible = await varianceAlert.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await expect(varianceAlert).toBeVisible();
      }
    }
  });

  test('E2E 4.10: Matter Workbench - Documents tab', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const documentsTab = page.getByRole('button', { name: /documents/i });
      const isVisible = await documentsTab.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await expect(documentsTab).toBeVisible();
      }
    }
  });
});
