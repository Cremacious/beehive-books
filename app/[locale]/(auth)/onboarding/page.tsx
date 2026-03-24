import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export const metadata: Metadata = {
  title: 'Welcome',
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect('/sign-in');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { username: true },
  });

  return <OnboardingFlow existingUsername={user?.username ?? null} />;
}
