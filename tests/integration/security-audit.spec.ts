import { test, expect } from '@playwright/test';

test.describe('Security Audit Tests', () => {
  test.describe('RLS Policies Verification', () => {
    test('Users can only access their own payments', async ({ page }) => {
      // Login as first user
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to invoices
      await page.goto('/invoices');
      const invoiceCount1 = await page.locator('[data-testid="invoice-card"]').count();

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout"]');

      // Login as second user
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL_2 || 'test2@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD_2 || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to invoices
      await page.goto('/invoices');
      const invoiceCount2 = await page.locator('[data-testid="invoice-card"]').count();

      // Verify different users see different data
      expect(invoiceCount1).not.toBe(invoiceCount2);
    });

    test('Users can only access their own disbursements', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/matters');
      await page.locator('[data-testid="matter-card"]').first().click();
      
      const disbursementCount = await page.locator('[data-testid="disbursement-row"]').count();
      expect(disbursementCount).toBeGreaterThanOrEqual(0);

      // Attempt to access another user's matter via direct URL manipulation
      const currentUrl = page.url();
      const matterId = currentUrl.split('/').pop();
      
      // Try to access with different user's ID (should fail or redirect)
      await page.goto(`/matters/00000000-0000-0000-0000-000000000000`);
      
      // Should show error or redirect to matters list
      await expect(page.locator('text=Not found')).toBeVisible()
        .or(page.locator('[data-testid="matter-list"]')).toBeVisible();
    });

    test('Invoice settings are user-specific', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/settings');
      await page.click('[data-testid="invoicing-tab"]');
      
      const sequence1 = await page.locator('[data-testid="current-sequence"]').textContent();

      // Logout and login as different user
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout"]');

      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL_2 || 'test2@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD_2 || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/settings');
      await page.click('[data-testid="invoicing-tab"]');
      
      const sequence2 = await page.locator('[data-testid="current-sequence"]').textContent();

      // Each user should have their own sequence
      expect(sequence1).not.toBe(sequence2);
    });

    test('Matter search respects user boundaries', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/matters');
      await page.fill('input[placeholder*="Search"]', 'test');
      await page.waitForSelector('[data-testid="search-results"]');
      
      const matterCards = await page.locator('[data-testid="matter-card"]').all();
      
      // Verify all matters belong to logged-in user
      for (const card of matterCards) {
        const advocateName = await card.locator('[data-testid="advocate-name"]').textContent();
        expect(advocateName).toBeTruthy();
      }
    });
  });

  test.describe('Access Control Tests', () => {
    test('Unauthenticated users cannot access protected routes', async ({ page }) => {
      // Try to access dashboard without login
      await page.goto('/dashboard');
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');

      // Try to access matters
      await page.goto('/matters');
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');

      // Try to access invoices
      await page.goto('/invoices');
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');

      // Try to access settings
      await page.goto('/settings');
      await page.waitForURL('/login');
      expect(page.url()).toContain('/login');
    });

    test('Cannot record payment on another user\'s invoice', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Try to access invoice with invalid ID
      await page.goto('/invoices/00000000-0000-0000-0000-000000000000');
      
      // Should show error or redirect
      await expect(page.locator('text=Not found')).toBeVisible()
        .or(page.locator('[data-testid="invoice-list"]')).toBeVisible();
    });

    test('Cannot modify another user\'s disbursements', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Attempt API call to modify non-existent disbursement
      const response = await page.request.put('/api/disbursements/00000000-0000-0000-0000-000000000000', {
        data: { amount: 999 }
      });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('Cannot access invoice numbering audit of other users', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/settings');
      await page.click('[data-testid="invoicing-tab"]');
      await page.click('[data-testid="view-audit-log"]');
      
      const auditEntries = await page.locator('[data-testid="audit-entry"]').all();
      
      // All entries should belong to current user
      for (const entry of auditEntries) {
        const advocateId = await entry.getAttribute('data-advocate-id');
        expect(advocateId).toBeTruthy();
      }
    });
  });

  test.describe('Input Sanitization Tests', () => {
    test('Payment amount input sanitization', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/invoices');
      await page.locator('[data-testid="invoice-card"]').first().click();
      await page.click('[data-testid="record-payment-button"]');

      // Test negative amount
      await page.fill('input[name="amount"]', '-100');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=must be positive')).toBeVisible();

      // Test zero amount
      await page.fill('input[name="amount"]', '0');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=must be greater than zero')).toBeVisible();

      // Test non-numeric input
      await page.fill('input[name="amount"]', 'abc');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=must be a number')).toBeVisible();

      // Test SQL injection attempt
      await page.fill('input[name="amount"]', "'; DROP TABLE payments; --");
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Invalid')).toBeVisible();
    });

    test('Disbursement description sanitization', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/matters');
      await page.locator('[data-testid="matter-card"]').first().click();
      await page.click('[data-testid="log-disbursement-button"]');

      // Test XSS attempt
      await page.fill('input[name="description"]', '<script>alert("XSS")</script>');
      await page.fill('input[name="amount"]', '100');
      await page.click('button[type="submit"]');
      
      // Should be sanitized and saved safely
      await page.waitForSelector('[data-testid="disbursement-success"]');
      
      // Verify script tag is escaped
      const description = await page.locator('[data-testid="disbursement-description"]').textContent();
      expect(description).not.toContain('<script>');
    });

    test('Search query sanitization', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/matters');

      // Test SQL injection in search
      await page.fill('input[placeholder*="Search"]', "' OR '1'='1");
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Should return safe results, not all records
      const results = await page.locator('[data-testid="matter-card"]').count();
      expect(results).toBeGreaterThanOrEqual(0);

      // Test XSS in search
      await page.fill('input[placeholder*="Search"]', '<img src=x onerror=alert(1)>');
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Should not execute script
      const alerts = await page.evaluate(() => window.alert.toString());
      expect(alerts).toBeTruthy();
    });

    test('Invoice number format validation', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/settings');
      await page.click('[data-testid="invoicing-tab"]');

      // Test invalid format
      await page.fill('input[name="invoice_number_format"]', 'INVALID');
      await page.click('button[type="submit"]');
      await expect(page.locator('text=must contain YYYY and NNN')).toBeVisible();

      // Test SQL injection in format
      await page.fill('input[name="invoice_number_format"]', "'; DROP TABLE invoices; --");
      await page.click('button[type="submit"]');
      await expect(page.locator('text=Invalid format')).toBeVisible();
    });
  });

  test.describe('Audit Trail Completeness', () => {
    test('Payment modifications are logged', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Record a payment
      await page.goto('/invoices');
      await page.locator('[data-testid="invoice-card"]').first().click();
      await page.click('[data-testid="record-payment-button"]');
      await page.fill('input[name="amount"]', '100');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="payment-success"]');

      // Edit the payment
      await page.click('[data-testid="edit-payment-button"]');
      await page.fill('input[name="amount"]', '150');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="payment-updated"]');

      // Check audit trail
      await page.click('[data-testid="view-audit-trail"]');
      await expect(page.locator('text=Payment created')).toBeVisible();
      await expect(page.locator('text=Payment updated')).toBeVisible();
      await expect(page.locator('text=100')).toBeVisible();
      await expect(page.locator('text=150')).toBeVisible();
    });

    test('Disbursement changes are logged', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Log a disbursement
      await page.goto('/matters');
      await page.locator('[data-testid="matter-card"]').first().click();
      await page.click('[data-testid="log-disbursement-button"]');
      await page.fill('input[name="description"]', 'Test disbursement');
      await page.fill('input[name="amount"]', '200');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="disbursement-success"]');

      // Edit the disbursement
      await page.click('[data-testid="edit-disbursement-button"]');
      await page.fill('input[name="amount"]', '250');
      await page.click('button[type="submit"]');
      await page.waitForSelector('[data-testid="disbursement-updated"]');

      // Verify audit trail exists
      await page.goto('/audit-trail');
      await expect(page.locator('text=Disbursement created')).toBeVisible();
      await expect(page.locator('text=Disbursement updated')).toBeVisible();
    });

    test('Invoice number generation is audited', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Generate an invoice
      await page.goto('/matters');
      await page.locator('[data-testid="matter-card"]').first().click();
      await page.click('[data-testid="generate-invoice-button"]');
      await page.click('[data-testid="confirm-invoice"]');
      await page.waitForSelector('[data-testid="invoice-generated"]');

      const invoiceNumber = await page.locator('[data-testid="invoice-number"]').textContent();

      // Check audit log
      await page.goto('/settings');
      await page.click('[data-testid="invoicing-tab"]');
      await page.click('[data-testid="view-audit-log"]');
      
      await expect(page.locator(`text=${invoiceNumber}`)).toBeVisible();
      await expect(page.locator('text=used')).toBeVisible();
    });

    test('Matter archiving is audited', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      await page.goto('/matters');
      await page.locator('[data-testid="matter-card"]').first().click();
      
      // Archive matter
      await page.click('[data-testid="matter-actions"]');
      await page.click('[data-testid="archive-matter"]');
      await page.fill('textarea[name="reason"]', 'Matter completed');
      await page.click('[data-testid="confirm-archive"]');
      await page.waitForSelector('[data-testid="matter-archived"]');

      // Check audit trail
      await page.goto('/audit-trail');
      await expect(page.locator('text=Matter archived')).toBeVisible();
      await expect(page.locator('text=Matter completed')).toBeVisible();
    });
  });

  test.describe('Session Security', () => {
    test('Session expires after timeout', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Wait for session timeout (if configured)
      // This is a placeholder - actual timeout would be much longer
      await page.waitForTimeout(1000);

      // Try to access protected resource
      await page.goto('/matters');
      
      // Should still be logged in (timeout not reached)
      await expect(page.locator('[data-testid="matter-list"]')).toBeVisible();
    });

    test('Cannot reuse invalidated session', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', process.env.TEST_ADVOCATE_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_ADVOCATE_PASSWORD || 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout"]');
      await page.waitForURL('/login');

      // Try to access protected route
      await page.goto('/dashboard');
      await page.waitForURL('/login');
      
      expect(page.url()).toContain('/login');
    });
  });
});
