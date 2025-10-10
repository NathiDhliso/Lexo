import { test, expect } from './fixtures/auth.fixture';
import { fillFormField, clickButton, waitForToast, selectDropdown } from './utils/test-helpers';

test.describe('Payment Disputes & Credit Notes', () => {
  test('Test 13.1: Create Payment Dispute', async ({ page: clientPage }) => {
    await clientPage.goto('/attorney/invoices');
    const invoice = clientPage.locator('[data-invoice-id]').first();
    await invoice.click();
    
    await clickButton(clientPage, 'Dispute Invoice');
    
    await selectDropdown(clientPage, 'disputeType', 'Amount Incorrect');
    await fillFormField(clientPage, 'disputedAmount', '5000');
    await fillFormField(clientPage, 'reason', 'Hours not agreed upon');
    
    await clickButton(clientPage, 'Submit');
    
    await waitForToast(clientPage, 'Dispute submitted');
    await expect(clientPage.locator('text=Disputed')).toBeVisible();
  });

  test('Test 13.2: Respond to Dispute', async ({ authenticatedPage: page }) => {
    await page.goto('/disputes');
    
    const openDispute = page.locator('[data-dispute-status="open"]').first();
    await openDispute.click();
    
    await clickButton(page, 'Respond');
    
    await fillFormField(page, 'response', 'Hours were discussed and agreed');
    await page.setInputFiles('input[type="file"]', 'tests/fixtures/supporting-docs.pdf');
    
    await clickButton(page, 'Submit Response');
    
    await waitForToast(page, 'Response submitted');
    await expect(page.locator('text=Under Review')).toBeVisible();
  });

  test('Test 13.3: Resolve Dispute - Credit Note', async ({ authenticatedPage: page }) => {
    await page.goto('/disputes');
    
    const dispute = page.locator('[data-dispute-status="under_review"]').first();
    await dispute.click();
    
    await clickButton(page, 'Issue Credit Note');
    
    await fillFormField(page, 'amount', '2500');
    await fillFormField(page, 'reason', 'Partial credit agreed');
    
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Credit note issued');
    await expect(page.locator('text=Resolved')).toBeVisible();
  });

  test('Test 13.4: Resolve Dispute - Settled', async ({ authenticatedPage: page }) => {
    await page.goto('/disputes');
    
    const dispute = page.locator('[data-dispute-status="under_review"]').first();
    await dispute.click();
    
    await clickButton(page, 'Mark as Settled');
    
    await fillFormField(page, 'settlementNotes', 'Parties agreed on resolution');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Dispute settled');
    await expect(page.locator('text=Resolved')).toBeVisible();
  });

  test('Test 13.5: Escalate Dispute', async ({ authenticatedPage: page }) => {
    await page.goto('/disputes');
    
    const dispute = page.locator('[data-dispute-status="open"]').first();
    await dispute.click();
    
    await clickButton(page, 'Escalate');
    
    await fillFormField(page, 'escalationReason', 'Unable to resolve directly');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Dispute escalated');
    await expect(page.locator('text=Escalated')).toBeVisible();
  });

  test('Test 14.1: Create Credit Note', async ({ authenticatedPage: page }) => {
    await page.goto('/invoices');
    const invoice = page.locator('[data-invoice-id]').first();
    await invoice.click();
    
    await clickButton(page, 'Create Credit Note');
    
    await fillFormField(page, 'amount', '5000');
    await selectDropdown(page, 'reasonCategory', 'Billing Error');
    await fillFormField(page, 'detailedReason', 'Incorrect hours billed');
    
    await clickButton(page, 'Create');
    
    await waitForToast(page, 'Credit note created');
    await expect(page.locator('text=CN-202501-')).toBeVisible();
    await expect(page.locator('text=Draft')).toBeVisible();
  });

  test('Test 14.2: Issue Credit Note', async ({ authenticatedPage: page }) => {
    await page.goto('/credit-notes');
    
    const draftCreditNote = page.locator('[data-credit-note-status="draft"]').first();
    await draftCreditNote.click();
    
    await clickButton(page, 'Issue');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Credit note issued');
    await expect(page.locator('text=Issued')).toBeVisible();
  });

  test('Test 14.3: Apply Credit Note to Invoice', async ({ authenticatedPage: page }) => {
    await page.goto('/credit-notes');
    
    const issuedCreditNote = page.locator('[data-credit-note-status="issued"]').first();
    await issuedCreditNote.click();
    
    await clickButton(page, 'Apply to Invoice');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Credit note applied');
    await expect(page.locator('text=Applied')).toBeVisible();
  });

  test('Test 14.4: Cancel Credit Note', async ({ authenticatedPage: page }) => {
    await page.goto('/credit-notes');
    
    const draftCreditNote = page.locator('[data-credit-note-status="draft"]').first();
    await draftCreditNote.click();
    
    await clickButton(page, 'Cancel');
    
    await fillFormField(page, 'cancellationReason', 'Created in error');
    await clickButton(page, 'Confirm');
    
    await waitForToast(page, 'Credit note cancelled');
    await expect(page.locator('text=Cancelled')).toBeVisible();
  });

  test('Test 14.5: View Credit Note PDF', async ({ authenticatedPage: page }) => {
    await page.goto('/credit-notes');
    
    const creditNote = page.locator('[data-credit-note-id]').first();
    await creditNote.click();
    
    await clickButton(page, 'View PDF');
    
    const downloadPromise = page.waitForEvent('download');
    await clickButton(page, 'Download');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('Test 14.6: Credit Note Amount Validation', async ({ authenticatedPage: page }) => {
    await page.goto('/invoices');
    const invoice = page.locator('[data-invoice-id]').first();
    await invoice.click();
    
    const totalAmount = await page.locator('[data-invoice-total]').textContent();
    const amount = parseFloat(totalAmount?.replace(/[^0-9.]/g, '') || '0');
    
    await clickButton(page, 'Create Credit Note');
    
    await fillFormField(page, 'amount', (amount + 1000).toString());
    await clickButton(page, 'Create');
    
    await expect(page.locator('text=Credit note amount cannot exceed invoice total')).toBeVisible();
  });

  test('Test 14.7: Multiple Credit Notes for Same Invoice', async ({ authenticatedPage: page }) => {
    await page.goto('/invoices');
    const invoice = page.locator('[data-invoice-id]').first();
    await invoice.click();
    
    await clickButton(page, 'Create Credit Note');
    await fillFormField(page, 'amount', '1000');
    await selectDropdown(page, 'reasonCategory', 'Billing Error');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'Create Credit Note');
    await fillFormField(page, 'amount', '500');
    await selectDropdown(page, 'reasonCategory', 'Client Goodwill');
    await clickButton(page, 'Create');
    await waitForToast(page);
    
    await clickButton(page, 'View Credit Notes');
    await expect(page.locator('[data-credit-note-id]')).toHaveCount(2);
  });
});
