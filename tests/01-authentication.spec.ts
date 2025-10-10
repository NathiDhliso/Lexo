import { test, expect } from '@playwright/test';

test.describe('Authentication & User Management', () => {
  test('Test 1.1: User is authenticated and can access dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=nkosinathi.dhliso')).toBeVisible();
  });

  test('Test 1.2: User can see their email in user menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
    await expect(page.locator('text=nkosinathi.dhliso')).toBeVisible();
  });

  test('Test 1.3: User can access navigation menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('button', { name: 'Core Features menu' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Core Features menu' }).click();
    await page.waitForTimeout(500);
  });

  test.skip('Test 1.4: Password Reset Request', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.skip('Test 1.5: Invalid Login Credentials', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
});
