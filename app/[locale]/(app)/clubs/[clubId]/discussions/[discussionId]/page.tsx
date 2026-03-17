import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import BackButton from '@/components/shared/back-button';
import { getClubAction, getClubDiscussionByIdAction } from '@/lib/actions/club.actions';
import DiscussionThread from '@/components/clubs/discussion-thread';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string; discussionId: string }>;
}): Promise<Metadata> {
  const { clubId, discussionId } = await params;
  const [club, discussion] = await Promise.all([
    getClubAction(clubId),
    getClubDiscussionByIdAction(clubId, discussionId),
  ]);
  return {
    title: discussion ? discussion.title : 'Discussion',
    description:
      club && discussion
        ? `${discussion.title} — a discussion in the ${club.name} book club.`
        : 'Club discussion.',
  };
}

export default async function DiscussionThreadPage({
  params,
}: {
  params: Promise<{ clubId: string; discussionId: string }>;
}) {
  const { clubId, discussionId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  const [club, discussion] = await Promise.all([
    getClubAction(clubId),
    getClubDiscussionByIdAction(clubId, discussionId),
  ]);

  if (!club || !discussion) notFound();

  return (
    <div className="px-4 py-6 md:px-8 max-w-3xl mx-auto">
      <BackButton href={`/clubs/${clubId}/discussions`} label="Discussions" className="mb-6" />
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
