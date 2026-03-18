import ClubForm from './club-form';
import type { BookClub } from '@/lib/types/club.types';
import type { FriendUser } from '@/lib/actions/friend.actions';

export default function EditClubForm({
  club,
  invitableFriends = [],
  pendingInvitedFriends = [],
}: {
  club: BookClub;
  invitableFriends?: FriendUser[];
  pendingInvitedFriends?: FriendUser[];
}) {
  return (
    <ClubForm
      mode="edit"
      clubId={club.id}
      defaultValues={club}
      cancelHref={`/clubs/${club.id}`}
      friends={invitableFriends}
      pendingFriends={pendingInvitedFriends}
    />
  );
}
