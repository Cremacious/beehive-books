import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { account } from '@/db/schema';
import { getCurrentUserAction } from '@/lib/actions/user.actions';
import { SettingsClient } from '@/components/settings/settings-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Beehive Books account settings.',
};

export default async function SettingsPage() {
  const user = await getCurrentUserAction();
  if (!user) redirect('/sign-in');

  const hasPasswordAccount = !!(await db.query.account.findFirst({
    where: and(eq(account.userId, user.id), eq(account.providerId, 'credential')),
    columns: { id: true },
  }));

  return (
    <div className="px-4 py-6 md:px-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mainFont">Settings</h1>
   
      </div>
      <SettingsClient
        user={{
          id: user.id,
          username: user.username,
          email: user.email,
          image: user.image,
          premium: user.premium,
          stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
          bio: user.bio,
        }}
        hasPasswordAccount={hasPasswordAccount}
      />
    </div>
  );
}
