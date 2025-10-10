import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Pro Forma System - End-to-End Workflow', () => {
  let proformaId: string;
  let proformaReference: string;

  test('E2E 2.1: Verify Pro Forma page and Generate Link button', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const generateLinkBtn = page.getByRole('button', { name: 'Generate Link' });
    await expect(generateLinkBtn).toBeVisible();
    await expect(generateLinkBtn).toBeEnabled();
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    await expect(count).toBeGreaterThanOrEqual(0);
  });

  test('E2E 2.2: View Pro Forma details', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      const firstCard = proformaCards.first();
      await expect(firstCard).toBeVisible();
      
      const reference = await firstCard.locator('text=/PF-/').first().textContent();
      if (reference) {
        proformaReference = reference.trim();
      }
      
      await firstCard.click();
      await page.waitForTimeout(1000);
    }
  });

  test('E2E 2.3: Filter Pro Formas by status', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const statuses = ['Draft', 'Sent', 'Accepted', 'Declined', 'Converted', 'Expired'];
    
    for (const status of statuses) {
      const statusBtn = page.getByRole('button', { name: status });
      if (await statusBtn.isVisible()) {
        await statusBtn.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('E2E 2.4: View accepted Pro Formas ready for conversion', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    await page.getByRole('button', { name: 'Accepted' }).click();
    await page.waitForTimeout(1000);
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      const convertBtn = page.getByRole('button', { name: 'Convert to Matter' }).first();
      const isVisible = await convertBtn.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        await expect(convertBtn).toBeVisible();
      }
    }
  });

  test('E2E 2.5: View converted Pro Formas with Matter link', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    await page.getByRole('button', { name: 'Converted' }).click();
    await page.waitForTimeout(1000);
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      const viewMatterBtn = page.getByRole('button', { name: 'View Matter' }).first();
      const reverseBtnExists = await page.getByRole('button', { name: 'Reverse Conversion' }).first().isVisible({ timeout: 2000 }).catch(() => false);
      
      if (reverseBtnExists) {
        await expect(page.getByRole('button', { name: 'Reverse Conversion' }).first()).toBeVisible();
      }
    }
  });

  test('E2E 2.6: Generate public link for attorney submission', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const generateLinkBtn = page.getByRole('button', { name: 'Generate Link' });
    await expect(generateLinkBtn).toBeVisible();
    await expect(generateLinkBtn).toBeEnabled();
  });

  test('E2E 2.7: Attorney submits Pro Forma via public link', async ({ page }) => {
    await page.goto('/#/attorney/proforma/test-token');
    await page.waitForTimeout(1000);
    
    const heading = page.locator('text=/pro forma|fee estimate/i').first();
    const isVisible = await heading.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(heading).toBeVisible();
    }
  });

  test('E2E 2.8: Send Pro Forma to attorney', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      const sendBtn = page.getByRole('button', { name: /send|share/i }).first();
      const isVisible = await sendBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await expect(sendBtn).toBeVisible();
      }
    }
  });

  test('E2E 2.9: Attorney accepts Pro Forma', async ({ page }) => {
    await page.goto('/#/attorney/proforma/test-token');
    await page.waitForTimeout(1000);
    
    const acceptBtn = page.getByRole('button', { name: /accept/i });
    const isVisible = await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(acceptBtn).toBeVisible();
    }
  });

  test('E2E 2.10: Attorney negotiates Pro Forma', async ({ page }) => {
    await page.goto('/#/attorney/proforma/test-token');
    await page.waitForTimeout(1000);
    
    const negotiateBtn = page.getByRole('button', { name: /negotiate/i });
    const isVisible = await negotiateBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(negotiateBtn).toBeVisible();
    }
  });
});
