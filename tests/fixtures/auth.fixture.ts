import { test as base, Page } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'nkosinathi.dhliso@gmail.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Latestmano271991!';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'Copy .env.example to .env and add your credentials.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type AuthFixtures = {
  authenticatedPage: Page;
  advocatePage: Page;
  attorneyPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const isLoginPage = await page.locator('#email').isVisible().catch(() => false);
    
    if (isLoginPage) {
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
    }
    
    await use(page);
  },

  advocatePage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const isLoginPage = await page.locator('#email').isVisible().catch(() => false);
    
    if (isLoginPage) {
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
    }
    
    await use(page);
  },

  attorneyPage: async ({ page }, use) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const isLoginPage = await page.locator('#email').isVisible().catch(() => false);
    
    if (isLoginPage) {
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
    }
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
