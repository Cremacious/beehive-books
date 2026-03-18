import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/en');
  await expect(page).toHaveTitle(/Beehive/i);
});
