import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import BackButton from '@/components/shared/back-button';
import {
  getClubAction,
  getClubMembersAction,
  getPendingJoinRequestsAction,
  getClubFriendsForInviteAction,
} from '@/lib/actions/club.actions';
import MembersGrid from '@/components/clubs/members-grid';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getClubAction(clubId);
  return {
    title: club ? `${club.name} — Members` : 'Members',
    description: club ? `See all members of the ${club.name} book club.` : 'Club members.',
  };
}

export default async function ClubMembersPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const { userId } = await auth();

  const club = await getClubAction(clubId);
  if (!club) notFound();
  if (!club.isMember) notFound();

  const myRole = club.myRole ?? 'MEMBER';
  const isOwnerOrMod = myRole === 'OWNER' || myRole === 'MODERATOR';

  const [members, pendingRequests, invitableFriends] = await Promise.all([
    getClubMembersAction(clubId),
    isOwnerOrMod ? getPendingJoinRequestsAction(clubId) : Promise.resolve([]),
    isOwnerOrMod ? getClubFriendsForInviteAction(clubId) : Promise.resolve([]),
  ]);

  return (
    <div className="px-4 py-6 md:px-8 max-w-5xl mx-auto">
      <BackButton href={`/clubs/${clubId}`} label={club.name} className="mb-6" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mainFont">Members</h1>
          <p className="text-white/80 text-sm mt-0.5">
            {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
      </div>
      <MembersGrid
        members={members}
        clubId={clubId}
        currentUserId={userId ?? ''}
        myRole={myRole}
        pendingRequests={pendingRequests}
        invitableFriends={invitableFriends}
      />
    </div>
  );
}
