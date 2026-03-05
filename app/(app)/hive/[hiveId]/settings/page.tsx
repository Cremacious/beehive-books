import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
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
  const { userId } = await auth();
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
      {/* <div className="mb-6">
        <h1 className="text-xl font-bold text-white mainFont">Settings</h1>
        <p className="text-sm text-white/50 mt-0.5">{hive.name}</p>
      </div> */}

      <HiveSettings
        hive={hive}
        userBooks={userBooks}
        linkedBook={linkedBook ?? null}
        invitableFriends={invitableFriends}
      />
    </div>
  );
}
