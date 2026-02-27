import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getClubAction, getClubReadingListAction } from '@/lib/actions/club.actions';
import { ListStats } from '@/components/reading-lists/list-stats';
import { ClubBookListView } from '@/components/clubs/club-book-list-view';
import { ClubAddBookForm } from '@/components/clubs/club-add-book-form';

export default async function ClubReadingListPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  await auth();

  const club = await getClubAction(clubId);
  if (!club) notFound();

  const books = await getClubReadingListAction(clubId);
  const isMod = club.myRole === 'OWNER' || club.myRole === 'MODERATOR';
  const bookCount = books.length;
  const readCount = books.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <Link
        href={`/clubs/${clubId}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {club.name}
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">Reading List</h1>
      <p className="text-white/80 text-sm mb-6">{club.name}&apos;s shared reading list</p>

      <ListStats bookCount={bookCount} readCount={readCount} />

      <ClubBookListView books={books} clubId={clubId} isMod={isMod} />

      {club.isMember && <ClubAddBookForm clubId={clubId} />}
    </div>
  );
}
