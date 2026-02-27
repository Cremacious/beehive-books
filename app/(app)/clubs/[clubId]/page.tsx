import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  getClubAction,
  getClubDiscussionsAction,
  getClubMembersAction,
  getClubReadingListAction,
} from '@/lib/actions/club.actions';
import ClubDashboard from '@/components/clubs/club-dashboard';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getClubAction(clubId);
  return { title: club ? club.name : 'Book Club' };
}

export default async function ClubDashboardPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const { userId } = await auth();

  const club = await getClubAction(clubId);
  if (!club) notFound();

  const [{ discussions }, members, readingList] = await Promise.all([
    getClubDiscussionsAction(clubId, 1),
    getClubMembersAction(clubId),
    getClubReadingListAction(clubId),
  ]);

  return (
    <ClubDashboard
      club={club}
      recentDiscussions={discussions.slice(0, 3)}
      members={members}
      readingList={readingList}
      currentUserId={userId}
    />
  );
}
