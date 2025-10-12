import { test, expect } from '@playwright/test';

test('Test 0.1: Dashboard is visible after login', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
  await expect(page.locator('text=Welcome to your practice intelligence platform')).toBeVisible();
});

test('Test 0.2: Dashboard displays key metrics', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await expect(page.getByRole('button', { name: 'Pro Formas' })).toBeVisible();
  await expect(page.locator('text=Active Matters')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent Matters', level: 2 })).toBeVisible();
});

  test('Test 0.3: Navigation bar is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('button', { name: 'Core Features menu' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pro Formas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Matters' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Invoices' })).toBeVisible();
  });

  test('Test 0.4: User can navigate to Pro Forma page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Pro Forma' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page.getByRole('heading', { name: 'Pro Forma Requests' })).toBeVisible({ timeout: 5000 });
  });

  test('Test 0.5: User can navigate to Matters page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Matters' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page.getByRole('heading', { name: 'Matters' })).toBeVisible({ timeout: 5000 });
  });

  test('Test 0.6: User can navigate to Invoices page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.getByRole('button', { name: 'Invoices' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible({ timeout: 5000 });
  });
});
