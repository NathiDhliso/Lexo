import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast } from './utils/test-helpers';

test.describe('Partner Approval & Billing Readiness', () => {
  test('Test 9.1: Submit Matter for Partner Approval', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Submit for Approval');
    
    await fillFormField(page, 'billingNotes', 'Work completed as per agreement');
    await clickButton(page, 'Submit');
    
    await waitForToast(page, 'Submitted for approval');
    await expect(page.locator('text=Review')).toBeVisible();
  });

  test('Test 9.2: Partner Approves Billing', async ({ authenticatedPage: page }) => {
    await page.goto('/partner/approvals');
    
    const pendingMatter = page.locator('[data-matter-status="review"]').first();
    await pendingMatter.click();
    
    await clickButton(page, 'Approve for Billing');
    await fillFormField(page, 'approvalNotes', 'Approved for billing');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Matter approved for billing');
    await expect(page.locator('text=Ready to Bill')).toBeVisible();
  });

  test('Test 9.3: Partner Rejects Billing', async ({ authenticatedPage: page }) => {
    await page.goto('/partner/approvals');
    
    const pendingMatter = page.locator('[data-matter-status="review"]').first();
    await pendingMatter.click();
    
    await clickButton(page, 'Reject');
    await fillFormField(page, 'rejectionReason', 'Need more documentation');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Matter rejected');
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('Test 9.4: View Pending Approvals', async ({ authenticatedPage: page }) => {
    await page.goto('/partner/approvals');
    
    await expect(page.locator('text=Pending Approvals')).toBeVisible();
    await expect(page.locator('[data-matter-status="review"]')).toHaveCount(5);
  });

  test('Test 9.5: Filter Pending Approvals by Date', async ({ authenticatedPage: page }) => {
    await page.goto('/partner/approvals');
    
    await fillFormField(page, 'startDate', '2025-01-01');
    await fillFormField(page, 'endDate', '2025-01-31');
    await clickButton(page, 'Filter');
    
    await expect(page.locator('[data-matter-status="review"]')).toHaveCount(3);
  });

  test('Test 10.1: Check Billing Readiness', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Check Billing Readiness');
    
    await expect(page.locator('text=Billing Readiness Checklist')).toBeVisible();
    await expect(page.locator('text=Unbilled work exists')).toBeVisible();
    await expect(page.locator('text=Client information complete')).toBeVisible();
    await expect(page.locator('text=Engagement agreement signed')).toBeVisible();
    await expect(page.locator('text=Partner approval obtained')).toBeVisible();
  });

  test('Test 10.2: Mark Matter Ready to Bill', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Mark Ready to Bill');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Matter marked ready to bill');
    await expect(page.locator('text=Ready to Bill')).toBeVisible();
  });

  test('Test 10.3: View Billing Pipeline', async ({ authenticatedPage: page }) => {
    await page.goto('/billing/pipeline');
    
    await expect(page.locator('text=Billing Pipeline')).toBeVisible();
    await expect(page.locator('[data-matter-status="ready_to_bill"]')).toHaveCount(5);
    await expect(page.locator('text=Total Pipeline Value')).toBeVisible();
  });

  test('Test 10.4: Filter Billing Pipeline by Client', async ({ authenticatedPage: page }) => {
    await page.goto('/billing/pipeline');
    
    await fillFormField(page, 'clientFilter', 'ABC Corporation');
    await clickButton(page, 'Filter');
    
    await expect(page.locator('text=ABC Corporation')).toBeVisible();
  });

  test('Test 10.5: Sort Billing Pipeline by Amount', async ({ authenticatedPage: page }) => {
    await page.goto('/billing/pipeline');
    
    await clickButton(page, 'Sort by Amount');
    
    const amounts = await page.locator('[data-wip-amount]').allTextContents();
    const numericAmounts = amounts.map(a => parseFloat(a.replace(/[^0-9.]/g, '')));
    
    for (let i = 1; i < numericAmounts.length; i++) {
      expect(numericAmounts[i - 1]).toBeGreaterThanOrEqual(numericAmounts[i]);
    }
  });
});
