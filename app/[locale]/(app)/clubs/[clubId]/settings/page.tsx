import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import BackButton from '@/components/shared/back-button';
import { getClubAction, getClubFriendsForInviteAction, getClubPendingInvitedFriendsAction } from '@/lib/actions/club.actions';
import EditClubForm from '@/components/clubs/edit-club-form';
import type { FriendUser } from '@/lib/actions/friend.actions';

export const metadata = {
  title: 'Club Settings',
  description: 'Manage your book club settings, name, description, and privacy.',
};

export default async function ClubSettingsPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const club = await getClubAction(clubId);
  if (!club) notFound();
  if (club.myRole !== 'OWNER') redirect(`/clubs/${clubId}`);

  const [invitableFriends, pendingInvitedFriends] = (await Promise.all([
    getClubFriendsForInviteAction(clubId),
    getClubPendingInvitedFriendsAction(clubId),
  ])) as [FriendUser[], FriendUser[]];

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
      <BackButton href={`/clubs/${clubId}`} label={club.name} className="mb-6" />
      <h1 className="text-2xl font-bold text-white mb-6 mainFont">Club Settings</h1>
      <div className="bg-[#1e1e1e] rounded-2xl border border-[#2a2a2a] p-6">
        <EditClubForm club={club} invitableFriends={invitableFriends} pendingInvitedFriends={pendingInvitedFriends} />
      </div>
    </div>
  );
}
