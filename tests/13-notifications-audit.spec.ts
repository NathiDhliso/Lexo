import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast } from './utils/test-helpers';

test.describe('Notifications & Audit Trail', () => {
  test('Test 16.1: Pro Forma Request Notification', async ({ authenticatedPage: page, page: clientPage }) => {
    await page.goto('/proforma');
    await clickButton(page, 'New Pro Forma');
    
    await fillFormField(page, 'clientName', 'Test Client');
    await fillFormField(page, 'clientEmail', 'test@client.com');
    await fillFormField(page, 'matterDescription', 'Test matter');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    await clientPage.goto('/attorney/notifications');
    await expect(clientPage.locator('text=Pro forma request')).toBeVisible();
  });

  test('Test 16.2: Invoice Issued Notification', async ({ authenticatedPage: page, page: clientPage }) => {
    await page.goto('/invoices');
    const draftInvoice = page.locator('[data-invoice-status="draft"]').first();
    await draftInvoice.click();
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    await clientPage.goto('/attorney/notifications');
    await expect(clientPage.locator('text=Invoice issued')).toBeVisible();
  });

  test('Test 16.3: Payment Received Notification', async ({ authenticatedPage: page, page: clientPage }) => {
    await clientPage.goto('/attorney/invoices');
    const invoice = clientPage.locator('[data-invoice-id]').first();
    await invoice.click();
    
    await clickButton(clientPage, 'Record Payment');
    await fillFormField(clientPage, 'amount', '10000');
    await clickButton(clientPage, 'Record');
    await waitForToast(clientPage);
    
    await page.goto('/notifications');
    await expect(page.locator('text=Payment received')).toBeVisible();
  });

  test('Test 16.4: Low Balance Notification', async ({ authenticatedPage: page }) => {
    await page.goto('/retainers');
    const retainer = page.locator('[data-retainer-id]').first();
    await retainer.click();
    
    const balance = await page.locator('[data-balance]').textContent();
    const balanceAmount = parseFloat(balance?.replace(/[^0-9.]/g, '') || '0');
    const drawdownAmount = balanceAmount * 0.85;
    
    await clickButton(page, 'Drawdown Funds');
    await fillFormField(page, 'amount', drawdownAmount.toString());
    await clickButton(page, 'Drawdown');
    await waitForToast(page);
    
    await page.goto('/notifications');
    await expect(page.locator('text=Retainer low balance')).toBeVisible();
  });

  test('Test 16.5: Overdue Invoice Notification', async ({ authenticatedPage: page }) => {
    await page.goto('/notifications');
    
    await expect(page.locator('text=Invoice overdue')).toBeVisible();
  });

  test('Test 16.6: Notification Preferences', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/settings');
    
    await page.uncheck('input[name="emailNotifications"]');
    await page.check('input[name="smsNotifications"]');
    
    await clickButton(page, 'Save Preferences');
    
    await waitForToast(page, 'Preferences updated');
  });

  test('Test 16.7: Mark Notification as Read', async ({ authenticatedPage: page }) => {
    await page.goto('/notifications');
    
    const unreadNotification = page.locator('[data-notification-read="false"]').first();
    await unreadNotification.click();
    
    await clickButton(page, 'Mark as Read');
    
    await expect(unreadNotification).toHaveAttribute('data-notification-read', 'true');
  });

  test('Test 16.8: Filter Notifications by Type', async ({ authenticatedPage: page }) => {
    await page.goto('/notifications');
    
    await clickButton(page, 'Filter by Type');
    await clickButton(page, 'Invoice Notifications');
    
    await expect(page.locator('text=Invoice')).toBeVisible();
  });

  test('Test 17.1: Verify Audit Log Entries', async ({ authenticatedPage: page }) => {
    await page.goto('/proforma');
    await clickButton(page, 'New Pro Forma');
    await fillFormField(page, 'clientName', 'Audit Test Client');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await page.goto('/audit-trail');
    
    await expect(page.locator('text=proforma_created')).toBeVisible();
    await expect(page.locator('text=Audit Test Client')).toBeVisible();
  });

  test('Test 17.2: View Audit Trail', async ({ authenticatedPage: page }) => {
    await page.goto('/audit-trail');
    
    await expect(page.locator('text=Audit Trail')).toBeVisible();
    await expect(page.locator('[data-audit-entry]')).toHaveCount(20);
    
    await fillFormField(page, 'entityType', 'proforma_requests');
    await clickButton(page, 'Filter');
    
    await expect(page.locator('text=proforma')).toBeVisible();
  });

  test('Test 17.3: Audit Log Immutability', async ({ authenticatedPage: page }) => {
    await page.goto('/audit-trail');
    
    const auditEntry = page.locator('[data-audit-entry]').first();
    
    await expect(auditEntry.locator('button:has-text("Edit")')).not.toBeVisible();
    await expect(auditEntry.locator('button:has-text("Delete")')).not.toBeVisible();
  });

  test('Test 17.4: Filter Audit Trail by Date', async ({ authenticatedPage: page }) => {
    await page.goto('/audit-trail');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    await clickButton(page, 'Filter');
    
    await expect(page.locator('[data-audit-entry]')).toHaveCount(15);
  });

  test('Test 17.5: Search Audit Trail by User', async ({ authenticatedPage: page }) => {
    await page.goto('/audit-trail');
    
    await fillFormField(page, 'userSearch', 'John Advocate');
    await clickButton(page, 'Search');
    
    await expect(page.locator('text=John Advocate')).toBeVisible();
  });

  test('Test 17.6: View Audit Entry Details', async ({ authenticatedPage: page }) => {
    await page.goto('/audit-trail');
    
    const auditEntry = page.locator('[data-audit-entry]').first();
    await auditEntry.click();
    
    await expect(page.locator('text=Action')).toBeVisible();
    await expect(page.locator('text=User')).toBeVisible();
    await expect(page.locator('text=Timestamp')).toBeVisible();
    await expect(page.locator('text=IP Address')).toBeVisible();
    await expect(page.locator('text=Changes')).toBeVisible();
  });

  test('Test 17.7: Export Audit Trail', async ({ authenticatedPage: page }) => {
    await page.goto('/audit-trail');
    
    const downloadPromise = page.waitForEvent('download');
    await clickButton(page, 'Export Audit Trail');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
