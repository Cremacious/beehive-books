// npm run db:seed
// Seeds test users via Better Auth email/password signup

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from '../db/schema';
import { createId } from '@paralleldrive/cuid2';

const PASSWORD = 'B33h!ve#Dev2026$';

const SEED_USERS = [
  { email: 'alice@beehive.dev', username: 'alice_monroe', firstName: 'Alice', lastName: 'Monroe' },
  { email: 'bob@beehive.dev', username: 'bob_carter', firstName: 'Bob', lastName: 'Carter' },
  { email: 'charlie@beehive.dev', username: 'charlie_stone', firstName: 'Charlie', lastName: 'Stone' },
  { email: 'diana@beehive.dev', username: 'diana_wells', firstName: 'Diana', lastName: 'Wells' },
  { email: 'evan@beehive.dev', username: 'evan_brooks', firstName: 'Evan', lastName: 'Brooks' },
  { email: 'fiona@beehive.dev', username: 'fiona_hayes', firstName: 'Fiona', lastName: 'Hayes' },
  { email: 'george@beehive.dev', username: 'george_lane', firstName: 'George', lastName: 'Lane' },
  { email: 'hannah@beehive.dev', username: 'hannah_cross', firstName: 'Hannah', lastName: 'Cross' },
] as const;

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set in .env');
  process.exit(1);
}

const rawSql = neon(process.env.DATABASE_URL);
const db = drizzle(rawSql, { schema });

async function upsertUser(user: (typeof SEED_USERS)[number]) {
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, user.email),
  });

  if (existing) {
    console.log(`  ↩  User already exists: ${user.username}`);
    return;
  }

  const id = createId();
  await db.insert(schema.users).values({
    id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    emailVerified: true,
    onboardingComplete: true,
  });

  console.log(`  ✓  Inserted user: ${user.username} (${id})`);
}

async function main() {
  console.log('\n  Beehive Books — seeding test users\n');
  console.log(`   Password for all accounts: ${PASSWORD}\n`);
  console.log('   Note: Users are seeded directly into the DB.\n   To set passwords, sign up via the app or use the Better Auth API.\n');

  for (const user of SEED_USERS) {
    console.log(`→ ${user.firstName} ${user.lastName} <${user.email}>`);
    try {
      await upsertUser(user);
    } catch (err) {
      console.error(`  ✗  Failed for ${user.email}:`, err);
    }
  }

  console.log('\n  Done!\n');
}

main().catch(console.error);
