import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, selectDropdown } from './utils/test-helpers';

test.describe('Reports & Analytics', () => {
  test('Test 18.1: WIP Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'WIP Report');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=WIP Report')).toBeVisible();
    await expect(page.locator('text=Total Unbilled')).toBeVisible();
    await expect(page.locator('[data-matter-wip]')).toHaveCount(10);
  });

  test('Test 18.2: Revenue Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Revenue Report');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Revenue Report')).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Paid Invoices')).toBeVisible();
    await expect(page.locator('text=Unpaid Invoices')).toBeVisible();
  });

  test('Test 18.3: Matter Pipeline Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Matter Pipeline');
    
    await expect(page.locator('text=Matter Pipeline')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('text=Paused')).toBeVisible();
    await expect(page.locator('text=Completed')).toBeVisible();
  });

  test('Test 18.4: Export WIP Report to CSV', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'WIP Report');
    await clickButton(page, 'Generate Report');
    
    const downloadPromise = page.waitForEvent('download');
    await clickButton(page, 'Export to CSV');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Test 18.5: Filter Revenue Report by Matter Type', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Revenue Report');
    await selectDropdown(page, 'matterType', 'Litigation');
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Litigation')).toBeVisible();
  });

  test('Test 18.6: Client Revenue Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Client Revenue Report');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Client Revenue')).toBeVisible();
    await expect(page.locator('[data-client-revenue]')).toHaveCount(15);
  });

  test('Test 18.7: Time Entry Summary Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Time Entry Summary');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Total Hours')).toBeVisible();
    await expect(page.locator('text=Total Value')).toBeVisible();
  });

  test('Test 18.8: Outstanding Invoices Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Outstanding Invoices');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Outstanding Invoices')).toBeVisible();
    await expect(page.locator('text=Total Outstanding')).toBeVisible();
    await expect(page.locator('[data-invoice-status="pending"]')).toHaveCount(8);
  });

  test('Test 18.9: Aging Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Aging Report');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=0-30 days')).toBeVisible();
    await expect(page.locator('text=31-60 days')).toBeVisible();
    await expect(page.locator('text=61-90 days')).toBeVisible();
    await expect(page.locator('text=90+ days')).toBeVisible();
  });

  test('Test 18.10: Matter Profitability Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Matter Profitability');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Profitability')).toBeVisible();
    await expect(page.locator('text=Estimated vs Actual')).toBeVisible();
  });

  test('Test 18.11: Dashboard Analytics', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Active Matters')).toBeVisible();
    await expect(page.locator('text=Outstanding Invoices')).toBeVisible();
    await expect(page.locator('text=WIP Value')).toBeVisible();
    
    await expect(page.locator('[data-chart="revenue"]')).toBeVisible();
    await expect(page.locator('[data-chart="matters"]')).toBeVisible();
  });

  test('Test 18.12: Export Report to PDF', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Revenue Report');
    await clickButton(page, 'Generate Report');
    
    const downloadPromise = page.waitForEvent('download');
    await clickButton(page, 'Export to PDF');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Test 18.13: Custom Date Range Report', async ({ authenticatedPage: page }) => {
    await page.goto('/reports');
    
    await clickButton(page, 'Custom Report');
    
    await fillFormField(page, 'startDate', '2024-12-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    
    await page.check('input[name="includeWIP"]');
    await page.check('input[name="includeInvoices"]');
    await page.check('input[name="includePayments"]');
    
    await clickButton(page, 'Generate Report');
    
    await expect(page.locator('text=Custom Report')).toBeVisible();
  });
});
