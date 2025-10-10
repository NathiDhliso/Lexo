import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown } from './utils/test-helpers';

test.describe('End-to-End Workflows', () => {
  test('E2E Test 1: Complete Standard Workflow', async ({ authenticatedPage: page, page: clientPage }) => {
    await page.goto('/proforma');
    await clickButton(page, 'New Pro Forma');
    await fillFormField(page, 'clientName', 'E2E Test Client');
    await fillFormField(page, 'clientEmail', 'e2e@client.com');
    await fillFormField(page, 'matterDescription', 'E2E Test Matter');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    const proformaId = await page.locator('[data-proforma-id]').first().getAttribute('data-proforma-id');
    
    await clientPage.goto(`/attorney/proforma/${proformaId}`);
    await clickButton(clientPage, 'Accept');
    await clickButton(clientPage, 'Confirm');
    await waitForToast(clientPage);
    
    await page.reload();
    await clickButton(page, 'Create Engagement Agreement');
    await fillFormField(page, 'termsAndConditions', 'Standard terms');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    const agreementId = await page.locator('[data-agreement-id]').first().getAttribute('data-agreement-id');
    
    await clientPage.goto(`/attorney/engagement/${agreementId}`);
    await clickButton(clientPage, 'Sign Agreement');
    const canvas = clientPage.locator('canvas');
    await canvas.click({ position: { x: 50, y: 50 } });
    await clickButton(clientPage, 'Sign');
    await waitForToast(clientPage);
    
    await page.goto(`/engagement-agreements/${agreementId}`);
    await clickButton(page, 'Sign as Advocate');
    const advocateCanvas = page.locator('canvas');
    await advocateCanvas.click({ position: { x: 50, y: 50 } });
    await clickButton(page, 'Sign');
    await waitForToast(page);
    
    await clickButton(page, 'Convert to Matter');
    await fillFormField(page, 'matterTitle', 'E2E Matter');
    await clickButton(page, 'Create Matter');
    await waitForToast(page);
    
    await clickButton(page, 'Create Retainer');
    await selectDropdown(page, 'retainerType', 'Project');
    await fillFormField(page, 'retainerAmount', '50000');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'Deposit Funds');
    await fillFormField(page, 'amount', '50000');
    await fillFormField(page, 'reference', 'E2E-DEPOSIT');
    await clickButton(page, 'Deposit');
    await waitForToast(page);
    
    await clickButton(page, 'Add Time Entry');
    await fillFormField(page, 'hours', '10');
    await fillFormField(page, 'hourlyRate', '2500');
    await fillFormField(page, 'description', 'Legal work');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await clickButton(page, 'Add Expense');
    await fillFormField(page, 'amount', '1000');
    await selectDropdown(page, 'category', 'Travel');
    await fillFormField(page, 'description', 'Travel');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await clickButton(page, 'Submit for Approval');
    await fillFormField(page, 'billingNotes', 'Ready for billing');
    await clickButton(page, 'Submit');
    await waitForToast(page);
    
    await page.goto('/partner/approvals');
    const pendingMatter = page.locator('[data-matter-status="review"]').first();
    await pendingMatter.click();
    await clickButton(page, 'Approve for Billing');
    await clickButton(page, 'Confirm');
    await waitForToast(page);
    
    await clickButton(page, 'Generate Invoice');
    await selectDropdown(page, 'invoiceType', 'Final');
    await clickButton(page, 'Generate');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    const invoiceId = await page.locator('[data-invoice-id]').first().getAttribute('data-invoice-id');
    
    await clientPage.goto(`/attorney/invoices/${invoiceId}`);
    await clickButton(clientPage, 'Record Payment');
    await fillFormField(clientPage, 'amount', '26000');
    await clickButton(clientPage, 'Record');
    await waitForToast(clientPage);
    
    await page.goto(`/invoices/${invoiceId}`);
    await expect(page.locator('text=Paid')).toBeVisible();
    
    await page.goto('/audit-trail');
    await expect(page.locator('text=proforma_created')).toBeVisible();
    await expect(page.locator('text=matter_created')).toBeVisible();
    await expect(page.locator('text=invoice_generated')).toBeVisible();
    await expect(page.locator('text=payment_received')).toBeVisible();
  });

  test('E2E Test 2: Urgent Matter Workflow', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    await clickButton(page, 'New Urgent Matter');
    
    await fillFormField(page, 'matterTitle', 'Urgent Court Matter');
    await fillFormField(page, 'clientName', 'Urgent Client');
    await fillFormField(page, 'clientEmail', 'urgent@client.com');
    await page.check('input[name="isUrgent"]');
    await fillFormField(page, 'urgencyReason', 'Court date tomorrow');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await expect(page.locator('text=Retainer required')).toBeVisible();
    
    await clickButton(page, 'Create Retainer');
    await selectDropdown(page, 'retainerType', 'Emergency');
    await fillFormField(page, 'retainerAmount', '25000');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'Deposit Funds');
    await fillFormField(page, 'amount', '25000');
    await fillFormField(page, 'reference', 'URGENT-DEPOSIT');
    await clickButton(page, 'Deposit');
    await waitForToast(page);
    
    await clickButton(page, 'Add Time Entry');
    await fillFormField(page, 'hours', '8');
    await fillFormField(page, 'hourlyRate', '3000');
    await fillFormField(page, 'description', 'Emergency court preparation');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await clickButton(page, 'Generate Invoice');
    await selectDropdown(page, 'invoiceType', 'Interim');
    await clickButton(page, 'Generate');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    await clickButton(page, 'Record Payment');
    await fillFormField(page, 'amount', '24000');
    await clickButton(page, 'Record');
    await waitForToast(page);
    
    await expect(page.locator('text=Paid')).toBeVisible();
  });

  test('E2E Test 3: Dispute Resolution Workflow', async ({ authenticatedPage: page, page: clientPage }) => {
    await page.goto('/invoices');
    const sentInvoice = page.locator('[data-invoice-status="sent"]').first();
    await sentInvoice.click();
    
    const invoiceId = await page.locator('[data-invoice-id]').first().getAttribute('data-invoice-id');
    
    await clientPage.goto(`/attorney/invoices/${invoiceId}`);
    await clickButton(clientPage, 'Dispute Invoice');
    await selectDropdown(clientPage, 'disputeType', 'Amount Incorrect');
    await fillFormField(clientPage, 'disputedAmount', '5000');
    await fillFormField(clientPage, 'reason', 'Hours not agreed');
    await clickButton(clientPage, 'Submit');
    await waitForToast(clientPage);
    
    await page.goto('/disputes');
    const dispute = page.locator('[data-dispute-status="open"]').first();
    await dispute.click();
    
    await clickButton(page, 'Respond');
    await fillFormField(page, 'response', 'Hours were discussed');
    await clickButton(page, 'Submit Response');
    await waitForToast(page);
    
    await clickButton(page, 'Issue Credit Note');
    await fillFormField(page, 'amount', '2500');
    await fillFormField(page, 'reason', 'Goodwill credit');
    await clickButton(page, 'Confirm');
    await waitForToast(page);
    
    await page.goto('/credit-notes');
    const creditNote = page.locator('[data-credit-note-status="issued"]').first();
    await creditNote.click();
    
    await clickButton(page, 'Apply to Invoice');
    await clickButton(page, 'Confirm');
    await waitForToast(page);
    
    await page.goto(`/invoices/${invoiceId}`);
    const adjustedTotal = await page.locator('[data-invoice-total]').textContent();
    expect(adjustedTotal).toContain('2,500');
    
    await clickButton(page, 'Record Payment');
    const amount = adjustedTotal?.replace(/[^0-9.]/g, '') || '0';
    await fillFormField(page, 'amount', amount);
    await clickButton(page, 'Record');
    await waitForToast(page);
    
    await expect(page.locator('text=Paid')).toBeVisible();
    
    await page.goto('/disputes');
    await expect(page.locator('text=Resolved')).toBeVisible();
  });

  test('E2E Test 4: Scope Amendment Workflow', async ({ authenticatedPage: page, page: clientPage }) => {
    await page.goto('/matters');
    await clickButton(page, 'New Matter');
    await fillFormField(page, 'matterTitle', 'Scope Test Matter');
    await fillFormField(page, 'clientName', 'Scope Client');
    await fillFormField(page, 'agreedFeeCap', '30000');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    for (let i = 0; i < 15; i++) {
      await clickButton(page, 'Add Time Entry');
      await fillFormField(page, 'hours', '2');
      await fillFormField(page, 'hourlyRate', '2500');
      await fillFormField(page, 'description', `Work ${i + 1}`);
      await clickButton(page, 'Save');
      await waitForToast(page);
    }
    
    await page.goto('/scope-amendments');
    const autoAmendment = page.locator('[data-amendment-type="scope_increase"]').first();
    await autoAmendment.click();
    
    await clickButton(page, 'Approve');
    await fillFormField(page, 'approvalNotes', 'Approved');
    await clickButton(page, 'Confirm');
    await waitForToast(page);
    
    const amendmentId = await page.locator('[data-amendment-id]').first().getAttribute('data-amendment-id');
    
    await clientPage.goto(`/attorney/scope-amendment/${amendmentId}`);
    await clickButton(clientPage, 'Approve');
    await fillFormField(clientPage, 'comments', 'Agreed');
    await clickButton(clientPage, 'Confirm');
    await waitForToast(clientPage);
    
    await page.reload();
    await expect(page.locator('text=Client Approved')).toBeVisible();
  });

  test('E2E Test 5: Multi-Invoice Matter Workflow', async ({ authenticatedPage: page }) => {
    await page.goto('/matters');
    const matter = page.locator('[data-matter-id]').first();
    await matter.click();
    
    await clickButton(page, 'Generate Invoice');
    await selectDropdown(page, 'invoiceType', 'Interim');
    await clickButton(page, 'Generate');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    await clickButton(page, 'Add Time Entry');
    await fillFormField(page, 'hours', '5');
    await fillFormField(page, 'hourlyRate', '2500');
    await clickButton(page, 'Save');
    await waitForToast(page);
    
    await clickButton(page, 'Generate Invoice');
    await selectDropdown(page, 'invoiceType', 'Interim');
    await clickButton(page, 'Generate');
    await waitForToast(page);
    
    await clickButton(page, 'Send to Client');
    await clickButton(page, 'Send');
    await waitForToast(page);
    
    await clickButton(page, 'Mark Completed');
    await clickButton(page, 'Confirm');
    await waitForToast(page);
    
    await clickButton(page, 'Generate Final Invoice');
    await clickButton(page, 'Generate');
    await waitForToast(page);
    
    await page.goto('/invoices');
    const invoices = await page.locator('[data-invoice-matter-id]').count();
    expect(invoices).toBeGreaterThanOrEqual(3);
  });
});
