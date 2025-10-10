import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: path.resolve(__dirname, 'tests/setup/global-setup.ts'),
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: path.join(__dirname, 'tests', '.auth', 'user.json'),
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
