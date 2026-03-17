import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
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
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) notFound();

  const hive = await getHiveAction(hiveId);
  if (!hive || !hive.isMember) notFound();

  const initialPrompts = await getHivePromptsAction(hiveId);

  return <HivePrompts hiveId={hiveId} initialPrompts={initialPrompts} />;
}
