import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Attorney Portal - End-to-End Workflow', () => {
  test('Test 15.1: Attorney Registration', async ({ page }) => {
    await page.goto('/attorney/register');
    
    await fillFormField(page, 'email', 'nkosinathi.dhliso@gmail.com');
    await fillFormField(page, 'password', 'Latestmano271991!');
    await fillFormField(page, 'firmName', 'Smith & Associates');
    await fillFormField(page, 'attorneyName', 'Jane Smith');
    await fillFormField(page, 'practiceNumber', 'PN12345');
    
    await clickButton(page, 'Register');
    
    await page.waitForURL('/attorney/dashboard');
    await expect(page).toHaveURL(/\/attorney\/dashboard/);
  });

  test('Test 15.2: Attorney Login', async ({ page }) => {
    await page.goto('/attorney/login');
    
    await fillFormField(page, 'email', 'nkosinathi.dhliso@gmail.com');
    await fillFormField(page, 'password', 'Latestmano271991!');
    
    await clickButton(page, 'Login');
    
    await page.waitForURL('/attorney/dashboard');
    await expect(page).toHaveURL(/\/attorney\/dashboard/);
  });

  test('Test 15.3: Grant Matter Access to Attorney', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Grant Attorney Access');
    
    await fillFormField(page, 'attorneyEmail', 'nkosinathi.dhliso@gmail.com');
    await selectDropdown(page, 'accessLevel', 'Approve');
    
    await clickButton(page, 'Grant');
    
    await waitForToast(page, 'Access granted');
  });

  test('Test 15.4: Attorney Dashboard', async ({ attorneyPage: page }) => {
    await expect(page.locator('text=Active Matters')).toBeVisible();
    await expect(page.locator('text=Pending Pro Formas')).toBeVisible();
    await expect(page.locator('text=Outstanding Invoices')).toBeVisible();
    await expect(page.locator('text=Total Outstanding')).toBeVisible();
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('Test 15.5: Attorney Views Matters', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/matters');
    
    await expect(page.locator('[data-matter-id]')).toHaveCount(5);
    
    await selectDropdown(page, 'stateFilter', 'active');
    await expect(page.locator('text=Active')).toBeVisible();
    
    await fillFormField(page, 'search', 'Corporate');
    await expect(page.locator('text=Corporate')).toBeVisible();
  });

  test('Test 15.6: Attorney Approves Pro Forma', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/proformas');
    
    const proforma = page.locator('[data-proforma-status="sent"]').first();
    await proforma.click();
    
    await clickButton(page, 'Approve');
    
    await fillFormField(page, 'comments', 'Approved as submitted');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Pro forma approved');
  });

  test('Test 15.7: Attorney Views Invoices', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/invoices');
    
    await expect(page.locator('[data-invoice-id]')).toHaveCount(10);
    
    await selectDropdown(page, 'statusFilter', 'pending');
    await expect(page.locator('text=Pending')).toBeVisible();
    
    await expect(page.locator('text=Total Outstanding')).toBeVisible();
  });

  test('Test 15.8: Attorney Makes Payment', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/invoices');
    const invoice = page.locator('[data-invoice-id]').first();
    await invoice.click();
    
    await clickButton(page, 'Pay Now');
    
    await expect(page.locator('text=Bank Details')).toBeVisible();
    
    await clickButton(page, 'Copy Account Number');
    
    await fillFormField(page, 'paymentReference', 'EFT-PAYMENT-001');
    await clickButton(page, 'Record Payment');
    
    await waitForToast(page, 'Payment recorded');
  });

  test('Test 15.9: Attorney Notification Center', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/notifications');
    
    await expect(page.locator('text=Notifications')).toBeVisible();
    
    const unreadCount = await page.locator('[data-unread-count]').textContent();
    expect(parseInt(unreadCount || '0')).toBeGreaterThan(0);
    
    await clickButton(page, 'Mark All as Read');
    
    await waitForToast(page, 'All notifications marked as read');
  });

  test('Test 15.10: Revoke Attorney Access', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Manage Access');
    
    const attorney = page.locator('[data-attorney-id]').first();
    await attorney.locator('button:has-text("Revoke")').click();
    
    await fillFormField(page, 'reason', 'Matter completed');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Access revoked');
  });

  test('Test 15.11: Attorney Profile Update', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/profile');
    
    await fillFormField(page, 'phoneNumber', '+27123456789');
    await fillFormField(page, 'address', '123 Legal Street, Johannesburg');
    
    await clickButton(page, 'Save');
    
    await waitForToast(page, 'Profile updated');
  });

  test('Test 15.12: Attorney Download Invoice PDF', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/invoices');
    const invoice = page.locator('[data-invoice-id]').first();
    await invoice.click();
    
    const downloadPromise = page.waitForEvent('download');
    await clickButton(page, 'Download PDF');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Test 15.13: Attorney View Matter Details', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await expect(page.locator('text=Matter Details')).toBeVisible();
    await expect(page.locator('text=Time Entries')).toBeVisible();
    await expect(page.locator('text=Expenses')).toBeVisible();
    await expect(page.locator('text=Invoices')).toBeVisible();
  });

  test('Test 15.14: Attorney Filter Overdue Invoices', async ({ attorneyPage: page }) => {
    await page.goto('/attorney/invoices');
    
    await selectDropdown(page, 'statusFilter', 'overdue');
    
    await expect(page.locator('[data-invoice-status="overdue"]')).toHaveCount(3);
    await expect(page.locator('text=Overdue')).toBeVisible();
  });
});
