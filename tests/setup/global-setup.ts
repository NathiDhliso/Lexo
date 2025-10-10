import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'nkosinathi.dhliso@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Latestmano271991!';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('🔐 Logging in once for all tests...');
  
  await page.goto(baseURL || 'http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const emailInput = page.locator('#email');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.click({ force: true });
  await emailInput.fill(TEST_USER_EMAIL);

  const passwordInput = page.locator('#password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.click({ force: true });
  await passwordInput.fill(TEST_USER_PASSWORD);

  await page.click('button[type="submit"]', { force: true });
  
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  await page.context().storageState({ path: path.join(__dirname, '..', '.auth', 'user.json') });

  await browser.close();
  
  console.log('✅ Authentication state saved!');
}

export default globalSetup;
