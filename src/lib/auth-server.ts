import { auth } from './auth';
import { headers } from 'next/headers';

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return null;
  }

  return session.user;
}
