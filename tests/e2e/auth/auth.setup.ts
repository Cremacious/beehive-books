/**
 * Auth setup — runs once before the test suite.
 *
 * Signs in with a seeded test account and saves the browser session to
 * tests/.auth/user.json so authenticated tests can reuse it without
 * signing in on every run.
 *
 * Account priority:
 *   1. TEST_USER_EMAIL / TEST_USER_PASSWORD env vars (if set)
 *   2. alice@beehive.dev / B33h!ve#Dev2026$ (seeded via npm run db:seed)
 *
 * Prerequisites:
 *   - Run `npm run db:seed` to create test accounts in the dev DB
 *   - App must be running on http://localhost:3000
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

export const authFile = path.join(__dirname, '../../.auth/user.json');

const EMAIL    = process.env.TEST_USER_EMAIL    ?? 'alice@beehive.dev';
const PASSWORD = process.env.TEST_USER_PASSWORD ?? 'B33h!ve#Dev2026$';

setup('authenticate as test user', async ({ page }) => {
  await page.goto('/sign-in');

  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // better-auth redirects via window.location.href — wait for navigation
  await page.waitForURL('/home', { timeout: 30_000 });
  await expect(page).toHaveURL('/home');

  // Persist cookies + localStorage so other tests can load this state
  await page.context().storageState({ path: authFile });
});
