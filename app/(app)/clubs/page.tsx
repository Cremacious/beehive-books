import { auth } from '@clerk/nextjs/server';
import { getAllUserClubsAction } from '@/lib/actions/club.actions';
import MyClubs from '@/components/clubs/my-clubs';

export const metadata = {
  title: 'Book Clubs',
  description:
    'Join and host book clubs — read together, discuss, and share your thoughts with a group.',
};

export default async function ClubsPage() {
  const { userId } = await auth();

  const userClubs = userId ? await getAllUserClubsAction() : [];

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
      <MyClubs clubs={userClubs} />
    </div>
  );
}
