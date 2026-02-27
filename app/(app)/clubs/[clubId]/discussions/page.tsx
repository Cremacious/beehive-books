import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClubAction, getClubDiscussionsAction } from '@/lib/actions/club.actions';
import DiscussionList from '@/components/clubs/discussion-list';

export default async function ClubDiscussionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clubId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { clubId } = await params;
  const { page: pageStr } = await searchParams;
  const { userId } = await auth();
  const page = Number(pageStr) || 1;

  const club = await getClubAction(clubId);
  if (!club) notFound();

  const { discussions, total } = await getClubDiscussionsAction(clubId, page);

  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <Link
        href={`/clubs/${clubId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {club.name}
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Discussions</h1>
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
