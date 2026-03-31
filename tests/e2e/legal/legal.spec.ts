/**
 * Legal pages E2E tests — all as guest, no auth required
 *
 * Covers:
 *  - /terms   loads without redirect, contains "Terms of Service"
 *  - /privacy loads without redirect, contains "Privacy Policy"
 *  - /dmca    loads without redirect, contains "DMCA"
 *  - /cookies loads without redirect, contains "Cookie"
 *
 * These pages live under app/[locale]/(public)/* and are intentionally
 * accessible without authentication.
 *
 * Run just this file:
 *   npx playwright test legal/legal.spec.ts --project=chromium
 */

import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

const LEGAL_PAGES = [
  { path: '/terms',   contains: 'Terms of Service'  },
  { path: '/privacy', contains: 'Privacy Policy'    },
  { path: '/dmca',    contains: 'DMCA'              },
  { path: '/cookies', contains: 'Cookie'            },
] as const;

for (const { path, contains } of LEGAL_PAGES) {
  test(`${path} loads without redirect and contains "${contains}"`, async ({ page }) => {
    await page.goto(path);

    // Must not redirect to sign-in
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page).toHaveURL(path);

    // The page must contain the expected heading text somewhere
    await expect(page.getByText(contains, { exact: false }).first()).toBeVisible();
  });
}
