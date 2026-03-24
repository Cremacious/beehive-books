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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Find the LikeButton on the current book page (works on both desktop and mobile). */
function getLikeButton(page: import('@playwright/test').Page) {
  // LikeButton renders a <button> containing a Heart SVG (class includes "lucide-heart")
  // There may be two on the page (desktop stats row + mobile row) — take the first visible one.
  return page.locator('button:has(svg.lucide-heart)').first();
}

// ── Tests (serial — state shared across the suite) ────────────────────────────
test.describe('book likes and favourites', () => {
  test.describe.configure({ mode: 'serial' });

  let bookHref: string;
  let bookTitle: string;
  let initialLikeCount: number;

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

    // Capture the book title for later assertions
    bookTitle = (await page.getByRole('heading').first().textContent()) ?? '';

    const likeBtn = getLikeButton(page);
    await expect(likeBtn).toBeVisible();

    // Read the current count
    const countText = await likeBtn.locator('span').textContent();
    initialLikeCount = parseInt(countText ?? '0', 10);

    // Ensure the book is not already liked — if it is, click to unlike first
    const isAlreadyLiked = await likeBtn.evaluate((el) =>
      el.className.includes('FFC300') || el.textContent?.trim() !== ''
    );
    const btnClass = await likeBtn.getAttribute('class');
    const alreadyLiked = btnClass?.includes('FFC300') ?? false;

    if (alreadyLiked) {
      // Unlike first so we can re-like in a clean state
      await likeBtn.click();
      await page.waitForFunction(
        ([btn, prevText]: [Element, string]) => btn.querySelector('span')?.textContent !== prevText,
        [await likeBtn.elementHandle(), countText] as [Element, string],
        { timeout: 8_000 }
      );
      const newText = await likeBtn.locator('span').textContent();
      initialLikeCount = parseInt(newText ?? '0', 10);
    }

    // Click to like
    await likeBtn.click();

    // Wait for optimistic update: count should be initialLikeCount + 1
    await expect(likeBtn.locator('span')).toHaveText(String(initialLikeCount + 1), { timeout: 8_000 });
  });

  // ── 3. Verify book appears in Favourites tab ──────────────────────────────

  test('liked book appears in /library?tab=favourites', async ({ page }) => {
    test.skip(!bookHref || !bookTitle, 'Previous test did not run');

    await page.goto('/library?tab=favourites');

    // The liked book's title should appear in the favourites grid
    await expect(page.getByText(bookTitle, { exact: false }).first()).toBeVisible({ timeout: 8_000 });
  });

  // ── 4. Unlike the book ────────────────────────────────────────────────────

  test('clicking the like button again decrements the count (unlike)', async ({ page }) => {
    test.skip(!bookHref, 'Previous test did not run');

    await page.goto(bookHref);

    const likeBtn = getLikeButton(page);
    await expect(likeBtn).toBeVisible();

    const countText = await likeBtn.locator('span').textContent();
    const countBefore = parseInt(countText ?? '1', 10);

    // Click to unlike
    await likeBtn.click();

    // Count should drop by 1
    await expect(likeBtn.locator('span')).toHaveText(String(countBefore - 1), { timeout: 8_000 });
  });

  // ── 5. Verify book is gone from Favourites tab ────────────────────────────

  test('unliked book is removed from /library?tab=favourites', async ({ page }) => {
    test.skip(!bookHref || !bookTitle, 'Previous test did not run');

    await page.goto('/library?tab=favourites');

    // The book should no longer appear in the favourites grid
    // Use a short timeout — it should be absent immediately
    await expect(page.getByText(bookTitle, { exact: false })).not.toBeVisible({ timeout: 8_000 });
  });
});
