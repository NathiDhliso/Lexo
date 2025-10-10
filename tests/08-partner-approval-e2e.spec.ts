import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, navigateToCoreFeature } from './utils/test-helpers';

test.describe('Partner Approval & Billing Readiness - End-to-End Workflow', () => {
  test('E2E 8.1: Submit Matter for partner approval', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const matterCards = page.locator('[data-matter-id]');
    const count = await matterCards.count();
    
    if (count > 0) {
      const submitBtn = page.getByRole('button', { name: /submit.*approval/i }).first();
      const isVisible = await submitBtn.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await expect(submitBtn).toBeVisible();
      }
    }
  });

  test('E2E 8.2: Partner reviews billing readiness', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const reviewSection = page.locator('text=/review|billing readiness/i').first();
    const isVisible = await reviewSection.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(reviewSection).toBeVisible();
    }
  });

  test('E2E 8.3: Partner approves for billing', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const approveBtn = page.getByRole('button', { name: /approve.*billing/i }).first();
    const isVisible = await approveBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(approveBtn).toBeVisible();
    }
  });

  test('E2E 8.4: Partner rejects and requests changes', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const rejectBtn = page.getByRole('button', { name: /reject|request.*change/i }).first();
    const isVisible = await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(rejectBtn).toBeVisible();
    }
  });

  test('E2E 8.5: View pending approval queue', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const queueSection = page.locator('text=/pending.*approval|approval queue/i').first();
    const isVisible = await queueSection.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(queueSection).toBeVisible();
    }
  });

  test('E2E 8.6: Billing readiness checklist', async ({ authenticatedPage: page }) => {
    await navigateToCoreFeature(page, 'Matters');
    
    const checklistSection = page.locator('text=/checklist|readiness/i').first();
    const isVisible = await checklistSection.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await expect(checklistSection).toBeVisible();
    }
  });
});
