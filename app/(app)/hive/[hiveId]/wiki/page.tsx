import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getWikiEntriesAction } from '@/lib/actions/hive-wiki.actions';
import HiveWiki from '@/components/hive/hive-wiki';

export const metadata = { title: 'World Wiki' };

export default async function HiveWikiPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const initialEntries = await getWikiEntriesAction(hiveId);

  return (
    <HiveWiki
      hiveId={hiveId}
      initialEntries={initialEntries}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
