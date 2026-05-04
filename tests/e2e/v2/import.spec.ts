import { test, expect, type Page } from '@playwright/test';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { db } from '../../../db';
import { books } from '../../../db/schema';

const authFile = path.join(__dirname, '../../.auth/user.json');

test.use({
  storageState: fs.existsSync(authFile)
    ? authFile
    : { cookies: [], origins: [] },
});

const runId = Date.now();

async function fillBookForm(page: Page, title: string) {
  await page.locator('input[placeholder^="Enter your book title"]').fill(title);
  await page.locator('input[placeholder^="Your pen name or real name"]').fill('Import Tester');
  await page.locator('select[name="category"]').selectOption('Fiction');
  await page.locator('select[name="genre"]').selectOption('Fantasy');
  await page
    .locator('textarea[placeholder^="Write a compelling description of your book"]')
    .fill('A temporary book created by the v2 import Playwright suite.');
}

async function createBook(page: Page, title: string) {
  await page.goto('/library/create');
  await fillBookForm(page, title);
  await page.getByRole('button', { name: 'Create Book' }).click();

  const errorLocator = page.locator('p.text-red-400');
  const result = await Promise.race([
    page.waitForURL('/library', { waitUntil: 'domcontentloaded', timeout: 75_000 }).then(() => 'created' as const),
    errorLocator.waitFor({ state: 'visible', timeout: 75_000 }).then(() => 'error' as const),
    page.waitForURL(/\/sign-in/, { waitUntil: 'domcontentloaded', timeout: 75_000 }).then(() => 'unauthenticated' as const),
  ]);

  if (result === 'unauthenticated') {
    test.fail(true, 'Session expired. Re-run auth setup.');
    throw new Error('Unauthenticated test session');
  }

  if (result === 'error') {
    const msg = await errorLocator.textContent();
    test.skip(true, `Book creation blocked by server: "${msg}". Delete leftover [E2E] books and re-run.`);
  }

  await page.getByText(title).first().click();
  await page.waitForURL(/\/library\/[a-z0-9]+$/, { waitUntil: 'domcontentloaded' });
  return page.url().split('/').pop()!;
}

async function cleanupBook(bookId: string) {
  try {
    await db.delete(books).where(eq(books.id, bookId));
  } catch (error) {
    console.warn(`Failed to clean up test book ${bookId}:`, error);
  }
}

test.describe('v2 manuscript import', () => {
  const createdBookIds: string[] = [];

  test.beforeEach(() => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');
  });

  test.afterEach(async () => {
    const bookIds = createdBookIds.splice(0);

    for (const bookId of bookIds) {
      await cleanupBook(bookId);
    }
  });

  test('imports pasted manuscript chapters from the workspace', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Import ${runId}`;
    const bookId = await createBook(page, bookTitle);
    createdBookIds.push(bookId);

    await page.goto(`/write/${bookId}`);
    await page.getByRole('link', { name: 'Import manuscript' }).click();
    await page.waitForURL(`/write/${bookId}/import`, { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
    await page.getByLabel('Paste').fill([
      'CHAPTER I',
      '',
      'The first imported chapter opens cleanly and keeps body text in the body.',
      '',
      'CHAPTER II',
      '',
      'The second imported chapter proves the queue can save multiple chapters.',
    ].join('\n'));
    await page.getByRole('button', { name: 'Review import' }).click();

    await expect(page.getByText('Found 2 chapters.')).toBeVisible();
    await expect(page.getByLabel('Title').first()).toHaveValue('CHAPTER I');
    await expect(page.getByLabel('Body').first()).toHaveValue(/first imported chapter/);
    await expect(page.getByLabel('Body').nth(1)).toHaveValue(/second imported chapter/);

    await page.getByLabel('Title').first().fill('Imported Opening');
    await page.getByRole('button', { name: 'Save selected' }).click();

    await expect(page.getByText('Saved 2 chapters.')).toBeVisible({ timeout: 30_000 });

    await page.goto(`/library/${bookId}`);
    await expect(page.getByText('Imported Opening')).toBeVisible();
    await expect(page.getByText('CHAPTER II')).toBeVisible();
  });
});
