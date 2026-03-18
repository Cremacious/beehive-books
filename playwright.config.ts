import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env so process.env.TEST_USER_EMAIL / TEST_USER_PASSWORD are available
// in test files (Next.js loads .env for the dev server, but Playwright runs
// in a separate Node process that doesn't get those vars automatically).
dotenv.config();

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },

  projects: [
    // Runs first: signs in and saves session to tests/.auth/user.json
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },

    // Main test browsers — depend on setup so auth file is ready
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
  ],

  // Auto-start the dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
