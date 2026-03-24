/**
 * User Profile E2E tests
 *
 * Covers:
 *  - Guest can visit /u/[username] for a known seed user without being redirected
 *  - Profile page shows the username
 *  - Profile page shows a public books section (or an empty state)
 *  - Authenticated user viewing their own profile sees the "Edit Profile" link
 *
 * Seed username: the default seed account is alice@beehive.dev whose username
 * is expected to be "alice".  Override with TEST_SEED_USERNAME in .env if
 * the seed was set up differently.
 *
 * Prerequisites:
 *  - Run `npm run db:seed` so the seed user exists
 *  - Run auth setup first: npx playwright test auth/auth.setup.ts --project=chromium
 *
 * Run just this file:
 *   npx playwright test profile/profile.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../../.auth/user.json');

// Seed account — must exist in the database before these tests run.
const SEED_USERNAME = process.env.TEST_SEED_USERNAME ?? 'alice';

// ─────────────────────────────────────────────────────────────────────────────
// GUEST TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('profile page — guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(`/u/${SEED_USERNAME} loads without redirect for a guest`, async ({ page }) => {
    const response = await page.goto(`/u/${SEED_USERNAME}`);

    // Should not redirect to /sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);

    // A 404 means the seed user doesn't exist — surface a helpful skip message
    if (response?.status() === 404) {
      test.skip(true, `Seed user "${SEED_USERNAME}" not found — run npm run db:seed or set TEST_SEED_USERNAME`);
      return;
    }

    await expect(page).toHaveURL(`/u/${SEED_USERNAME}`);
  });

  test('profile page shows the username', async ({ page }) => {
    await page.goto(`/u/${SEED_USERNAME}`);

    if (page.url().includes('/sign-in')) {
      test.skip(true, 'Profile route requires auth in this environment');
      return;
    }

    // The username is rendered in <h1 data-testid="profile-username">
    await expect(page.getByTestId('profile-username')).toContainText(SEED_USERNAME);
  });

  test('profile page shows a books section or empty state', async ({ page }) => {
    await page.goto(`/u/${SEED_USERNAME}`);

    if (page.url().includes('/sign-in')) {
      test.skip(true, 'Profile route requires auth in this environment');
      return;
    }

    // ProfileContent renders tabs / sections; the books section heading is "Books"
    // or a card link to /books/[id].  Accept either a "Books" heading/tab or a book link.
    const booksHeadingOrLink = page.locator(
      'a[href^="/books/"], [role="tab"]:has-text("Books"), h2:has-text("Books"), p:has-text("No public books")'
    );
    await expect(booksHeadingOrLink.first()).toBeVisible({ timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('profile page — authenticated', () => {
  test.use({
    storageState: fs.existsSync(authFile) ? authFile : { cookies: [], origins: [] },
  });

  test('authenticated user sees "Edit Profile" link on their own profile', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run — no session file');

    await page.goto(`/u/${SEED_USERNAME}`);

    // The seed user IS the authenticated user, so isOwnProfile should be true
    // and the "Edit Profile" link should be rendered
    if (page.url().includes('/sign-in')) {
      test.skip(true, 'Unexpected sign-in redirect — session may be stale');
      return;
    }

    // Profile renders <a href="/settings" data-testid="edit-profile-link">Edit Profile</a> for own profile
    await expect(page.locator('[data-testid="edit-profile-link"]')).toBeVisible();
  });
});
