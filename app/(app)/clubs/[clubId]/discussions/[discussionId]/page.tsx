import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { getClubAction, getClubDiscussionByIdAction } from '@/lib/actions/club.actions';
import DiscussionThread from '@/components/clubs/discussion-thread';

export default async function DiscussionThreadPage({
  params,
}: {
  params: Promise<{ clubId: string; discussionId: string }>;
}) {
  const { clubId, discussionId } = await params;
  const { userId } = await auth();

  const [club, discussion] = await Promise.all([
    getClubAction(clubId),
    getClubDiscussionByIdAction(clubId, discussionId),
  ]);

  if (!club || !discussion) notFound();

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
      <DiscussionThread
        discussion={discussion}
        clubId={clubId}
        currentUserId={userId}
        isMember={club.isMember}
        myRole={club.myRole}
      />
    </div>
  );
}
