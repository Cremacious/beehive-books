import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Bell } from 'lucide-react';
import {
  getAllUserHivesAction,
  getPendingHiveInvitesAction,
} from '@/lib/actions/hive.actions';
import MyHives from '@/components/hive/my-hives';
import { HiveInviteActions } from '@/components/hive/hive-invite-actions';

export const metadata = {
  title: 'Hive',
  description:
    'Collaborate with writers and beta readers to build a book together. Join or create a Hive.',
};

export default async function HivePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const [userHives, pendingInvites] = await Promise.all([
    userId ? getAllUserHivesAction() : [],
    userId ? getPendingHiveInvitesAction() : [],
  ]);

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#FFC300] uppercase tracking-[0.15em] mb-2">
          Collaboration Workspace
        </p>
        <h1 className="text-3xl font-bold text-white mainFont">My Hives</h1>
        <p className="mt-2 text-sm text-white/80 max-w-sm leading-relaxed">
          Join or create a Hive to work with other writers and beta readers on
          building a book together.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="mb-8 rounded-2xl bg-[#FFC300]/5 border border-[#FFC300]/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FFC300]" />
            <span className="text-sm font-semibold text-[#FFC300]">
              {pendingInvites.length} pending hive invite
              {pendingInvites.length !== 1 ? 's' : ''}
            </span>
          </div>
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-4 py-2 border-t border-[#FFC300]/10"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {invite.hiveName}
                </p>
                <p className="text-xs text-white/80 mt-0.5">
                  Invited by {invite.invitedBy.username ?? 'Unknown'} · as{' '}
                  {invite.role.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <HiveInviteActions inviteId={invite.id} hiveId={invite.hiveId} />
            </div>
          ))}
        </div>
      )}

      <MyHives hives={userHives} />
    </div>
  );
}
