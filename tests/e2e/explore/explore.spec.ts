/**
 * Explore E2E tests
 *
 * Covers:
 *  - Guest can visit /explore without being redirected to sign-in
 *  - Guest can see book cards on /explore
 *  - Guest clicking a book card navigates to /books/[id]
 *  - Guest can read a public chapter without signing in
 *  - Authenticated user sees the same explore page
 *
 * Prerequisites:
 *  - Run auth setup first: npx playwright test auth/auth.setup.ts --project=chromium
 *
 * Run just this file:
 *   npx playwright test explore/explore.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../../.auth/user.json');

// ─────────────────────────────────────────────────────────────────────────────
// GUEST TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('explore — guest', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('/explore loads without redirecting to /sign-in', async ({ page }) => {
    await page.goto('/explore');
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page).toHaveURL('/explore');
  });

  test('/explore shows content (heading or book cards or empty state)', async ({ page }) => {
    await page.goto('/explore');

    // Either the Discover Stories heading or the empty-state heading must be visible
    const heading = page.getByRole('heading', { name: /discover stories|nothing to explore/i });
    await expect(heading.first()).toBeVisible();
  });

  test('/explore shows book cards when public books exist', async ({ page }) => {
    await page.goto('/explore');

    // If there are no public books, the Books section simply won't render — skip gracefully
    const bookLinks = page.locator('a[href^="/books/"]');
    const count = await bookLinks.count();
    if (count === 0) {
      test.skip(true, 'No public books on /explore — seed the DB or mark a book as public + explorable');
      return;
    }

    await expect(bookLinks.first()).toBeVisible();
  });

  test('clicking a book card navigates to /books/[id]', async ({ page }) => {
    await page.goto('/explore');

    const bookLinks = page.locator('a[href^="/books/"]');
    const count = await bookLinks.count();
    if (count === 0) {
      test.skip(true, 'No public books on /explore — seed the DB or mark a book as public + explorable');
      return;
    }

    // Capture the href before clicking so we can assert the URL
    const href = await bookLinks.first().getAttribute('href');
    await bookLinks.first().click();

    await expect(page).toHaveURL(href!);
    // Book detail page should render a heading with the book title
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('guest can read a public chapter without signing in', async ({ page }) => {
    await page.goto('/explore');

    const bookLinks = page.locator('a[href^="/books/"]');
    const count = await bookLinks.count();
    if (count === 0) {
      test.skip(true, 'No public books on /explore — seed the DB');
      return;
    }

    const bookHref = await bookLinks.first().getAttribute('href');
    await page.goto(bookHref!);

    // Find the first chapter link on the book detail page
    const chapterLinks = page.locator(`a[href^="${bookHref}/"]`);
    const chapterCount = await chapterLinks.count();
    if (chapterCount === 0) {
      test.skip(true, 'No chapters on the first explore book — add a public chapter');
      return;
    }

    await chapterLinks.first().click();

    // Chapter reader should load and stay on /books/[id]/[chapterId]
    await expect(page).toHaveURL(/\/books\/[a-z0-9]+\/[a-z0-9]+/);
    await expect(page).not.toHaveURL(/\/sign-in/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED TESTS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('explore — authenticated', () => {
  test.use({
    storageState: fs.existsSync(authFile) ? authFile : { cookies: [], origins: [] },
  });

  test('authenticated user sees /explore without redirect', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run — no session file');

    await page.goto('/explore');
    await expect(page).toHaveURL('/explore');
    await expect(page).not.toHaveURL(/\/sign-in/);

    const heading = page.getByRole('heading', { name: /discover stories|nothing to explore/i });
    await expect(heading.first()).toBeVisible();
  });
});
