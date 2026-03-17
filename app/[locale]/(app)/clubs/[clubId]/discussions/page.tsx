import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import BackButton from '@/components/shared/back-button';
import { getClubAction, getClubDiscussionsAction } from '@/lib/actions/club.actions';
import DiscussionList from '@/components/clubs/discussion-list';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getClubAction(clubId);
  return {
    title: club ? `${club.name} — Discussions` : 'Discussions',
    description: club ? `Browse and join discussions in the ${club.name} book club.` : 'Club discussions.',
  };
}

export default async function ClubDiscussionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { clubId } = await params;
  const { page: pageStr } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;
  const page = Number(pageStr) || 1;

  const club = await getClubAction(clubId);
  if (!club) notFound();

  const { discussions, total } = await getClubDiscussionsAction(clubId, page);

  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <BackButton href={`/clubs/${clubId}`} label={club.name} className="mb-6" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white mainFont">Discussions</h1>
      </div>
      <DiscussionList
        discussions={discussions}
        clubId={clubId}
        currentUserId={userId}
        myRole={club.myRole}
        total={total}
        page={page}
      />
    </div>
  );
}
