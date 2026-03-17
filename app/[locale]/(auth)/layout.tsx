import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.id) {
    // Only redirect fully-onboarded users away from auth pages.
    // Users who are authenticated but haven't finished onboarding must be
    // able to reach /onboarding — don't kick them out here.
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { onboardingComplete: true },
    });
    if (user?.onboardingComplete) redirect('/home');
  }

  return <>{children}</>;
}
