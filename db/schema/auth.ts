import {
  pgTable,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image_url'),
  // App-specific fields
  username: text('username').unique(),
  bio: text('bio'),
  onboardingComplete: boolean('onboarding_complete').default(false).notNull(),
  premium: boolean('premium').default(false).notNull(),
  role: text('role', { enum: ['member', 'moderator', 'admin'] }).notNull().default('member'),
  // Stripe billing
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id'),
  stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
