import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
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
  const { userId } = await auth();
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
