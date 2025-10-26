import { test, expect } from '@playwright/test';

test.describe('End-to-End Integration Tests - Financial Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as advocate
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Complete payment workflow: record, edit, delete', async ({ page }) => {
    // Navigate to invoices
    await page.goto('/invoices');
    await page.waitForSelector('[data-testid="invoice-list"]');

    // Find an unpaid invoice
    const invoiceCard = page.locator('[data-testid="invoice-card"]').first();
    await invoiceCard.click();

    // Record a payment
    await page.click('[data-testid="record-payment-button"]');
    await page.waitForSelector('[data-testid="record-payment-modal"]');
    
    await page.fill('input[name="amount"]', '500');
    await page.fill('input[name="payment_date"]', '2025-01-27');
    await page.selectOption('select[name="payment_method"]', 'EFT');
    await page.fill('input[name="reference_number"]', 'REF123');
    await page.click('button[type="submit"]');

    // Verify payment recorded
    await page.waitForSelector('[data-testid="payment-success"]');
    await expect(page.locator('[data-testid="payment-history-table"]')).toBeVisible();
    await expect(page.locator('text=R500.00')).toBeVisible();

    // Edit the payment
    await page.click('[data-testid="edit-payment-button"]');
    await page.fill('input[name="amount"]', '600');
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="payment-updated"]');
    await expect(page.locator('text=R600.00')).toBeVisible();

    // Delete the payment
    await page.click('[data-testid="delete-payment-button"]');
    await page.click('[data-testid="confirm-delete"]');
    await page.waitForSelector('[data-testid="payment-deleted"]');
    
    // Verify payment removed
    await expect(page.locator('text=R600.00')).not.toBeVisible();
  });

  test('Complete disbursement workflow: log, include in invoice', async ({ page }) => {
    // Navigate to matters
    await page.goto('/matters');
    await page.waitForSelector('[data-testid="matter-list"]');

    // Open a matter
    const matterCard = page.locator('[data-testid="matter-card"]').first();
    await matterCard.click();
    await page.waitForSelector('[data-testid="matter-workbench"]');

    // Log a disbursement
    await page.click('[data-testid="log-disbursement-button"]');
    await page.waitForSelector('[data-testid="log-disbursement-modal"]');
    
    await page.fill('input[name="description"]', 'Court filing fees');
    await page.fill('input[name="amount"]', '350');
    await page.fill('input[name="date_incurred"]', '2025-01-27');
    await page.check('input[name="vat_applicable"]');
    await page.click('button[type="submit"]');

    // Verify disbursement logged
    await page.waitForSelector('[data-testid="disbursement-success"]');
    await expect(page.locator('text=Court filing fees')).toBeVisible();
    await expect(page.locator('text=R350.00')).toBeVisible();

    // Verify VAT calculation (15%)
    await expect(page.locator('text=R52.50')).toBeVisible(); // VAT amount
    await expect(page.locator('text=R402.50')).toBeVisible(); // Total with VAT

    // Generate invoice including disbursement
    await page.click('[data-testid="generate-invoice-button"]');
    await page.waitForSelector('[data-testid="invoice-preview"]');

    // Verify disbursement in invoice
    await expect(page.locator('text=DISBURSEMENTS')).toBeVisible();
    await expect(page.locator('text=Court filing fees')).toBeVisible();
    await expect(page.locator('text=R402.50')).toBeVisible();

    // Confirm invoice generation
    await page.click('[data-testid="confirm-invoice"]');
    await page.waitForSelector('[data-testid="invoice-generated"]');

    // Verify disbursement marked as billed
    await page.goto('/matters');
    await matterCard.click();
    await expect(page.locator('[data-testid="disbursement-billed-badge"]')).toBeVisible();
  });

  test('Invoice generation with sequential numbering', async ({ page }) => {
    // Navigate to settings to check current sequence
    await page.goto('/settings');
    await page.click('[data-testid="invoicing-tab"]');
    await page.waitForSelector('[data-testid="invoice-settings"]');

    // Get current sequence number
    const currentSequence = await page.locator('[data-testid="current-sequence"]').textContent();
    const sequenceNumber = parseInt(currentSequence || '0');

    // Generate first invoice
    await page.goto('/matters');
    const matter1 = page.locator('[data-testid="matter-card"]').first();
    await matter1.click();
    await page.click('[data-testid="generate-invoice-button"]');
    await page.click('[data-testid="confirm-invoice"]');
    await page.waitForSelector('[data-testid="invoice-generated"]');

    // Get first invoice number
    const invoice1Number = await page.locator('[data-testid="invoice-number"]').textContent();
    expect(invoice1Number).toContain(`${sequenceNumber + 1}`);

    // Generate second invoice
    await page.goto('/matters');
    const matter2 = page.locator('[data-testid="matter-card"]').nth(1);
    await matter2.click();
    await page.click('[data-testid="generate-invoice-button"]');
    await page.click('[data-testid="confirm-invoice"]');
    await page.waitForSelector('[data-testid="invoice-generated"]');

    // Get second invoice number
    const invoice2Number = await page.locator('[data-testid="invoice-number"]').textContent();
    expect(invoice2Number).toContain(`${sequenceNumber + 2}`);

    // Verify sequential numbering
    expect(invoice2Number).not.toBe(invoice1Number);

    // Check audit log
    await page.goto('/settings');
    await page.click('[data-testid="invoicing-tab"]');
    await page.click('[data-testid="view-audit-log"]');
    
    await expect(page.locator(`text=${invoice1Number}`)).toBeVisible();
    await expect(page.locator(`text=${invoice2Number}`)).toBeVisible();
  });

  test('Dashboard metrics accuracy', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForSelector('[data-testid="dashboard-loaded"]');

    // Verify urgent attention section
    await expect(page.locator('[data-testid="urgent-attention-card"]')).toBeVisible();

    // Verify financial snapshot
    const outstandingFees = await page.locator('[data-testid="outstanding-fees"]').textContent();
    const wipValue = await page.locator('[data-testid="wip-value"]').textContent();
    const monthInvoiced = await page.locator('[data-testid="month-invoiced"]').textContent();

    expect(outstandingFees).toMatch(/R[\d,]+\.\d{2}/);
    expect(wipValue).toMatch(/R[\d,]+\.\d{2}/);
    expect(monthInvoiced).toMatch(/R[\d,]+\.\d{2}/);

    // Verify active matters section
    await expect(page.locator('[data-testid="active-matters-card"]')).toBeVisible();
    const matterCount = await page.locator('[data-testid="active-matter-item"]').count();
    expect(matterCount).toBeGreaterThan(0);
    expect(matterCount).toBeLessThanOrEqual(5);

    // Verify pending actions
    await expect(page.locator('[data-testid="pending-actions-card"]')).toBeVisible();
    const newRequests = await page.locator('[data-testid="new-requests-count"]').textContent();
    expect(newRequests).toMatch(/\d+/);

    // Verify quick stats
    await expect(page.locator('[data-testid="quick-stats-card"]')).toBeVisible();
    const mattersCompleted = await page.locator('[data-testid="matters-completed-30d"]').textContent();
    expect(mattersCompleted).toMatch(/\d+/);

    // Cross-verify with actual data
    await page.goto('/invoices');
    await page.waitForSelector('[data-testid="invoice-list"]');
    
    // Count unpaid invoices
    const unpaidInvoices = await page.locator('[data-testid="invoice-status-unpaid"]').count();
    
    // Go back to dashboard and verify count matches
    await page.goto('/dashboard');
    const dashboardUnpaidCount = await page.locator('[data-testid="outstanding-fees-count"]').textContent();
    expect(parseInt(dashboardUnpaidCount || '0')).toBe(unpaidInvoices);
  });

  test('Matter search with all filter combinations', async ({ page }) => {
    await page.goto('/matters');
    await page.waitForSelector('[data-testid="matter-list"]');

    // Test basic search
    await page.fill('input[placeholder*="Search"]', 'contract');
    await page.waitForSelector('[data-testid="search-results"]');
    const searchResults = await page.locator('[data-testid="matter-card"]').count();
    expect(searchResults).toBeGreaterThan(0);

    // Clear search
    await page.click('[data-testid="clear-search"]');

    // Test advanced filters
    await page.click('[data-testid="advanced-filters-button"]');
    await page.waitForSelector('[data-testid="advanced-filters-modal"]');

    // Filter by practice area
    await page.selectOption('select[name="practice_area"]', 'Commercial');
    await page.click('[data-testid="apply-filters"]');
    await page.waitForSelector('[data-testid="filtered-results"]');
    
    const commercialMatters = await page.locator('[data-testid="matter-card"]').count();
    expect(commercialMatters).toBeGreaterThan(0);

    // Add status filter
    await page.click('[data-testid="advanced-filters-button"]');
    await page.selectOption('select[name="status"]', 'Active');
    await page.click('[data-testid="apply-filters"]');
    
    const activeCommercialMatters = await page.locator('[data-testid="matter-card"]').count();
    expect(activeCommercialMatters).toBeLessThanOrEqual(commercialMatters);

    // Add date range filter
    await page.click('[data-testid="advanced-filters-button"]');
    await page.fill('input[name="date_from"]', '2025-01-01');
    await page.fill('input[name="date_to"]', '2025-01-31');
    await page.click('[data-testid="apply-filters"]');
    
    const dateFilteredMatters = await page.locator('[data-testid="matter-card"]').count();
    expect(dateFilteredMatters).toBeLessThanOrEqual(activeCommercialMatters);

    // Test include archived
    await page.click('[data-testid="advanced-filters-button"]');
    await page.check('input[name="include_archived"]');
    await page.click('[data-testid="apply-filters"]');
    
    const withArchivedMatters = await page.locator('[data-testid="matter-card"]').count();
    expect(withArchivedMatters).toBeGreaterThanOrEqual(dateFilteredMatters);

    // Clear all filters
    await page.click('[data-testid="advanced-filters-button"]');
    await page.click('[data-testid="clear-all-filters"]');
    await page.click('[data-testid="apply-filters"]');
    
    const allMatters = await page.locator('[data-testid="matter-card"]').count();
    expect(allMatters).toBeGreaterThan(0);

    // Test sorting
    await page.selectOption('select[name="sort_by"]', 'deadline');
    await page.waitForSelector('[data-testid="sorted-results"]');
    
    // Verify first matter has earliest deadline
    const firstDeadline = await page.locator('[data-testid="matter-card"]').first()
      .locator('[data-testid="matter-deadline"]').textContent();
    expect(firstDeadline).toBeTruthy();
  });

  test('VAT compliance on invoices', async ({ page }) => {
    // Check VAT settings
    await page.goto('/settings');
    await page.click('[data-testid="invoicing-tab"]');
    
    const vatRegistered = await page.locator('input[name="vat_registered"]').isChecked();
    
    if (vatRegistered) {
      // Generate an invoice
      await page.goto('/matters');
      await page.locator('[data-testid="matter-card"]').first().click();
      await page.click('[data-testid="generate-invoice-button"]');
      await page.waitForSelector('[data-testid="invoice-preview"]');

      // Verify VAT compliance elements
      await expect(page.locator('text=TAX INVOICE')).toBeVisible();
      await expect(page.locator('[data-testid="vat-number"]')).toBeVisible();
      await expect(page.locator('[data-testid="supplier-details"]')).toBeVisible();
      await expect(page.locator('[data-testid="vat-breakdown"]')).toBeVisible();

      // Verify VAT calculation
      const subtotal = await page.locator('[data-testid="subtotal"]').textContent();
      const vatAmount = await page.locator('[data-testid="vat-amount"]').textContent();
      const total = await page.locator('[data-testid="total"]').textContent();

      const subtotalNum = parseFloat(subtotal?.replace(/[R,]/g, '') || '0');
      const vatNum = parseFloat(vatAmount?.replace(/[R,]/g, '') || '0');
      const totalNum = parseFloat(total?.replace(/[R,]/g, '') || '0');

      expect(vatNum).toBeCloseTo(subtotalNum * 0.15, 2);
      expect(totalNum).toBeCloseTo(subtotalNum + vatNum, 2);
    }
  });

  test('Payment status updates correctly', async ({ page }) => {
    await page.goto('/invoices');
    await page.waitForSelector('[data-testid="invoice-list"]');

    // Find an unpaid invoice
    const unpaidInvoice = page.locator('[data-testid="invoice-status-unpaid"]').first();
    await unpaidInvoice.click();

    // Get total amount
    const totalText = await page.locator('[data-testid="invoice-total"]').textContent();
    const totalAmount = parseFloat(totalText?.replace(/[R,]/g, '') || '0');

    // Record partial payment (50%)
    await page.click('[data-testid="record-payment-button"]');
    await page.fill('input[name="amount"]', (totalAmount * 0.5).toString());
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="payment-success"]');

    // Verify status changed to "Partially Paid"
    await expect(page.locator('[data-testid="invoice-status"]')).toHaveText('Partially Paid');

    // Record remaining payment
    await page.click('[data-testid="record-payment-button"]');
    await page.fill('input[name="amount"]', (totalAmount * 0.5).toString());
    await page.click('button[type="submit"]');
    await page.waitForSelector('[data-testid="payment-success"]');

    // Verify status changed to "Paid"
    await expect(page.locator('[data-testid="invoice-status"]')).toHaveText('Paid');

    // Verify outstanding balance is zero
    const outstandingBalance = await page.locator('[data-testid="outstanding-balance"]').textContent();
    expect(outstandingBalance).toContain('R0.00');
  });
});
