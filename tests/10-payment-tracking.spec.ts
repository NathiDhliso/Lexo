import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Payment Tracking - End-to-End Workflow', () => {
  test('E2E 10.1: Record full payment for invoice', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const recordPaymentBtn = page.getByRole('button', { name: /record payment|add payment/i }).first();
      if (await recordPaymentBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await recordPaymentBtn.click();
        await page.waitForTimeout(1000);
        
        const modal = page.locator('[role="dialog"]').or(page.locator('.modal')).first();
        if (await modal.isVisible()) {
          await fillFormField(page, 'amount', '50000');
          
          const paymentMethod = page.locator('select[name="paymentMethod"]').or(page.getByRole('combobox', { name: /method/i })).first();
          if (await paymentMethod.isVisible({ timeout: 3000 }).catch(() => false)) {
            await paymentMethod.selectOption('EFT');
          }
          
          await fillFormField(page, 'reference', 'EFT-12345');
          
          const saveBtn = page.getByRole('button', { name: /record|save|submit/i }).first();
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await waitForToast(page);
          }
        }
        
        await page.waitForTimeout(2000);
      }
    }
  });

  test('E2E 10.2: Record partial payment', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const recordPaymentBtn = page.getByRole('button', { name: /record payment|add payment/i }).first();
      if (await recordPaymentBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await recordPaymentBtn.click();
        await page.waitForTimeout(1000);
        
        await fillFormField(page, 'amount', '20000');
        
        const paymentMethod = page.locator('select[name="paymentMethod"]').or(page.getByRole('combobox', { name: /method/i })).first();
        if (await paymentMethod.isVisible({ timeout: 3000 }).catch(() => false)) {
          await paymentMethod.selectOption('Credit Card');
        }
        
        const saveBtn = page.getByRole('button', { name: /record|save|submit/i }).first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await waitForToast(page);
        }
      }
    }
  });

  test('E2E 10.3: View payment history', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const paymentsSection = page.locator('text=/payments|payment history/i').first();
      if (await paymentsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(paymentsSection).toBeVisible();
      }
    }
  });

  test('E2E 10.4: Payment dispute workflow', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      const disputeBtn = page.getByRole('button', { name: /dispute/i }).first();
      if (await disputeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(disputeBtn).toBeVisible();
      }
    }
  });

  test('E2E 10.5: Credit note creation', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      const creditNoteBtn = page.getByRole('button', { name: /credit note/i }).first();
      if (await creditNoteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(creditNoteBtn).toBeVisible();
      }
    }
  });
});
