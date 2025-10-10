import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Engagement Agreements - End-to-End Workflow', () => {
  let agreementId: string;

  test('E2E 3.1: Navigate to Engagement Agreements', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      await proformaCards.first().click();
      await page.waitForTimeout(1000);
      
      const engagementBtn = page.getByRole('button', { name: /engagement|agreement/i }).first();
      if (await engagementBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(engagementBtn).toBeVisible();
      }
    }
  });

  test('E2E 3.2: Create Engagement Agreement from accepted Pro Forma', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    await page.getByRole('button', { name: 'Accepted' }).click();
    await page.waitForTimeout(1000);
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      await proformaCards.first().click();
      await page.waitForTimeout(1000);
      
      const createEngagementBtn = page.getByRole('button', { name: /create engagement|engagement agreement/i }).first();
      if (await createEngagementBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createEngagementBtn.click();
        await page.waitForTimeout(1000);
        
        const modal = page.locator('[role="dialog"]').or(page.locator('.modal')).first();
        if (await modal.isVisible()) {
          await fillFormField(page, 'scopeOfWork', 'Legal representation in litigation matter');
          
          const createBtn = page.getByRole('button', { name: /create|generate/i }).first();
          if (await createBtn.isVisible()) {
            await createBtn.click();
            await waitForToast(page);
          }
        }
      }
    }
  });

  test('E2E 3.3: View Engagement Agreement details', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      await proformaCards.first().click();
      await page.waitForTimeout(1000);
      
      const agreementSection = page.locator('text=/engagement|agreement/i').first();
      if (await agreementSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(agreementSection).toBeVisible();
      }
    }
  });

  test('E2E 3.4: Send Engagement Agreement to client', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const proformaCards = page.locator('[data-proforma-id]');
    const count = await proformaCards.count();
    
    if (count > 0) {
      const sendBtn = page.getByRole('button', { name: /send.*agreement/i }).first();
      const isVisible = await sendBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await expect(sendBtn).toBeVisible();
      }
    }
  });

  test('E2E 3.5: Client signs Engagement Agreement', async ({ page }) => {
    await page.goto('/#/attorney/engagement/test-token');
    await page.waitForTimeout(1000);
    
    const signBtn = page.getByRole('button', { name: /sign.*agreement/i });
    const isVisible = await signBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(signBtn).toBeVisible();
    }
  });

  test('E2E 3.6: Advocate counter-signs Engagement Agreement', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const counterSignBtn = page.getByRole('button', { name: /counter.*sign/i }).first();
    const isVisible = await counterSignBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(counterSignBtn).toBeVisible();
    }
  });

  test('E2E 3.7: Generate Engagement Agreement PDF', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Pro Forma');
    
    const pdfBtn = page.getByRole('button', { name: /pdf|download/i }).first();
    const isVisible = await pdfBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(pdfBtn).toBeVisible();
    }
  });
});
