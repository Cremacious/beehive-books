import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction } from '@/lib/actions/hive.actions';
import HiveForm from '@/components/hive/hive-form';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}): Promise<Metadata> {
  const { hiveId } = await params;
  const hive = await getHiveAction(hiveId);
  return { title: hive ? `${hive.name} · Settings` : 'Hive Settings' };
}

export default async function HiveSettingsPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const hive = await getHiveAction(hiveId);
  if (!hive) notFound();
  if (hive.myRole !== 'OWNER') redirect(`/hive/${hiveId}`);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">Hive Settings</h2>
        <p className="text-sm text-white/60 mt-0.5">Manage your hive details and preferences.</p>
      </div>

      <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-6">
        <HiveForm
          mode="edit"
          hiveId={hiveId}
          defaultValues={hive}
          cancelHref={`/hive/${hiveId}`}
        />
      </div>
    </div>
  );
}
