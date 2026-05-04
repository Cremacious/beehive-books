import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

test.use({
  storageState: fs.existsSync(authFile)
    ? authFile
    : { cookies: [], origins: [] },
});

const runId = Date.now();

async function fillBookForm(page: Page, title: string) {
  await page.locator('input[placeholder^="Enter your book title"]').fill(title);
  await page.locator('input[placeholder^="Your pen name or real name"]').fill('Workspace Tester');
  await page.locator('select[name="category"]').selectOption('Fiction');
  await page.locator('select[name="genre"]').selectOption('Fantasy');
  await page
    .locator('textarea[placeholder^="Write a compelling description of your book"]')
    .fill('A temporary book created by the v2 workspace Playwright suite.');
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

async function createChapter(page: Page, bookId: string, title: string) {
  await page.goto(`/library/${bookId}/create-chapter`);
  await page.locator('input[placeholder^="Enter your chapter title"]').fill(title);
  await page.locator('.ProseMirror').fill('The first chapter opens with enough words to prove the draft workspace is active.');
  await page.getByRole('button', { name: 'Create Chapter' }).click();
  await page.waitForURL(new RegExp(`/library/${bookId}/[a-z0-9]+$`), {
    waitUntil: 'domcontentloaded',
  });
  return page.url().split('/').pop()!;
}

async function cleanupBook(page: Page, bookId: string) {
  try {
    await page.goto(`/library/${bookId}/edit`, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    });
    await page.getByRole('button', { name: 'Delete Book' }).click({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Delete' }).last().click({ timeout: 10_000 });
    await page.waitForURL('/library', { waitUntil: 'domcontentloaded', timeout: 15_000 });
  } catch (error) {
    console.warn(`Failed to clean up test book ${bookId}:`, error);
  }
}

test.describe('v2 adaptive project workspace', () => {
  const createdBookIds: string[] = [];

  test.beforeEach(() => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');
  });

  test.afterEach(async ({ page }) => {
    const bookIds = createdBookIds.splice(0);

    for (const bookId of bookIds) {
      await cleanupBook(page, bookId);
    }
  });

  test('empty project opens in planning mode with first chapter action', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Empty ${runId}`;
    const bookId = await createBook(page, bookTitle);
    createdBookIds.push(bookId);

    await page.goto(`/write/${bookId}`);

    await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
    await expect(page.getByText('Plan first')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Write first chapter' })).toHaveAttribute(
      'href',
      `/library/${bookId}/create-chapter`,
    );
    await expect(page.getByText('0 chapters')).toBeVisible();
  });

  test('project with chapters opens in drafting mode with continue action', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Draft ${runId}`;
    const chapterTitle = `[E2E] Opening Chapter ${runId}`;
    const bookId = await createBook(page, bookTitle);
    createdBookIds.push(bookId);
    const chapterId = await createChapter(page, bookId, chapterTitle);

    await page.goto(`/write/${bookId}`);

    await expect(page.getByRole('heading', { name: bookTitle })).toBeVisible();
    await expect(page.getByText('Draft first')).toBeVisible();
    await expect(page.getByText(chapterTitle)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue writing' })).toHaveAttribute(
      'href',
      `/library/${bookId}/${chapterId}/edit`,
    );
  });

  test('library owner detail exposes Open Studio route', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Link ${runId}`;
    const bookId = await createBook(page, bookTitle);
    createdBookIds.push(bookId);

    await page.goto(`/library/${bookId}`);

    await expect(page.getByRole('link', { name: 'Open Studio' }).first()).toHaveAttribute(
      'href',
      `/write/${bookId}`,
    );
  });

  test('workspace has no mobile horizontal overflow', async ({ page }) => {
    test.setTimeout(120_000);
    const bookTitle = `[E2E] Workspace Mobile ${runId}`;
    const bookId = await createBook(page, bookTitle);
    createdBookIds.push(bookId);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/write/${bookId}`);

    await expect(page.locator('[data-testid="v2-project-workspace"]')).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(hasOverflow).toBe(false);
  });
});
