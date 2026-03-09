import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import {
  getClubAction,
  getClubDiscussionsAction,
  getClubMembersAction,
  getClubReadingListAction,
  checkClubJoinRequestStatusAction,
} from '@/lib/actions/club.actions';
import ClubDashboard from '@/components/clubs/club-dashboard';
import ClubGate from '@/components/clubs/club-gate';
import type { Metadata } from 'next';
import BackButton from '@/components/shared/back-button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getClubAction(clubId);
  return {
    title: club ? club.name : 'Book Club',
    description: club
      ? `Join the ${club.name} book club on Beehive Books — read, discuss, and connect with members.`
      : 'A book club on Beehive Books.',
  };
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

  if (!club.isMember) {
    if (club.privacy === 'PRIVATE') notFound();

    const joinRequestStatus = userId
      ? await checkClubJoinRequestStatusAction(clubId)
      : 'none';

    return (
      <ClubGate
        clubId={clubId}
        clubName={club.name}
        description={club.description}
        memberCount={club.memberCount}
        joinRequestStatus={joinRequestStatus}
        isSignedIn={!!userId}
      />
    );
  }

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
