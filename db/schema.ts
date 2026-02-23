import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  clerkId:   text('clerk_id').primaryKey(),
  email:     text('email').notNull(),
  firstName: text('first_name'),
  lastName:  text('last_name'),
  imageUrl:  text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
