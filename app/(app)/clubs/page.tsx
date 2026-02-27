import { auth } from '@clerk/nextjs/server';
import { getAllUserClubsAction } from '@/lib/actions/club.actions';
import MyClubs from '@/components/clubs/my-clubs';

export const metadata = {
  title: 'Book Clubs',
  description: 'Join and host book clubs — read together, discuss, and share your thoughts with a group.',
};

export default async function ClubsPage() {
  const { userId } = await auth();

  const userClubs = userId ? await getAllUserClubsAction() : [];

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto space-y-10">
      <MyClubs clubs={userClubs} />
    </div>
  );
}
