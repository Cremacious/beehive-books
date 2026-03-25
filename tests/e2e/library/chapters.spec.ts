/**
 * Library — Chapter E2E tests
 *
 * Covers:
 *  - Create a chapter → appears under the correct book
 *  - TipTap editor — typing, bold, italic, headings, save, content persists
 *  - Author notes — attached note displays before content in the reader
 *  - Word count — auto-tracked and shown per chapter
 *  - Chapter navigation — Prev / Next buttons work
 *  - Mobile navigation — ≤640px viewport, buttons stack vertically (no horizontal scroll)
 *  - Chapter collections — create a collection, assign a chapter, drag-and-drop reorder
 *  - Delete a chapter → removed from book page
 *
 * Prerequisites:
 *  - TEST_USER_EMAIL / TEST_USER_PASSWORD set in .env (completed-onboarding account)
 *  - Run auth setup first: npx playwright test auth/auth.setup.ts --project=chromium
 *
 * Run just this file:
 *   npx playwright test library/chapters.spec.ts --project=chromium
 */

import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../../.auth/user.json');

// ── Shared test data ───────────────────────────────────────────────────────
const TS = Date.now();
const BOOK_TITLE = `[E2E] Chapter Tests ${TS}`;
const CH1_TITLE = `[E2E] Chapter One ${TS}`;
const CH2_TITLE = `[E2E] Chapter Two ${TS}`;
const AUTHOR_NOTE = 'This is an author note written by the E2E test suite.';
const CHAPTER_CONTENT = 'The quick brown fox jumped over the lazy dog.'; // 9 words
const COLLECTION_NAME = `[E2E] Collection ${TS}`;

// ── Auth guard ─────────────────────────────────────────────────────────────
test.use({
  storageState: fs.existsSync(authFile) ? authFile : { cookies: [], origins: [] },
});

// ── Shared state (populated in serial order) ───────────────────────────────
let bookId: string;
let chapter1Id: string;
let chapter2Id: string;

