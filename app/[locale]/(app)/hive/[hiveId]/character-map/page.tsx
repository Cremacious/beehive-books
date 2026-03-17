import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getWikiEntriesByCategoryAction } from '@/lib/actions/hive-wiki.actions';
import HiveCharacterMap from '@/components/hive/hive-character-map';

export const metadata = { title: 'Character Map' };

export default async function HiveCharacterMapPage({
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

  const characters = await getWikiEntriesByCategoryAction(hiveId, 'CHARACTER');

  return (
    <HiveCharacterMap
      hiveId={hiveId}
      characters={characters}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
