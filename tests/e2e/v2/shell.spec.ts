import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = path.join(__dirname, '../../.auth/user.json');

test.use({
  storageState: fs.existsSync(authFile)
    ? authFile
    : { cookies: [], origins: [] },
});

test.describe('v2 shell', () => {
  test.beforeEach(() => {
    test.skip(!fs.existsSync(authFile), 'Auth setup has not run');
  });

  test('desktop shell exposes workspace-first navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/home');

    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Community' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore' })).toHaveCount(0);
    await expect(page.locator('[data-testid="v2-app-shell"]')).toBeVisible();
  });

  test('studio doorway loads without losing existing writing routes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/studio');

    await expect(page.getByRole('heading', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Library' })).toHaveAttribute('href', '/library');
    await expect(page.getByRole('link', { name: 'Start a Book' })).toHaveAttribute('href', '/library/create');
    await expect(page.getByRole('link', { name: 'Writing Hives' })).toHaveAttribute('href', '/hive');
  });

  test('community doorway groups existing social routes', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/community');

    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explore Books' })).toHaveAttribute('href', '/explore/books');
    await expect(page.getByRole('link', { name: 'Clubs' })).toHaveAttribute('href', '/clubs');
    await expect(page.getByRole('link', { name: 'Sparks' })).toHaveAttribute('href', '/sparks');
    await expect(page.getByRole('link', { name: 'Reading Lists' })).toHaveAttribute('href', '/reading-lists');
    await expect(page.getByRole('link', { name: 'Friends' })).toHaveAttribute('href', '/friends');
  });

  test('mobile shell opens a focused drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/home');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('dialog', { name: 'Site navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Studio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Community' })).toBeVisible();
  });
});
