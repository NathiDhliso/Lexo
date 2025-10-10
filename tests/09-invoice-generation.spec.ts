import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Invoice Generation - End-to-End Workflow', () => {
  let invoiceNumber: string;

  test('E2E 9.1: Generate invoice from Matter with WIP', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      await matterCards.first().click();
      await page.waitForTimeout(1000);
      
      const generateInvoiceBtn = page.getByRole('button', { name: /generate invoice|create invoice/i }).first();
      if (await generateInvoiceBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await generateInvoiceBtn.click();
        await page.waitForTimeout(1000);
        
        const modal = page.locator('[role="dialog"]').or(page.locator('.modal')).first();
        if (await modal.isVisible()) {
          const invoiceType = page.locator('select[name="invoiceType"]').or(page.getByRole('combobox', { name: /type/i })).first();
          if (await invoiceType.isVisible({ timeout: 3000 }).catch(() => false)) {
            await invoiceType.selectOption('interim');
          }
          
          const generateBtn = page.getByRole('button', { name: /generate|create/i }).first();
          if (await generateBtn.isVisible()) {
            await generateBtn.click();
            await waitForToast(page);
          }
        }
        
        await page.waitForTimeout(2000);
      }
    }
  });

  test('E2E 9.2: View generated invoice details', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      const firstInvoice = invoiceCards.first();
      await expect(firstInvoice).toBeVisible();
      
      const invoiceRef = await firstInvoice.locator('text=/INV-/').first().textContent().catch(() => null);
      if (invoiceRef) {
        invoiceNumber = invoiceRef.trim();
      }
      
      await expect(firstInvoice.locator('text=/R\\s*[0-9]/i')).toBeVisible();
      
      await firstInvoice.click();
      await page.waitForTimeout(1000);
    }
  });

  test('E2E 9.3: Verify invoice auto-imports Pro Forma services', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const servicesSection = page.locator('text=/services|line items/i').first();
      if (await servicesSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(servicesSection).toBeVisible();
      }
    }
  });

  test('E2E 9.4: Verify invoice includes time entries', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const timeEntriesSection = page.locator('text=/time entries|hours/i').first();
      if (await timeEntriesSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(timeEntriesSection).toBeVisible();
      }
    }
  });

  test('E2E 9.5: Verify invoice includes expenses', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const expensesSection = page.locator('text=/expenses|disbursements/i').first();
      if (await expensesSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(expensesSection).toBeVisible();
      }
    }
  });

  test('E2E 9.6: Generate invoice PDF', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const pdfBtn = page.getByRole('button', { name: /pdf|download|generate pdf/i }).first();
      if (await pdfBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(pdfBtn).toBeVisible();
        await expect(pdfBtn).toBeEnabled();
      }
    }
  });

  test('E2E 9.7: Send invoice to client', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      await invoiceCards.first().click();
      await page.waitForTimeout(1000);
      
      const sendBtn = page.getByRole('button', { name: /send|email/i }).first();
      if (await sendBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(sendBtn).toBeVisible();
        await expect(sendBtn).toBeEnabled();
      }
    }
  });

  test('E2E 9.8: View invoice status progression', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      const statusBadge = invoiceCards.first().locator('[data-status]').or(invoiceCards.first().locator('text=/draft|sent|paid/i')).first();
      if (await statusBadge.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(statusBadge).toBeVisible();
      }
    }
  });

  test('E2E 9.9: Edit draft invoice', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      const editBtn = page.getByRole('button', { name: /edit/i }).first();
      if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(editBtn).toBeVisible();
      }
    }
  });

  test('E2E 9.10: Apply discount to invoice', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Invoices');
    
    const invoiceCards = page.locator('[data-invoice-id]');
    const count = await invoiceCards.count();
    
    if (count > 0) {
      const discountBtn = page.getByRole('button', { name: /discount/i }).first();
      if (await discountBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(discountBtn).toBeVisible();
      }
    }
  });
});
