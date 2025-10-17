import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env.test.local') });

const IS_CI = !!process.env.CI;
const BASE_URL = process.env.PW_BASE_URL || 'http://localhost:3000';

const serverCommand = 'npx next dev -p 3000';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: IS_CI ? 1 : 0,
  reporter: IS_CI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: BASE_URL,
    trace: IS_CI ? 'retain-on-failure' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: IS_CI ? 'retain-on-failure' : 'off',
  },
  webServer: {
    command: serverCommand,
    url: BASE_URL,
    timeout: 120_000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  testIgnore: ['**/backend/**'],
});
