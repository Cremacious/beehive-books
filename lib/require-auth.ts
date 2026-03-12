import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Server-side auth guard used by all server actions.
 * Returns the current user's ID or throws if unauthenticated.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

/**
 * Like requireAuth but returns null instead of throwing.
 * Use for optional auth (e.g. public pages that show extra info when signed in).
 */
export async function getOptionalUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}
