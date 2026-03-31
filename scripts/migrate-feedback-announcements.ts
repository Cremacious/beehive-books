import { sql } from 'drizzle-orm';
import { db } from '../db';

async function migrate() {
  console.log('Running feedback & announcements migration...');

  // --- feedback table ---

  // Add user_id column
  try {
    await db.execute(sql`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS user_id text REFERENCES users(id) ON DELETE SET NULL`);
    console.log('✓ feedback.user_id added');
  } catch (e) {
    console.log('feedback.user_id:', e);
  }

  // Rename type → category (add category, copy values that are still valid, drop type)
  try {
    await db.execute(sql`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general'`);
    console.log('✓ feedback.category added');
  } catch (e) {
    console.log('feedback.category:', e);
  }

  // Update old type values to map to new category values
  try {
    await db.execute(sql`
      UPDATE feedback SET category = CASE
        WHEN type = 'content_suggestion' THEN 'feature_request'
        WHEN type = 'technical_support' THEN 'bug_report'
        ELSE 'general'
      END
      WHERE category = 'general'
    `);
    console.log('✓ feedback.category backfilled');
  } catch (e) {
    console.log('feedback.category backfill:', e);
  }

  // Drop old type column
  try {
    await db.execute(sql`ALTER TABLE feedback DROP COLUMN IF EXISTS type`);
    console.log('✓ feedback.type dropped');
  } catch (e) {
    console.log('feedback.type drop:', e);
  }

  // Add status column
  try {
    await db.execute(sql`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'`);
    console.log('✓ feedback.status added');
  } catch (e) {
    console.log('feedback.status:', e);
  }

  // Add updated_at column
  try {
    await db.execute(sql`ALTER TABLE feedback ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL`);
    console.log('✓ feedback.updated_at added');
  } catch (e) {
    console.log('feedback.updated_at:', e);
  }

  // --- announcements table ---

  // Add type column
  try {
    await db.execute(sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'community_update'`);
    console.log('✓ announcements.type added');
  } catch (e) {
    console.log('announcements.type:', e);
  }

  // Add link column
  try {
    await db.execute(sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS link text`);
    console.log('✓ announcements.link added');
  } catch (e) {
    console.log('announcements.link:', e);
  }

  // Add is_active column
  try {
    await db.execute(sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true`);
    console.log('✓ announcements.is_active added');
  } catch (e) {
    console.log('announcements.is_active:', e);
  }

  // Add updated_at column
  try {
    await db.execute(sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL`);
    console.log('✓ announcements.updated_at added');
  } catch (e) {
    console.log('announcements.updated_at:', e);
  }

  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
