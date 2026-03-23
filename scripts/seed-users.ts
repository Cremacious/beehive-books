/**
 * npm run db:seed
 *
 * Seeds test users by calling the Better Auth sign-up API directly.
 * This ensures passwords are hashed correctly and all auth tables
 * (users + account) are populated exactly as they would be in production.
 *
 * After sign-up, each user's onboardingComplete flag is set to true
 * so they land on /home rather than /onboarding.
 *
 * Prerequisites:
 *   - App must be running locally on http://localhost:3000
 *   - DATABASE_URL must be set in .env
 *   - REQUIRE_EMAIL_VERIFICATION must be false (default for dev)
 *
 * Usage:
 *   npm run dev          # start the app first
 *   npm run db:seed      # in a second terminal
 *
 * Idempotent — skips users that already exist.
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';

// ─── Config ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const DEFAULT_PASSWORD = 'B33h!ve#Dev2026$';

/**
 * Seed accounts. The first entry (test1) matches the TEST_USER_EMAIL /
 * TEST_USER_PASSWORD env vars used by Playwright.
 *
 * Roles (for reference — enforced by your own app logic, not better-auth):
 *  test1     → primary Playwright test account (free tier, onboarding complete)
 *  alice     → free user at book limit
 *  bob       → premium user
 *  charlie   → hive owner
 *  diana     → hive member / beta reader
 *  evan      → book club owner
 *  fiona     → new user (onboarding complete but no content)
 *  george    → author with public books
 *  hannah    → reader / commenter
 */
const SEED_USERS = [
  // ── Playwright test account (matches TEST_USER_EMAIL / TEST_USER_PASSWORD) ──
  {
    email: process.env.TEST_USER_EMAIL ?? 'test1@example.com',
    username: 'test_user_1',
    password: process.env.TEST_USER_PASSWORD ?? 'Test33Cat!',
    name: 'Test User',
  },
  // ── Named dev seed accounts ──────────────────────────────────────────────
  { email: 'alice@beehive.dev',   username: 'alice_monroe',   password: DEFAULT_PASSWORD, name: 'Alice Monroe'   },
  { email: 'bob@beehive.dev',     username: 'bob_carter',     password: DEFAULT_PASSWORD, name: 'Bob Carter'     },
  { email: 'charlie@beehive.dev', username: 'charlie_stone',  password: DEFAULT_PASSWORD, name: 'Charlie Stone'  },
  { email: 'diana@beehive.dev',   username: 'diana_wells',    password: DEFAULT_PASSWORD, name: 'Diana Wells'    },
  { email: 'evan@beehive.dev',    username: 'evan_brooks',    password: DEFAULT_PASSWORD, name: 'Evan Brooks'    },
  { email: 'fiona@beehive.dev',   username: 'fiona_hayes',    password: DEFAULT_PASSWORD, name: 'Fiona Hayes'    },
  { email: 'george@beehive.dev',  username: 'george_lane',    password: DEFAULT_PASSWORD, name: 'George Lane'    },
  { email: 'hannah@beehive.dev',  username: 'hannah_cross',   password: DEFAULT_PASSWORD, name: 'Hannah Cross'   },
] as const;

// ─── DB setup ───────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set in .env');
  process.exit(1);
}

const rawSql = neon(process.env.DATABASE_URL);
const db = drizzle(rawSql, { schema });

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Call the Better Auth sign-up endpoint. Returns the created user ID on
 * success, or null if the user already exists (409) or sign-up fails.
 */
async function signUpViaApi(
  email: string,
  password: string,
  name: string
): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (res.status === 409 || res.status === 422) {
    // 409 = already exists, 422 = validation error (also usually duplicate)
    return 'exists';
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`    ✗  Sign-up API error ${res.status}: ${body}`);
    return null;
  }

  const data = await res.json().catch(() => null);
  return data?.user?.id ?? null;
}

/**
 * Patch the user row to set username + onboardingComplete after sign-up.
 * Better Auth's sign-up endpoint doesn't accept custom fields directly.
 */
async function patchUserRow(email: string, username: string): Promise<boolean> {
  try {
    const result = await db
      .update(schema.users)
      .set({ username, onboardingComplete: true, emailVerified: true })
      .where(eq(schema.users.email, email))
      .returning({ id: schema.users.id });

    return result.length > 0;
  } catch (err) {
    console.error(`    ✗  DB patch failed for ${email}:`, err);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function seedUser(user: (typeof SEED_USERS)[number]) {
  console.log(`→  ${user.username} <${user.email}>`);

  // 1. Sign up via Better Auth API (creates users + account rows with hashed pw)
  const result = await signUpViaApi(user.email, user.password, user.name);

  if (result === null) {
    console.log(`   ✗  Sign-up failed — skipping`);
    return;
  }

  if (result === 'exists') {
    console.log(`   ↩  Already exists — patching user row`);
  } else {
    console.log(`   ✓  Created via API (id: ${result})`);
  }

  // 2. Patch the user row with username + onboardingComplete
  const patched = await patchUserRow(user.email, user.username);
  if (patched) {
    console.log(`   ✓  Patched: username=${user.username}, onboardingComplete=true`);
  } else {
    console.log(`   ⚠  Patch found no row — user may not have been created`);
  }
}

async function main() {
  console.log('\n  🐝  Beehive Books — seeding test users\n');
  console.log(`  API base: ${BASE_URL}`);
  console.log(`  Default password: ${DEFAULT_PASSWORD}`);
  console.log(`  Playwright test account: ${SEED_USERS[0].email} / ${SEED_USERS[0].password}\n`);

  for (const user of SEED_USERS) {
    try {
      await seedUser(user);
    } catch (err) {
      console.error(`   ✗  Unexpected error for ${user.email}:`, err);
    }
    console.log('');
  }

  console.log('  Done! All users seeded.\n');
  console.log('  ⚠️  Remember: app must be running on', BASE_URL, 'for this script to work.\n');
}

main().catch(console.error);
