/**
 * Migration script: Clerk → Better Auth
 *
 * Run ONCE against the dev DB before deploying:
 *   npx tsx scripts/migrate-to-better-auth.ts
 *
 * What it does:
 *  1. Renames `clerk_id` → `id` on the users table (keeps all values intact,
 *     FK constraints follow automatically because Postgres tracks them by
 *     column identity, not name).
 *  2. Adds `email_verified` boolean column (required by Better Auth).
 *
 * After running this script, run `npm run db:push` to create the new
 * Better Auth tables (session, account, verification).
 */

import { config } from 'dotenv';
config();

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log('Starting Better Auth migration…');

  // 1. Rename clerk_id → id (only if not already renamed)
  const cols = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'clerk_id'
  `;

  if (cols.length > 0) {
    console.log('Renaming clerk_id → id on users table…');
    await sql`ALTER TABLE users RENAME COLUMN clerk_id TO id`;
    console.log('✓ Renamed clerk_id → id');
  } else {
    console.log('Column already renamed (clerk_id not found), skipping.');
  }

  // 2. Add email_verified column if missing
  const emailVerifiedCol = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'email_verified'
  `;

  if (emailVerifiedCol.length === 0) {
    console.log('Adding email_verified column…');
    await sql`ALTER TABLE users ADD COLUMN email_verified boolean NOT NULL DEFAULT false`;
    console.log('✓ Added email_verified');
  } else {
    console.log('email_verified already exists, skipping.');
  }

  // 3. Add name column if missing (Better Auth writes display name here via field mapping)
  const nameCol = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND column_name = 'name'
  `;

  if (nameCol.length === 0) {
    console.log('Adding name column…');
    await sql`ALTER TABLE users ADD COLUMN name text`;
    // Populate from username for existing users
    await sql`UPDATE users SET name = username WHERE name IS NULL AND username IS NOT NULL`;
    console.log('✓ Added name column');
  } else {
    console.log('name column already exists, skipping.');
  }

  console.log('\nMigration complete!');
  console.log('Next step: run `npm run db:push` to create Better Auth tables (session, account, verification).');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
