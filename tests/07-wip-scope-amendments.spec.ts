import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown, navigateToCoreFeature } from './utils/test-helpers';

test.describe('WIP & Scope Amendments - End-to-End Workflow', () => {
  test('Test 7.1: Verify WIP Auto-Calculation', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Add Time Entry');
    await fillFormField(page, 'hours', '4');
    await fillFormField(page, 'hourlyRate', '2500');
    await fillFormField(page, 'description', 'Legal work');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await expect(page.locator('[data-wip-total]')).toContainText('R 10,000.00');
    
    await clickButton(page, 'Add Expense');
    await fillFormField(page, 'amount', '500');
    await selectDropdown(page, 'category', 'Travel');
    await fillFormField(page, 'description', 'Travel');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await expect(page.locator('[data-wip-total]')).toContainText('R 10,500.00');
    
    await clickButton(page, 'Add Time Entry');
    await fillFormField(page, 'hours', '2');
    await fillFormField(page, 'hourlyRate', '2500');
    await fillFormField(page, 'description', 'Additional work');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await expect(page.locator('[data-wip-total]')).toContainText('R 15,500.00');
  });

  test('Test 7.2: WIP Widget Display', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await expect(page.locator('text=WIP Accumulator')).toBeVisible();
    await expect(page.locator('text=Total Unbilled WIP')).toBeVisible();
    await expect(page.locator('text=Time Entries')).toBeVisible();
    await expect(page.locator('text=Expenses')).toBeVisible();
    await expect(page.locator('text=Ready to Bill')).toBeVisible();
  });

  test('Test 8.1: Automatic Scope Amendment Creation (Cost Variance)', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    await clickButton(page, 'New Matter');
    
    await fillFormField(page, 'matterTitle', 'Fixed Fee Matter');
    await fillFormField(page, 'clientName', 'Test Client');
    await fillFormField(page, 'agreedFeeCap', '50000');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    for (let i = 0; i < 10; i++) {
      await clickButton(page, 'Add Time Entry');
      await fillFormField(page, 'hours', '2.5');
      await fillFormField(page, 'hourlyRate', '2500');
      await fillFormField(page, 'description', `Work day ${i + 1}`);
      await clickButton(page, 'Save');
      await waitForToast(page);
    }
    
    await page.goto('/scope-amendments');
    await expect(page.locator('text=Scope Increase')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('Test 8.2: Manual Scope Amendment Creation', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Create Scope Amendment');
    
    await selectDropdown(page, 'amendmentType', 'Timeline Change');
    await fillFormField(page, 'reason', 'Client requested additional work');
    await fillFormField(page, 'description', 'Extended scope to include additional research');
    await fillFormField(page, 'newEstimatedHours', '50');
    await fillFormField(page, 'newEstimatedCost', '125000');
    
    await clickButton(page, 'Create');
    
    await waitForToast(page, 'Scope amendment created');
    await expect(page.locator('text=Pending')).toBeVisible();
  });

  test('Test 8.3: Approve Scope Amendment', async ({ authenticatedPage: page }) => {
    await page.goto('/scope-amendments');
    
    const pendingAmendment = page.locator('text=Pending').first();
    await pendingAmendment.click();
    
    await clickButton(page, 'Approve');
    await fillFormField(page, 'approvalNotes', 'Approved as requested');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Scope amendment approved');
    await expect(page.locator('text=Approved')).toBeVisible();
  });

  test('Test 8.4: Client Approval of Scope Amendment', async ({ authenticatedPage: page, page: clientPage }) => {
    await page.goto('/scope-amendments');
    
    const approvedAmendment = page.locator('text=Approved').first();
    await approvedAmendment.click();
    
    const amendmentId = await page.locator('[data-amendment-id]').first().getAttribute('data-amendment-id');
    
    await clientPage.goto(`/attorney/scope-amendment/${amendmentId}`);
    
    await clickButton(clientPage, 'Approve');
    await fillFormField(clientPage, 'comments', 'Agreed to changes');
    await clickButton(clientPage, 'Confirm');
    
    await waitForToast(clientPage, 'Scope amendment approved');
    
    await page.reload();
    await expect(page.locator('text=Client Approved')).toBeVisible();
  });

  test('Test 8.5: Reject Scope Amendment', async ({ authenticatedPage: page }) => {
    await page.goto('/scope-amendments');
    
    const pendingAmendment = page.locator('text=Pending').first();
    await pendingAmendment.click();
    
    await clickButton(page, 'Reject');
    await fillFormField(page, 'rejectionReason', 'Not justified');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Scope amendment rejected');
    await expect(page.locator('text=Rejected')).toBeVisible();
  });

  test('Test 8.6: View Scope Amendment History', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'View Scope Amendments');
    
    await expect(page.locator('text=Amendment History')).toBeVisible();
    await expect(page.locator('[data-amendment-id]')).toHaveCount(3);
  });
});
