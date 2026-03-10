/**
 * Seed script — creates test Clerk accounts + matching DB rows.
 *
 * Run:  npm run db:seed
 *
 * Safe to re-run: skips users that already exist in Clerk.
 * All accounts share the same password so you can switch between them easily.
 */

import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';

const PASSWORD = 'B33h!ve#Dev2026$';

const SEED_USERS = [
  {
    email: 'alice@beehive.dev',
    username: 'alice_monroe',
    firstName: 'Alice',
    lastName: 'Monroe',
  },
  {
    email: 'bob@beehive.dev',
    username: 'bob_carter',
    firstName: 'Bob',
    lastName: 'Carter',
  },
  {
    email: 'charlie@beehive.dev',
    username: 'charlie_stone',
    firstName: 'Charlie',
    lastName: 'Stone',
  },
  {
    email: 'diana@beehive.dev',
    username: 'diana_wells',
    firstName: 'Diana',
    lastName: 'Wells',
  },
  {
    email: 'evan@beehive.dev',
    username: 'evan_brooks',
    firstName: 'Evan',
    lastName: 'Brooks',
  },
  {
    email: 'fiona@beehive.dev',
    username: 'fiona_hayes',
    firstName: 'Fiona',
    lastName: 'Hayes',
  },
  {
    email: 'george@beehive.dev',
    username: 'george_lane',
    firstName: 'George',
    lastName: 'Lane',
  },
  {
    email: 'hannah@beehive.dev',
    username: 'hannah_cross',
    firstName: 'Hannah',
    lastName: 'Cross',
  },
] as const;

if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌  CLERK_SECRET_KEY is not set in .env');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set in .env');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function findOrCreateClerkUser(user: (typeof SEED_USERS)[number]) {
  const existing = await clerk.users.getUserList({
    emailAddress: [user.email],
  });

  if (existing.totalCount > 0) {
    const found = existing.data[0];
    console.log(`  ↩  Clerk user already exists: ${user.email} (${found.id})`);
    return found;
  }

  const created = await clerk.users.createUser({
    emailAddress: [user.email],
    password: PASSWORD,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    skipPasswordChecks: true,
    publicMetadata: { username: user.username },
  });

  console.log(`  ✓  Created Clerk user: ${user.email} (${created.id})`);
  return created;
}

async function upsertDbUser(
  clerkId: string,
  user: (typeof SEED_USERS)[number],
) {
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.clerkId, clerkId),
  });

  if (existing) {
    console.log(`  ↩  DB user already exists: ${user.username}`);
    return;
  }

  await db.insert(schema.users).values({
    clerkId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    onboardingComplete: true,
  });

  console.log(`  ✓  Inserted DB user: ${user.username}`);
}

async function main() {
  console.log('\n  Beehive Books — seeding test users\n');
  console.log(`   Password for all accounts: ${PASSWORD}\n`);

  for (const user of SEED_USERS) {
    console.log(`→ ${user.firstName} ${user.lastName} <${user.email}>`);
    try {
      const clerkUser = await findOrCreateClerkUser(user);
      await upsertDbUser(clerkUser.id, user);
    } catch (err) {
      console.error(`  ❌  Failed for ${user.email}:`, err);
    }
    console.log('');
  }

  console.log('Done.\n');
  console.log('Accounts:');
  for (const u of SEED_USERS) {
    console.log(`  ${u.email.padEnd(28)} /  ${PASSWORD}  /  @${u.username}`);
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
