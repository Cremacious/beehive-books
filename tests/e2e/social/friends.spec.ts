/**
 * Friends E2E tests
 *
 * Covers:
 *  - Navigate to /friends?tab=find — page renders without error
 *  - Search for a username → results appear (or empty-state renders)
 *  - Navigate to /friends → friends list renders without error
 *  - Navigate to /friends?tab=requests → requests panel renders without error
 *
 * Note on two-account tests (send/accept/remove):
 *  Two-account flows (e.g. user A sends a request, user B accepts) require
 *  TEST_USER2_EMAIL / TEST_USER2_PASSWORD in .env, which would need a second
 *  auth setup project and storage state file.  Those tests are omitted here
 *  because the current playwright.config.ts has a single auth setup project.
 *  To add them: create tests/e2e/auth/auth.setup2.ts and a second Playwright
 *  project, then extend this file with a second test.use() block.
 *
 * Prerequisites:
 *  - Run auth setup first: npx playwright test auth/auth.setup.ts --project=chromium
 *
 * Run just this file:
 *   npx playwright test social/friends.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../../.auth/user.json');

// Seed account username — used for the search test.
// The default seed account is alice@beehive.dev; adjust TEST_SEED_USERNAME if different.
const SEED_USERNAME = process.env.TEST_SEED_USERNAME ?? 'alice';

test.use({
  storageState: fs.existsSync(authFile) ? authFile : { cookies: [], origins: [] },
});

test.describe('friends page', () => {
  test('/friends renders the friends list without error', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run — no session file');

    await page.goto('/friends');
    await expect(page).toHaveURL('/friends');

    // Page heading
    await expect(page.getByRole('heading', { name: 'Friends', exact: true }).first()).toBeVisible();

    // The tabs bar should always be present
    await expect(page.getByRole('link', { name: 'Friends' }).first()).toBeVisible();
  });

  test('/friends?tab=requests renders the requests panel without error', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run — no session file');

    await page.goto('/friends?tab=requests');
    await expect(page).toHaveURL('/friends?tab=requests');

    // The Requests tab link should be active (styled differently) and visible
    await expect(page.getByRole('link', { name: 'Requests' })).toBeVisible();

    // The page should not have crashed — check the heading is still present
    await expect(page.getByRole('heading', { name: 'Friends' })).toBeVisible();
  });

  test('/friends?tab=find renders the find-writers panel', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run — no session file');

    await page.goto('/friends?tab=find', { waitUntil: 'domcontentloaded' });

    // If redirected to sign-in, session is stale — skip
    if (page.url().includes('sign-in')) {
      test.skip(true, 'Session expired — re-run auth setup');
      return;
    }

    await expect(page).toHaveURL(/friends/, { timeout: 5_000 });

    // The search input should be present
    await expect(page.locator('input[placeholder="Search by username..."]')).toBeVisible();
  });

  test('searching for a username on /friends?tab=find shows results or empty state', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run — no session file');

    await page.goto('/friends?tab=find');

    const searchInput = page.locator('input[placeholder="Search by username..."]');
    await expect(searchInput).toBeVisible();

    // Type a query — at least 2 chars are required to trigger the search action
    await searchInput.fill(SEED_USERNAME.slice(0, 3));

    // Wait for results or no-results message — the search action fires via useTransition
    // (no debounce, fires immediately on change).  Give the server action time to resolve.
    const resultsOrEmpty = page.locator(
      // Either a user result button OR the "No results" / "No suggested writers" empty state
      'button.w-full, p:has-text("No results"), p:has-text("No suggested")'
    );
    await expect(resultsOrEmpty.first()).toBeVisible({ timeout: 10_000 });
  });
});
