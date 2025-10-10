import { Page } from '@playwright/test';

export async function fillFormField(page: Page, name: string, value: string) {
  const selector = `input[name="${name}"], textarea[name="${name}"], input#${name}, textarea#${name}`;
  await page.fill(selector, value);
}

export async function selectDropdown(page: Page, name: string, value: string) {
  await page.selectOption(`select[name="${name}"]`, value);
}

export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

export async function waitForToast(page: Page, message?: string) {
  if (message) {
    await page.waitForSelector(`text=${message}`);
  } else {
    await page.waitForSelector('[role="status"]');
  }
}

export async function uploadFile(page: Page, inputSelector: string, filePath: string) {
  await page.setInputFiles(inputSelector, filePath);
}

export function generateTestEmail(prefix: string = 'test'): string {
  return process.env.TEST_USER_EMAIL || 'nkosinathi.dhliso@gmail.com';
}

export function generateTestPassword(): string {
  return process.env.TEST_USER_PASSWORD || 'Latestmano271991!';
}

export async function navigateToPage(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

export async function verifyTableRow(page: Page, rowText: string) {
  await page.waitForSelector(`tr:has-text("${rowText}")`);
}

export async function clickTableAction(page: Page, rowText: string, actionText: string) {
  const row = page.locator(`tr:has-text("${rowText}")`);
  await row.locator(`button:has-text("${actionText}")`).click();
}

export async function confirmDialog(page: Page) {
  await page.click('button:has-text("Confirm")');
}

export async function cancelDialog(page: Page) {
  await page.click('button:has-text("Cancel")');
}

export async function waitForApiResponse(page: Page, url: string) {
  await page.waitForResponse(response => response.url().includes(url));
}

export async function navigateToCoreFeature(page: Page, featureName: 'Dashboard' | 'Pro Forma' | 'Matters' | 'Invoices') {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await page.getByRole('button', { name: 'Core Features menu' }).click();
  await page.waitForTimeout(500);
  
  const menuItemMap = {
    'Dashboard': 'Dashboard Overview of your practice',
    'Pro Forma': 'Pro Forma New Manage quotes and estimates',
    'Matters': 'Matters Manage your cases and matters',
    'Invoices': 'Invoices Invoicing and billing'
  };
  
  await page.getByRole('menuitem', { name: menuItemMap[featureName] }).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}
