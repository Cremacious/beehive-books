/**
 * Beehive Books — Dev Seed Script
 * Run with: npm run db:seed
 *
 * Creates 8 test users covering key scenarios, with proper better-auth
 * account records so users can actually log in.
 *
 * Hashing: scrypt — N:16384, r:16, p:1, dkLen:64 — matches better-auth exactly.
 * Format stored: `salt_hex:key_hex`
 */

import 'dotenv/config';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import { createId } from '@paralleldrive/cuid2';

const scrypt = promisify(_scrypt);

// ---------------------------------------------------------------------------
// Guards
// ---------------------------------------------------------------------------

if (!process.env.DATABASE_URL) {
  console.error('❌  DATABASE_URL is not set');
  process.exit(1);
}

if (
  process.env.NODE_ENV === 'production' ||
  process.env.DATABASE_URL.includes('prod')
) {
  console.error('❌  Refusing to seed — looks like a production database.');
  console.error('   DATABASE_URL contains "prod" or NODE_ENV=production.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// DB
// ---------------------------------------------------------------------------

const rawSql = neon(process.env.DATABASE_URL);
const db = drizzle(rawSql, { schema });

// ---------------------------------------------------------------------------
// Password hashing — mirrors better-auth exactly
// scrypt: N=16384, r=16, p=1, dkLen=64
// stored as: "salt_hex:key_hex"
// ---------------------------------------------------------------------------

const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(
    password.normalize('NFKC'),
    salt,
    64,
    SCRYPT_PARAMS,
  )) as Buffer;
  return `${salt}:${key.toString('hex')}`;
}

// ---------------------------------------------------------------------------
// Seed config
// ---------------------------------------------------------------------------

const PASSWORD = 'B33h!ve#Dev2026$';

interface SeedUser {
  email: string;
  username: string;
  name: string;
  premium?: boolean;
  onboardingComplete?: boolean;
}

const SEED_USERS: SeedUser[] = [
  { email: 'alice@beehive.dev',   username: 'alice_monroe',   name: 'Alice Monroe' },
  { email: 'bob@beehive.dev',     username: 'bob_carter',     name: 'Bob Carter',   premium: true },
  { email: 'charlie@beehive.dev', username: 'charlie_stone',  name: 'Charlie Stone' },
  { email: 'diana@beehive.dev',   username: 'diana_wells',    name: 'Diana Wells' },
  { email: 'evan@beehive.dev',    username: 'evan_brooks',    name: 'Evan Brooks' },
  { email: 'fiona@beehive.dev',   username: 'fiona_hayes',    name: 'Fiona Hayes' },
  { email: 'george@beehive.dev',  username: 'george_lane',    name: 'George Lane',  onboardingComplete: false },
  { email: 'hannah@beehive.dev',  username: 'hannah_cross',   name: 'Hannah Cross', premium: true },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function skip(msg: string) {
  console.log(`  ↩  ${msg}`);
}

function created(msg: string) {
  console.log(`  ✓  ${msg}`);
}

function warn(msg: string) {
  console.log(`  ⚠  ${msg}`);
}

// ---------------------------------------------------------------------------
// Core: upsert user + account
// ---------------------------------------------------------------------------

async function upsertUser(
  seedUser: SeedUser,
  hashedPassword: string,
): Promise<string> {
  const now = new Date();

  // Check for existing user
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, seedUser.email),
  });

  let userId: string;

  if (existing) {
    skip(`User already exists: ${seedUser.username}`);
    userId = existing.id;
  } else {
    userId = createId();
    await db.insert(schema.users).values({
      id: userId,
      email: seedUser.email,
      name: seedUser.name,
      username: seedUser.username,
      emailVerified: true,
      onboardingComplete: seedUser.onboardingComplete ?? true,
      premium: seedUser.premium ?? false,
      createdAt: now,
      updatedAt: now,
    });
    created(`User: ${seedUser.username} <${seedUser.email}>`);
  }

  // Check for existing account record
  const existingAccount = await db.query.account.findFirst({
    where: eq(schema.account.userId, userId),
  });

  if (existingAccount) {
    skip(`Account record already exists for ${seedUser.username}`);
  } else {
    await db.insert(schema.account).values({
      id: createId(),
      accountId: seedUser.email,
      providerId: 'credential',
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });
    created(`Account record (credential) for ${seedUser.username}`);
  }

  return userId;
}

