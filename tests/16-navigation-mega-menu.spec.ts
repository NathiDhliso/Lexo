import { test, expect } from '@playwright/test';

test.describe('Navigation & Mega Menu E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('E2E 16.1: Main navigation bar displays correctly', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /pro forma/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /matters/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /invoices/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
  });

  test('E2E 16.2: Pro Forma mega menu displays with proper sections', async ({ page }) => {
    const proFormaLink = page.getByRole('link', { name: /pro forma/i });
    await proFormaLink.hover();
    
    await page.waitForTimeout(300);
    
    await expect(page.getByRole('menu', { name: /pro forma menu/i })).toBeVisible();
    
    await expect(page.getByText('Actions', { exact: true })).toBeVisible();
    await expect(page.getByText('Features', { exact: true })).toBeVisible();
    
    await expect(page.getByText('Create Pro Forma')).toBeVisible();
    await expect(page.getByText('View All Requests')).toBeVisible();
    await expect(page.getByText('Attorney Portal Links')).toBeVisible();
    await expect(page.getByText('Rate Cards')).toBeVisible();
  });

  test('E2E 16.3: Matters mega menu displays with proper sections', async ({ page }) => {
    const mattersLink = page.getByRole('link', { name: /matters/i });
    await mattersLink.hover();
    
    await page.waitForTimeout(300);
    
    await expect(page.getByRole('menu', { name: /matters menu/i })).toBeVisible();
    
    await expect(page.getByText('Actions', { exact: true })).toBeVisible();
    await expect(page.getByText('Features', { exact: true })).toBeVisible();
    
    await expect(page.getByText('Create Matter')).toBeVisible();
    await expect(page.getByText('View All Matters')).toBeVisible();
    await expect(page.getByText('Time Entries')).toBeVisible();
    await expect(page.getByText('Documents')).toBeVisible();
    await expect(page.getByText('Scope Amendments')).toBeVisible();
  });

  test('E2E 16.4: Invoicing mega menu displays with proper sections', async ({ page }) => {
    const invoicesLink = page.getByRole('link', { name: /invoices/i });
    await invoicesLink.hover();
    
    await page.waitForTimeout(300);
    
    await expect(page.getByRole('menu', { name: /invoicing menu/i })).toBeVisible();
    
    await expect(page.getByText('Actions', { exact: true })).toBeVisible();
    await expect(page.getByText('Features', { exact: true })).toBeVisible();
    
    await expect(page.getByText('Create Invoice')).toBeVisible();
    await expect(page.getByText('View All Invoices')).toBeVisible();
    await expect(page.getByText('Partner Approval')).toBeVisible();
    await expect(page.getByText('Payment Tracking')).toBeVisible();
  });

  test('E2E 16.5: Mega menu does NOT show duplicate Profile/Settings', async ({ page }) => {
    const proFormaLink = page.getByRole('link', { name: /pro forma/i });
    await proFormaLink.hover();
    
    await page.waitForTimeout(300);
    
    const megaMenu = page.getByRole('menu', { name: /pro forma menu/i });
    await expect(megaMenu).toBeVisible();
    
    const profileInMegaMenu = megaMenu.getByText('Profile', { exact: true });
    await expect(profileInMegaMenu).not.toBeVisible();
    
    const settingsInMegaMenu = megaMenu.getByText('Settings', { exact: true });
    await expect(settingsInMegaMenu).not.toBeVisible();
  });

  test('E2E 16.6: Mega menu items are clickable and navigate correctly', async ({ page }) => {
    const mattersLink = page.getByRole('link', { name: /matters/i });
    await mattersLink.hover();
    
    await page.waitForTimeout(300);
    
    const createMatterButton = page.getByText('Create Matter');
    await expect(createMatterButton).toBeVisible();
    
    await createMatterButton.click();
    
    await expect(page).toHaveURL(/.*matters/);
  });

  test('E2E 16.7: Mega menu displays NEW badges for new features', async ({ page }) => {
    const proFormaLink = page.getByRole('link', { name: /pro forma/i });
    await proFormaLink.hover();
    
    await page.waitForTimeout(300);
    
    const attorneyLinksItem = page.getByText('Attorney Portal Links').locator('..');
    await expect(attorneyLinksItem).toBeVisible();
    
    const newBadge = attorneyLinksItem.getByText('New');
    await expect(newBadge).toBeVisible();
  });

  test('E2E 16.8: Mega menu is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const proFormaLink = page.getByRole('link', { name: /pro forma/i });
    await proFormaLink.hover();
    
    await page.waitForTimeout(300);
    
    const megaMenu = page.getByRole('menu', { name: /pro forma menu/i });
    await expect(megaMenu).toBeVisible();
    
    await expect(page.getByText('Actions', { exact: true })).toBeVisible();
    await expect(page.getByText('Features', { exact: true })).toBeVisible();
  });

  test('E2E 16.9: Mega menu sections have proper spacing and layout', async ({ page }) => {
    const mattersLink = page.getByRole('link', { name: /matters/i });
    await mattersLink.hover();
    
    await page.waitForTimeout(300);
    
    const megaMenu = page.getByRole('menu', { name: /matters menu/i });
    await expect(megaMenu).toBeVisible();
    
    const actionsSection = page.getByText('Actions', { exact: true }).locator('..');
    const boundingBox = await actionsSection.boundingBox();
    
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(200);
    expect(boundingBox!.height).toBeGreaterThan(100);
  });

  test('E2E 16.10: Mega menu footer shows feature count', async ({ page }) => {
    const invoicesLink = page.getByRole('link', { name: /invoices/i });
    await invoicesLink.hover();
    
    await page.waitForTimeout(300);
    
    const megaMenu = page.getByRole('menu', { name: /invoicing menu/i });
    await expect(megaMenu).toBeVisible();
    
    await expect(page.getByText(/features available/i)).toBeVisible();
    await expect(page.getByText(/explore all/i)).toBeVisible();
  });

  test('E2E 16.11: Mega menu closes when clicking outside', async ({ page }) => {
    const proFormaLink = page.getByRole('link', { name: /pro forma/i });
    await proFormaLink.hover();
    
    await page.waitForTimeout(300);
    
    const megaMenu = page.getByRole('menu', { name: /pro forma menu/i });
    await expect(megaMenu).toBeVisible();
    
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);
    
    await expect(megaMenu).not.toBeVisible();
  });

  test('E2E 16.12: All mega menu categories have consistent styling', async ({ page }) => {
    const categories = ['pro forma', 'matters', 'invoices'];
    
    for (const category of categories) {
      const link = page.getByRole('link', { name: new RegExp(category, 'i') });
      await link.hover();
      
      await page.waitForTimeout(300);
      
      const megaMenu = page.getByRole('menu', { name: new RegExp(`${category} menu`, 'i') });
      await expect(megaMenu).toBeVisible();
      
      await expect(page.getByText('Actions', { exact: true })).toBeVisible();
      await expect(page.getByText('Features', { exact: true })).toBeVisible();
      
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
    }
  });
});
