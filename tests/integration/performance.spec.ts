import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as advocate
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Dashboard loads within 2 seconds', async ({ page }) => {
    const startTime = performance.now();
    
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { timeout: 5000 });
    
    const endTime = performance.now();
    const loadTime = (endTime - startTime) / 1000;
    
    console.log(`Dashboard load time: ${loadTime.toFixed(2)}s`);
    expect(loadTime).toBeLessThan(2);
  });

  test('Matter search responds within 1 second', async ({ page }) => {
    await page.goto('/matters');
    await page.waitForLoadState('networkidle');
    
    const startTime = performance.now();
    
    await page.fill('input[placeholder*="Search"]', 'test matter');
    await page.waitForSelector('[data-testid="search-results"]', { timeout: 2000 });
    
    const endTime = performance.now();
    const searchTime = (endTime - startTime) / 1000;
    
    console.log(`Search response time: ${searchTime.toFixed(2)}s`);
    expect(searchTime).toBeLessThan(1);
  });

  test('Invoice list loads efficiently with pagination', async ({ page }) => {
    await page.goto('/invoices');
    
    const startTime = performance.now();
    await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 5000 });
    const endTime = performance.now();
    
    const loadTime = (endTime - startTime) / 1000;
    console.log(`Invoice list load time: ${loadTime.toFixed(2)}s`);
    expect(loadTime).toBeLessThan(2);
  });

  test('Payment recording completes within 3 seconds', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForSelector('[data-testid="invoice-card"]');
    
    // Click first invoice
    await page.click('[data-testid="invoice-card"]:first-child');
    await page.waitForSelector('[data-testid="record-payment-button"]');
    
    const startTime = performance.now();
    
    await page.click('[data-testid="record-payment-button"]');
    await page.fill('input[name="amount"]', '100');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="payment-success"]', { timeout: 5000 });
    
    const endTime = performance.now();
    const recordTime = (endTime - startTime) / 1000;
    
    console.log(`Payment recording time: ${recordTime.toFixed(2)}s`);
    expect(recordTime).toBeLessThan(3);
  });

  test('Disbursement logging completes within 2 seconds', async ({ page }) => {
    await page.goto('/matters');
    await page.click('[data-testid="matter-card"]:first-child');
    await page.waitForSelector('[data-testid="log-disbursement-button"]');
    
    const startTime = performance.now();
    
    await page.click('[data-testid="log-disbursement-button"]');
    await page.fill('input[name="description"]', 'Court fees');
    await page.fill('input[name="amount"]', '500');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="disbursement-success"]', { timeout: 4000 });
    
    const endTime = performance.now();
    const logTime = (endTime - startTime) / 1000;
    
    console.log(`Disbursement logging time: ${logTime.toFixed(2)}s`);
    expect(logTime).toBeLessThan(2);
  });

  test('Advanced filters apply within 1 second', async ({ page }) => {
    await page.goto('/matters');
    await page.click('[data-testid="advanced-filters-button"]');
    await page.waitForSelector('[data-testid="advanced-filters-modal"]');
    
    const startTime = performance.now();
    
    await page.selectOption('select[name="practice_area"]', 'Commercial');
    await page.selectOption('select[name="status"]', 'Active');
    await page.click('button[data-testid="apply-filters"]');
    await page.waitForSelector('[data-testid="filtered-results"]', { timeout: 2000 });
    
    const endTime = performance.now();
    const filterTime = (endTime - startTime) / 1000;
    
    console.log(`Filter application time: ${filterTime.toFixed(2)}s`);
    expect(filterTime).toBeLessThan(1);
  });
});

test.describe('Large Dataset Performance', () => {
  test.skip('Test with 1000+ matters (requires data seeding)', async ({ page }) => {
    // This test should be run with seeded data
    await page.goto('/matters');
    
    const startTime = performance.now();
    await page.waitForSelector('[data-testid="matter-list"]', { timeout: 10000 });
    const endTime = performance.now();
    
    const loadTime = (endTime - startTime) / 1000;
    console.log(`Large dataset load time: ${loadTime.toFixed(2)}s`);
    expect(loadTime).toBeLessThan(3);
  });

  test.skip('Test with 5000+ invoices (requires data seeding)', async ({ page }) => {
    await page.goto('/invoices');
    
    const startTime = performance.now();
    await page.waitForSelector('[data-testid="invoice-list"]', { timeout: 10000 });
    const endTime = performance.now();
    
    const loadTime = (endTime - startTime) / 1000;
    console.log(`Large invoice dataset load time: ${loadTime.toFixed(2)}s`);
    expect(loadTime).toBeLessThan(3);
  });
});