// ---------------------------------------------------------------------------
// Content seeding
// ---------------------------------------------------------------------------

async function seedAliceBooks(aliceId: string) {
  const existing = await db.query.books.findFirst({
    where: eq(schema.books.userId, aliceId),
  });
  if (existing) {
    skip('Alice\'s books already exist');
    return;
  }

  const aliceBooks = [
    {
      title: 'Shadows of the Thornwood',
      description: 'A young sorceress discovers an ancient evil lurking beneath the enchanted Thornwood forest, threatening to unravel the threads of reality itself.',
    },
    {
      title: 'The Glass Throne',
      description: 'In a kingdom where magic is forbidden, a dethroned princess must master her forbidden gifts to reclaim what was stolen from her.',
    },
    {
      title: 'Echoes of the Forgotten Age',
      description: 'When an archaeologist unearths a relic from a lost magical civilization, she awakens a war that was never truly finished.',
    },
  ];

  const now = new Date();
  for (const book of aliceBooks) {
    await db.insert(schema.books).values({
      userId: aliceId,
      title: book.title,
      author: 'Alice Monroe',
      genre: 'Fantasy',
      category: 'Novel',
      description: book.description,
      privacy: 'PRIVATE',
      explorable: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  created('Alice\'s 3 private Fantasy books (at book limit)');
}

async function seedHannahBooks(hannahId: string) {
  const existing = await db.query.books.findFirst({
    where: eq(schema.books.userId, hannahId),
  });
  if (existing) {
    skip('Hannah\'s books already exist');
    return;
  }

  const hannahBooks = [
    {
      title: 'When the Stars Align',
      description: 'Two strangers meet by chance in a storm-battered coastal town. What begins as rivalry blossoms into something neither expected — and neither can walk away from.',
    },
    {
      title: 'The Language of Wildflowers',
      description: 'A botanist returns to her childhood home and finds herself entangled with the quiet man next door, who speaks more through actions than words.',
    },
  ];

  const now = new Date();
  for (const book of hannahBooks) {
    await db.insert(schema.books).values({
      userId: hannahId,
      title: book.title,
      author: 'Hannah Cross',
      genre: 'Romance',
      category: 'Novel',
      description: book.description,
      privacy: 'PUBLIC',
      explorable: true,
      createdAt: now,
      updatedAt: now,
    });
  }
  created('Hannah\'s 2 public explorable Romance books');
}

async function seedCharlieHive(charlieId: string, dianaId: string) {
  const existing = await db.query.hives.findFirst({
    where: eq(schema.hives.ownerId, charlieId),
  });

  let hiveId: string;

  if (existing) {
    skip('Charlie\'s hive already exists');
    hiveId = existing.id;
  } else {
    const now = new Date();
    hiveId = createId();
    await db.insert(schema.hives).values({
      id: hiveId,
      ownerId: charlieId,
      name: 'The Inkwell',
      description: 'A collaborative fantasy writing hive',
      privacy: 'PUBLIC',
      genre: 'Fantasy',
      memberCount: 2,
      createdAt: now,
      updatedAt: now,
    });
    created('Hive: "The Inkwell" (owner: charlie_stone)');

    // Add Charlie as OWNER member
    await db.insert(schema.hiveMembers).values({
      hiveId,
      userId: charlieId,
      role: 'OWNER',
      joinedAt: now,
    });
    created('Charlie added to hive as OWNER');
  }

  // Add Diana as member (idempotent)
  const dianaInHive = await db.query.hiveMembers.findFirst({
    where: eq(schema.hiveMembers.userId, dianaId),
  });

  if (dianaInHive) {
    skip('Diana already a hive member');
  } else {
    await db.insert(schema.hiveMembers).values({
      hiveId,
      userId: dianaId,
      role: 'CONTRIBUTOR',
      joinedAt: new Date(),
    });
    created('Diana added to "The Inkwell" as CONTRIBUTOR');
  }
}

async function seedEvanClub(evanId: string, fionaId: string) {
  const existing = await db.query.bookClubs.findFirst({
    where: eq(schema.bookClubs.ownerId, evanId),
  });

  let clubId: string;

  if (existing) {
    skip('Evan\'s book club already exists');
    clubId = existing.id;
  } else {
    const now = new Date();
    clubId = createId();
    await db.insert(schema.bookClubs).values({
      id: clubId,
      ownerId: evanId,
      name: 'Page Turners',
      description: 'A weekly book discussion club',
      privacy: 'PUBLIC',
      explorable: true,
      memberCount: 2,
      createdAt: now,
      updatedAt: now,
    });
    created('Book club: "Page Turners" (owner: evan_brooks)');

    // Add Evan as OWNER member
    await db.insert(schema.clubMembers).values({
      clubId,
      userId: evanId,
      role: 'OWNER',
      joinedAt: now,
    });
    created('Evan added to club as OWNER');
  }

  // Add Fiona as member (idempotent)
  const fionaInClub = await db.query.clubMembers.findFirst({
    where: eq(schema.clubMembers.userId, fionaId),
  });

  if (fionaInClub) {
    skip('Fiona already a club member');
  } else {
    await db.insert(schema.clubMembers).values({
      clubId,
      userId: fionaId,
      role: 'MEMBER',
      joinedAt: new Date(),
    });
    created('Fiona added to "Page Turners" as MEMBER');
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Beehive Books — Dev Seed Script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  Password for all accounts: ${PASSWORD}`);
  console.log('  Hashing: scrypt (N=16384, r=16, p=1, dkLen=64) — matches better-auth\n');

  // Pre-hash the password once
  console.log('  Hashing password...');
  const hashedPassword = await hashPassword(PASSWORD);
  console.log('  ✓  Password hashed\n');

  // Track user IDs for content seeding
  const userIds: Record<string, string> = {};

  // Seed users
  for (const seedUser of SEED_USERS) {
    const label = seedUser.username.padEnd(16);
    const tags = [
      seedUser.premium ? 'premium' : 'free',
      seedUser.onboardingComplete === false ? 'onboarding:false' : '',
    ].filter(Boolean).join(', ');
    console.log(`→ ${label} <${seedUser.email}>${tags ? ` [${tags}]` : ''}`);

    try {
      userIds[seedUser.username] = await upsertUser(seedUser, hashedPassword);
    } catch (err) {
      console.error(`  ✗  Failed for ${seedUser.email}:`, err);
    }
    console.log();
  }

  // Seed content
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Seeding content...\n');

  try {
    if (userIds['alice_monroe']) {
      console.log('→ Alice\'s books (free user at book limit)');
      await seedAliceBooks(userIds['alice_monroe']);
      console.log();
    }

    if (userIds['hannah_cross']) {
      console.log('→ Hannah\'s books (premium, public + explorable)');
      await seedHannahBooks(userIds['hannah_cross']);
      console.log();
    }

    if (userIds['charlie_stone'] && userIds['diana_wells']) {
      console.log('→ Charlie\'s hive + Diana as member');
      await seedCharlieHive(userIds['charlie_stone'], userIds['diana_wells']);
      console.log();
    }

    if (userIds['evan_brooks'] && userIds['fiona_hayes']) {
      console.log('→ Evan\'s book club + Fiona as member');
      await seedEvanClub(userIds['evan_brooks'], userIds['fiona_hayes']);
      console.log();
    }
  } catch (err) {
    console.error('  ✗  Content seeding failed:', err);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✅  Seed complete!\n');
  console.log('  Test accounts summary:');
  console.log('  ┌─────────────────┬──────────────────────────┬───────────────────────────────┐');
  console.log('  │ Username        │ Email                    │ Scenario                      │');
  console.log('  ├─────────────────┼──────────────────────────┼───────────────────────────────┤');
  console.log('  │ alice_monroe    │ alice@beehive.dev        │ Free user (3 books, at limit) │');
  console.log('  │ bob_carter      │ bob@beehive.dev          │ Premium user                  │');
  console.log('  │ charlie_stone   │ charlie@beehive.dev      │ Hive owner (The Inkwell)      │');
  console.log('  │ diana_wells     │ diana@beehive.dev        │ Hive member                   │');
  console.log('  │ evan_brooks     │ evan@beehive.dev         │ Book club owner (Page Turners)│');
  console.log('  │ fiona_hayes     │ fiona@beehive.dev        │ Book club member              │');
  console.log('  │ george_lane     │ george@beehive.dev       │ New user (onboarding pending) │');
  console.log('  │ hannah_cross    │ hannah@beehive.dev       │ Premium + 2 public books      │');
  console.log('  └─────────────────┴──────────────────────────┴───────────────────────────────┘');
  console.log(`\n  Password: ${PASSWORD}\n`);
}

main().catch((err) => {
  console.error('\n  ✗  Seed script crashed:', err);
  process.exit(1);
});
