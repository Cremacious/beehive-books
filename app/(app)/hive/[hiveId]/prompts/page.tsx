import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getHivePromptsAction } from '@/lib/actions/hive-prompts.actions';
import HivePrompts from '@/components/hive/hive-prompts';

export const metadata = { title: 'Writing Prompts' };

export default async function HivePromptsPage({
  params,
}: {
  params: Promise<{ hiveId: string }>;
}) {
  const { hiveId } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const initialPrompts = await getHivePromptsAction(hiveId);

  return <HivePrompts hiveId={hiveId} initialPrompts={initialPrompts} />;
}
