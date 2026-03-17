import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getHiveAction } from '@/lib/actions/hive.actions';
import { getChatMessagesAction } from '@/lib/actions/hive-chat.actions';
import HiveChat from '@/components/hive/hive-chat';

export const metadata = { title: 'Hive Chat' };

export default async function HiveChatPage({
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

  const initialMessages = await getChatMessagesAction(hiveId);

  return (
    <HiveChat
      hiveId={hiveId}
      initialMessages={initialMessages}
      currentUserId={userId}
      myRole={hive.myRole ?? 'CONTRIBUTOR'}
    />
  );
}
