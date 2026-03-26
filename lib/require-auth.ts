import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Server-side auth guard used by all server actions.
 * Returns the current user's ID or throws if unauthenticated or banned.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  // Check if user is banned
  const userData = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { banned: true },
  });
  if (userData?.banned) throw new Error('Your account has been suspended.');

  return userId;
}

/**
 * Like requireAuth but returns null instead of throwing.
 * Use for optional auth (e.g. public pages that show extra info when signed in).
 */
export async function getOptionalUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}
