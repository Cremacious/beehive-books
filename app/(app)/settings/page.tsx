import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUserAction } from '@/lib/actions/user.actions';
import { SettingsClient } from '@/components/settings/settings-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your Beehive Books account settings.',
};

export default async function SettingsPage() {
  const user = await getCurrentUserAction();
  if (!user) redirect('/sign-in');

  return (
    <div className="px-4 py-6 md:px-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mainFont">Settings</h1>
        <p className="text-sm text-white/40 mt-1">Manage your account</p>
      </div>
      <SettingsClient user={user} />
    </div>
  );
}
