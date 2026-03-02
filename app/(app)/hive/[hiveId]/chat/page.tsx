import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
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
  const { userId } = await auth();
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
