/**
 * Auth setup — runs once before the test suite.
 * Signs in with TEST_USER_EMAIL / TEST_USER_PASSWORD and saves the browser
 * session to tests/.auth/user.json so authenticated tests can reuse it
 * without signing in on every run.
 *
 * Prerequisites:
 *   1. Create a test account in the app (sign up + complete onboarding).
 *   2. Add TEST_USER_EMAIL and TEST_USER_PASSWORD to your .env file.
 */

import { test as setup } from '@playwright/test';
import path from 'path';

export const authFile = path.join(__dirname, '../../.auth/user.json');

setup('authenticate as test user', async ({ page }) => {
  if (!process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD) {
    setup.skip();
    return;
  }

  await page.goto('/sign-in');
  await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // better-auth redirects via window.location.href — wait for the navigation
  await page.waitForURL('/home', { timeout: 15_000 });

  // Persist cookies + localStorage so other tests can load this state
  await page.context().storageState({ path: authFile });
});
