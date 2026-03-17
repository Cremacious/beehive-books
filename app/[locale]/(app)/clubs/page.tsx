import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Bell } from 'lucide-react';
import { getAllUserClubsAction, getPendingClubInvitesAction } from '@/lib/actions/club.actions';
import MyClubs from '@/components/clubs/my-clubs';
import { ClubInviteActions } from '@/components/clubs/club-invite-actions';

export const metadata = {
  title: 'Book Clubs',
  description:
    'Join and host book clubs - read together, discuss, and share your thoughts with a group.',
};

export default async function ClubsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const [userClubs, pendingInvites] = await Promise.all([
    userId ? getAllUserClubsAction() : [],
    userId ? getPendingClubInvitesAction() : [],
  ]);

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Group Workspace
        </p>
        <h1 className="text-3xl font-bold text-white mainFont">My Book Clubs</h1>
        <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
          Join or host book clubs to read together, discuss, and share your thoughts with a group.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="mb-8 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-semibold text-[#FFC300]">
              {pendingInvites.length} pending club invite
              {pendingInvites.length !== 1 ? 's' : ''}
            </span>
          </div>
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-4 py-2 border-t border-[#FFC300]/10"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{invite.club.name}</p>
                <p className="text-xs text-white/80 mt-0.5">
                  Invited by {invite.invitedBy.username ?? 'Unknown'}
                </p>
              </div>
              <ClubInviteActions inviteId={invite.id} clubId={invite.club.id} />
            </div>
          ))}
        </div>
      )}

      <MyClubs clubs={userClubs} />
    </div>
  );
}
