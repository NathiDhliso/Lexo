import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown } from './utils/test-helpers';

test.describe('Time & Expense Tracking', () => {
  test('Test 6.1: Create Time Entry', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Add Time Entry');
    
    await fillFormField(page, 'date', '2025-01-15');
    await fillFormField(page, 'hours', '5');
    await fillFormField(page, 'hourlyRate', '2500');
    await fillFormField(page, 'description', 'Legal research and drafting');
    
    await clickButton(page, 'Save');
    
    await waitForToast(page, 'Time entry created');
    await expect(page.locator('text=R 12,500.00')).toBeVisible();
  });

  test('Test 6.2: Create Expense', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Add Expense');
    
    await fillFormField(page, 'date', '2025-01-15');
    await fillFormField(page, 'amount', '500');
    await selectDropdown(page, 'category', 'Travel');
    await fillFormField(page, 'description', 'Travel to court');
    
    await clickButton(page, 'Save');
    
    await waitForToast(page, 'Expense created');
    await expect(page.locator('text=R 500.00')).toBeVisible();
  });

  test('Test 6.3: Edit Time Entry', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    const timeEntry = page.locator('[data-time-entry-id]').first();
    await timeEntry.click();
    
    await clickButton(page, 'Edit');
    
    await fillFormField(page, 'hours', '6');
    await fillFormField(page, 'description', 'Updated: Legal research and drafting');
    
    await clickButton(page, 'Save');
    
    await waitForToast(page, 'Time entry updated');
    await expect(page.locator('text=R 15,000.00')).toBeVisible();
  });

  test('Test 6.4: Delete Time Entry', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    const timeEntry = page.locator('[data-time-entry-id]').first();
    await timeEntry.click();
    
    await clickButton(page, 'Delete');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Time entry deleted');
  });

  test('Test 6.5: Bulk Time Entry Creation', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    for (let i = 0; i < 5; i++) {
      await clickButton(page, 'Add Time Entry');
      await fillFormField(page, 'date', `2025-01-${15 + i}`);
      await fillFormField(page, 'hours', '3');
      await fillFormField(page, 'hourlyRate', '2500');
      await fillFormField(page, 'description', `Day ${i + 1} work`);
      await clickButton(page, 'Save');
      await waitForToast(page);
    }
    
    await expect(page.locator('text=R 37,500.00')).toBeVisible();
  });

  test('Test 6.6: Filter Time Entries by Date', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    await clickButton(page, 'Filter');
    
    await expect(page.locator('[data-time-entry-id]')).toHaveCount(5);
  });

  test('Test 6.7: Export Time Entries', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    const downloadPromise = page.waitForEvent('download');
    await clickButton(page, 'Export Time Entries');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Test 6.8: Upload Expense Receipt', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Add Expense');
    
    await fillFormField(page, 'date', '2025-01-15');
    await fillFormField(page, 'amount', '1500');
    await selectDropdown(page, 'category', 'Accommodation');
    await fillFormField(page, 'description', 'Hotel stay');
    
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample-receipt.pdf');
    
    await clickButton(page, 'Save');
    
    await waitForToast(page, 'Expense created');
    await expect(page.locator('text=Receipt attached')).toBeVisible();
  });

  test('Test 6.9: View Unbilled Time and Expenses', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'View Unbilled');
    
    await expect(page.locator('text=Unbilled Time Entries')).toBeVisible();
    await expect(page.locator('text=Unbilled Expenses')).toBeVisible();
  });
});
