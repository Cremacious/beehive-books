import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { users, session, account, verification } from '@/db/schema';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session, account, verification },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // TODO: configure email sending for password reset
    // sendResetPasswordEmail: async ({ user, url }) => {
    //   await sendEmail({ to: user.email, subject: 'Reset your password', html: `<a href="${url}">Reset password</a>` });
    // },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
    },
  },

  user: {
    additionalFields: {
      username:           { type: 'string',  required: false, defaultValue: null },
      onboardingComplete: { type: 'boolean', required: false, defaultValue: false },
      premium:            { type: 'boolean', required: false, defaultValue: false },
      role:               { type: 'string',  required: false, defaultValue: 'member' },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh daily
  },

  trustedOrigins: [process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'],
});

export type Session = typeof auth.$Infer.Session;
