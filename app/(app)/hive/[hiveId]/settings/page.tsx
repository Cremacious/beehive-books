import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { books } from '@/db/schema';
import { getHiveAction, getHiveFriendsForInviteAction } from '@/lib/actions/hive.actions';
import { getUserBooksAction } from '@/lib/actions/book.actions';
import HiveSettings from '@/components/hive/hive-settings';
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
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  if (!userId) redirect('/sign-in');

  const hive = await getHiveAction(hiveId);
  if (!hive) notFound();
  if (hive.myRole !== 'OWNER') redirect(`/hive/${hiveId}`);

  const [userBooks, linkedBook, invitableFriends] = await Promise.all([
    getUserBooksAction(),
    hive.bookId
      ? db.query.books.findFirst({ where: eq(books.id, hive.bookId) })
      : Promise.resolve(null),
    getHiveFriendsForInviteAction(hiveId),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-2">


      <HiveSettings
        hive={hive}
        userBooks={userBooks}
        linkedBook={linkedBook ?? null}
        invitableFriends={invitableFriends}
      />
    </div>
  );
}
