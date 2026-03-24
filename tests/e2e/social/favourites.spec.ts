/**
 * Favourites E2E tests
 *
 * Covers:
 *  - Navigate to a public book via /explore → /books/[id]
 *  - Click the like/heart button → like count increments
 *  - Navigate to /library?tab=favourites → liked book appears
 *  - Click like button again → count decrements (unlike)
 *  - Navigate to /library?tab=favourites → book is gone
 *
 * Prerequisites:
 *  - At least one public, explorable book must exist (seed data or created manually)
 *  - Run auth setup first: npx playwright test auth/auth.setup.ts --project=chromium
 *
 * Run just this file:
 *   npx playwright test social/favourites.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../../.auth/user.json');

test.use({
  storageState: fs.existsSync(authFile) ? authFile : { cookies: [], origins: [] },
});

test.describe('book likes and favourites', () => {
  test.describe.configure({ mode: 'serial' });

  let bookHref: string;
  let bookTitle: string;

  // ── 1. Find a public book to like ─────────────────────────────────────────

  test('setup: find a public book on /explore', async ({ page }) => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');

    await page.goto('/explore');

    const bookLinks = page.locator('a[href^="/books/"]');
    const count = await bookLinks.count();
    if (count === 0) {
      test.skip(true, 'No public books on /explore — seed the DB or mark a book as explorable');
      return;
    }

    bookHref = (await bookLinks.first().getAttribute('href'))!;
    expect(bookHref).toMatch(/\/books\/[a-z0-9]+/);
  });

  // ── 2. Like the book ──────────────────────────────────────────────────────

  test('clicking the like button increments the like count', async ({ page }) => {
    test.skip(!bookHref, 'Setup test did not run');

    await page.goto(bookHref);

    bookTitle = (await page.getByRole('heading').first().textContent()) ?? '';

    const likeBtn = page.locator('[data-testid="like-button"]').first();
    await expect(likeBtn).toBeVisible();

    // Skip if the button is disabled (e.g. rate-limited or unauthenticated)
    const isDisabled = await likeBtn.isDisabled();
    if (isDisabled) {
      test.skip(true, 'Like button is disabled — may be rate-limited or unauthenticated');
      return;
    }

    // If already liked, unlike first to get to a clean state
    const btnClass = await likeBtn.getAttribute('class') ?? '';
    if (btnClass.includes('FFC300')) {
      await likeBtn.click();
      await page.waitForTimeout(2000);
    }

    const countText = await likeBtn.locator('span').textContent() ?? '0';
    const initialCount = parseInt(countText, 10);

    // Like it
    await likeBtn.click();
    await page.waitForTimeout(1500);

    await expect(likeBtn.locator('span')).toHaveText(String(initialCount + 1), { timeout: 8_000 });
  });

  // ── 3. Verify book appears in Favourites tab ──────────────────────────────

  test('liked book appears in /library?tab=favourites', async ({ page }) => {
    test.skip(!bookHref || !bookTitle, 'Previous test did not run');

    await page.goto('/library?tab=favourites');
    await expect(page.getByText(bookTitle, { exact: false }).first()).toBeVisible({ timeout: 8_000 });
  });

  // ── 4. Unlike the book ────────────────────────────────────────────────────

  test('clicking the like button again decrements the count', async ({ page }) => {
    test.skip(!bookHref, 'Previous test did not run');

    await page.goto(bookHref);

    const likeBtn = page.locator('[data-testid="like-button"]').first();
    await expect(likeBtn).toBeVisible();

    const countText = await likeBtn.locator('span').textContent() ?? '1';
    const countBefore = parseInt(countText, 10);

    await likeBtn.click();

    await expect(likeBtn.locator('span')).toHaveText(String(countBefore - 1), { timeout: 8_000 });
  });

  // ── 5. Verify book is gone from Favourites tab ────────────────────────────

  test('unliked book is removed from /library?tab=favourites', async ({ page }) => {
    test.skip(!bookHref || !bookTitle, 'Previous test did not run');

    await page.goto('/library?tab=favourites');
    await expect(page.getByText(bookTitle, { exact: false })).not.toBeVisible({ timeout: 8_000 });
  });
});