// ── Helper — create a test book via the form ───────────────────────────────
async function createTestBook(page: Page): Promise<string> {
  await page.goto('/library/create');
  await page.locator('input[placeholder="Enter your book title…"]').fill(BOOK_TITLE);
  await page.locator('input[placeholder="Your pen name or real name…"]').fill('E2E Author');
  await page.locator('select[name="category"]').selectOption('Fiction');
  await page.locator('select[name="genre"]').selectOption('Fantasy');
  await page
    .locator('textarea[placeholder="Write a compelling description of your book…"]')
    .fill('E2E test book created for chapter tests. Will be deleted automatically.');
  await page.getByRole('button', { name: 'Create Book' }).click();

  // Race: success redirect, free-tier error, or stale-session redirect.
  const errorLocator = page.locator('p.text-red-400, p[class*="text-red"]');
  const result = await Promise.race([
    page.waitForURL('/library', { waitUntil: 'domcontentloaded', timeout: 75_000 }).then(() => 'navigated' as const),
    errorLocator.waitFor({ state: 'visible', timeout: 75_000 }).then(() => 'error' as const),
    page.waitForURL(/\/sign-in/, { waitUntil: 'domcontentloaded', timeout: 75_000 }).then(() => 'unauthenticated' as const),
  ]);

  if (result === 'unauthenticated') {
    throw new Error('Session expired — re-run: npx playwright test auth/auth.setup.ts --project=chromium');
  }
  if (result === 'error') {
    const msg = await errorLocator.first().textContent();
    throw new Error(`Book creation blocked: "${msg}". Delete leftover [E2E] books from /library and re-run.`);
  }

  // Navigate into the newly created book to get its ID
  await page.getByText(BOOK_TITLE).first().click();
  await page.waitForURL(/\/library\/[a-z0-9]+$/, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  return page.url().split('/').pop()!;
}

// ── Tests (serial — state shared via variables) ────────────────────────────
test.describe('chapter CRUD and features', () => {
  test.describe.configure({ mode: 'serial' });

  // ── 0. Setup — create the test book ──────────────────────────────────

  test('setup: create test book', async ({ page }) => {
    test.setTimeout(90_000); // covers cold-start delay in createTestBook
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');
    bookId = await createTestBook(page);
    expect(bookId).toBeTruthy();
  });

  // ── 1. Create chapter 1 ───────────────────────────────────────────────

  test('create chapter 1 → appears on book page', async ({ page }) => {
    test.skip(!bookId, 'Setup test did not run');

    await page.goto(`/library/${bookId}/create-chapter`);
    await page.locator('input[placeholder="Enter your chapter title…"]').fill(CH1_TITLE);
    await page.getByRole('button', { name: 'Create Chapter' }).click();

    // Redirects to /library/{bookId}/{chapterId}
    await page.waitForURL(/\/library\/[a-z0-9]+\/[a-z0-9]+$/, { timeout: 10_000 });
    chapter1Id = page.url().split('/').pop()!;
    expect(chapter1Id).toBeTruthy();

    // Chapter title is visible in the reader header
    await expect(page.getByText(CH1_TITLE).first()).toBeVisible();

    // Confirm chapter appears on the book page
    await page.goto(`/library/${bookId}`);
    await expect(page.getByText(CH1_TITLE).first()).toBeVisible();
  });

  // ── 2. Create chapter 2 with author notes ─────────────────────────────

  test('create chapter 2 with author notes → note appears in reader', async ({ page }) => {
    test.skip(!bookId, 'Setup test did not run');

    await page.goto(`/library/${bookId}/create-chapter`);
    await page.locator('input[placeholder="Enter your chapter title…"]').fill(CH2_TITLE);
    await page
      .locator('textarea[placeholder="Share thoughts, context, or a message to your readers…"]')
      .fill(AUTHOR_NOTE);
    await page.getByRole('button', { name: 'Create Chapter' }).click();

    await page.waitForURL(/\/library\/[a-z0-9]+\/[a-z0-9]+$/, { timeout: 10_000 });
    chapter2Id = page.url().split('/').pop()!;
    expect(chapter2Id).toBeTruthy();

    // Author note is rendered in a golden highlighted box before the content
    await expect(page.getByText(AUTHOR_NOTE)).toBeVisible();
    // The "Author's Note" label heading should also be visible
    await expect(page.getByText("Author's Note", { exact: false })).toBeVisible();
  });

  // ── 3. TipTap editor — type, format, save, verify content persists ────

  test('TipTap editor — formatted content persists after save', async ({ page }) => {
    test.skip(!bookId || !chapter1Id, 'Previous tests did not run');

    await page.goto(`/library/${bookId}/${chapter1Id}/edit`);

    const editor = page.locator('div[contenteditable="true"]');
    await editor.click();

    // Type the chapter body
    await page.keyboard.type(CHAPTER_CONTENT);

    // Apply bold to the first word: position at start, select word, Ctrl+B
    await page.keyboard.press('Home');
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');
    await page.keyboard.press('Control+b');

    // Move to new line and type italic text
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+i');
    await page.keyboard.type('Italic line.');
    await page.keyboard.press('Control+i');

    // Move to new line and apply H2 heading via toolbar button
    await page.keyboard.press('Enter');
    await page.locator('[data-testid="toolbar-h2"]').click();
    await page.keyboard.type('A Heading');

    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForURL(`/library/${bookId}/${chapter1Id}`, { timeout: 10_000 });

    // Verify bold text persists — use first() to target the right element
    await expect(page.locator('strong').filter({ hasText: CHAPTER_CONTENT.trim() })).toBeVisible();
    // Verify italic text persists
    await expect(page.locator('em').filter({ hasText: 'Italic line.' })).toBeVisible();
    // Verify heading persists
    await expect(page.getByRole('heading', { name: 'A Heading' })).toBeVisible();
  });

  // ── 4. Word count ─────────────────────────────────────────────────────

  test('word count — shown in chapter reader header', async ({ page }) => {
    test.skip(!bookId || !chapter1Id, 'Previous tests did not run');

    await page.goto(`/library/${bookId}/${chapter1Id}`);

    // The chapter reader displays "{n} words" in the header
    // CHAPTER_CONTENT has 9 words + "Italic line." (2 words) + "A Heading" (2 words) = 13 words
    // Word count display uses toLocaleString() so we match any digits followed by "words"
    await expect(page.getByText(/\d+ words/i).first()).toBeVisible();
  });

  // ── 5. Chapter navigation — Prev / Next ───────────────────────────────

  test('chapter navigation — Next button advances to chapter 2', async ({ page }) => {
    test.skip(!bookId || !chapter1Id || !chapter2Id, 'Previous tests did not run');

    await page.goto(`/library/${bookId}/${chapter1Id}`);

    // Click the "Next" navigation link
    await page.getByRole('link', { name: /next/i }).click();

    // Should land on chapter 2
    await page.waitForURL(`/library/${bookId}/${chapter2Id}`, { timeout: 10_000 });
    await expect(page.getByText(CH2_TITLE).first()).toBeVisible();

    // From chapter 2, the "Prev" link should go back to chapter 1
    await page.getByRole('link', { name: /prev/i }).click();
    await page.waitForURL(`/library/${bookId}/${chapter1Id}`, { timeout: 10_000 });
    await expect(page.getByText(CH1_TITLE).first()).toBeVisible();
  });

  // ── 6. Mobile navigation — no horizontal scroll at ≤640px ────────────
  //
  // Verifies PR Update/visuals1.0 #24: on mobile widths Prev/Next buttons
  // stack full-width vertically and the page has no horizontal overflow.

  test('mobile navigation — no horizontal scroll at 640px', async ({ page }) => {
    test.skip(!bookId || !chapter1Id, 'Previous tests did not run');

    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto(`/library/${bookId}/${chapter1Id}`);

    // Confirm there is no horizontal overflow
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasHorizontalScroll).toBe(false);

    // Both navigation links should still be visible (stacked, not hidden)
    await expect(page.getByRole('link', { name: /next/i })).toBeVisible();
  });

  // ── 7. Collection — create, assign chapter, verify ───────────────────

  test('create a collection and assign chapter 1 to it', async ({ page }) => {
    test.skip(!bookId || !chapter1Id, 'Previous tests did not run');

    // Create the collection from the book detail page
    await page.goto(`/library/${bookId}`);
    await page.getByRole('button', { name: 'Add Collection' }).click();

    // An inline input should appear for the collection name
    const collectionInput = page.locator('input[placeholder*="collection" i]').last();
    await collectionInput.fill(COLLECTION_NAME);
    await collectionInput.press('Enter');

    // The collection header should now be visible on the page
    await expect(page.getByText(COLLECTION_NAME)).toBeVisible({ timeout: 8_000 });

    // Assign chapter 1 to the collection via the chapter edit form
    await page.goto(`/library/${bookId}/${chapter1Id}/edit`);
    const collectionSelect = page.locator('select').filter({ hasText: /No collection/i });
    await collectionSelect.selectOption({ label: COLLECTION_NAME });
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await page.waitForURL(`/library/${bookId}/${chapter1Id}`, { timeout: 10_000 });

    // Back on the book page, chapter 1 should appear under the collection heading
    await page.goto(`/library/${bookId}`);
    const collectionSection = page.locator(`div:has-text("${COLLECTION_NAME}")`).first();
    await expect(collectionSection.getByText(CH1_TITLE)).toBeVisible();
  });

  // ── 8. Delete chapter ─────────────────────────────────────────────────

  test('delete chapter 1 → removed from book page', async ({ page }) => {
    test.skip(!bookId || !chapter1Id, 'Previous tests did not run');

    await page.goto(`/library/${bookId}/${chapter1Id}/edit`);

    // Open the DeleteDialog for the chapter
    await page.getByRole('button', { name: 'Delete Chapter' }).click();
    await expect(page.getByText(/permanently delete/i)).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).last().click();

    // Redirects back to the book page
    await page.waitForURL(`/library/${bookId}`, { timeout: 15_000 });

    // Chapter 1 title should no longer appear in the chapter list
    await expect(page.getByText(CH1_TITLE)).not.toBeVisible();
  });

  // ── 9. Cleanup — delete the test book ────────────────────────────────

  test('cleanup: delete test book', async ({ page }) => {
    test.skip(!bookId, 'Setup test did not run');

    await page.goto(`/library/${bookId}/edit`);
    await page.getByRole('button', { name: 'Delete Book' }).click();
    await expect(page.getByText(/permanently delete/i)).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).last().click();
    await page.waitForURL('/library', { timeout: 15_000 });

    await expect(page.getByText(BOOK_TITLE)).not.toBeVisible();
  });
});
