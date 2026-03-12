import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import BackButton from '@/components/shared/back-button';
import { getClubAction, getClubReadingListAction } from '@/lib/actions/club.actions';
import { ListStats } from '@/components/reading-lists/list-stats';
import { ClubBookListView } from '@/components/clubs/club-book-list-view';
import { ClubAddBookForm } from '@/components/clubs/club-add-book-form';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clubId: string }>;
}): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getClubAction(clubId);
  return {
    title: club ? `${club.name} — Reading List` : 'Reading List',
    description: club ? `The shared reading list for the ${club.name} book club.` : 'Club reading list.',
  };
}

export default async function ClubReadingListPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;


  const club = await getClubAction(clubId);
  if (!club) notFound();

  const books = await getClubReadingListAction(clubId);
  const isMod = club.myRole === 'OWNER' || club.myRole === 'MODERATOR';
  const bookCount = books.length;
  const readCount = books.filter((b) => b.status === 'COMPLETED').length;

  return (
    <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto">
      <BackButton href={`/clubs/${clubId}`} label={club.name} className="mb-6" />
      <h1 className="text-2xl font-bold text-white mb-2 mainFont">Reading List</h1>
      <p className="text-white/80 text-sm mb-6">{club.name}&apos;s shared reading list</p>

      <ListStats bookCount={bookCount} readCount={readCount} />

      <ClubBookListView books={books} clubId={clubId} isMod={isMod} />

      {club.isMember && <ClubAddBookForm clubId={clubId} />}
    </div>
  );
}
