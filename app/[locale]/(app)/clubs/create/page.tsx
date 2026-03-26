import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import ClubForm from '@/components/clubs/club-form';
import { getMyFriendsDataAction } from '@/lib/actions/friend.actions';

export const metadata = {
  title: 'Create a Book Club',
  description: 'Start a new book club and bring readers together around the books you love.',
};

export default async function CreateClubPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id ?? null;

  let friends: { id: string; username: string | null; image: string | null }[] = [];
  if (userId) {
    const { friends: myFriends } = await getMyFriendsDataAction();
    friends = myFriends.map(({ user }) => ({
      id: user.id,
      username: user.username,
      image: user.image,
    }));
  }

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">

      <div className="bg-[#252525] rounded-2xl border border-[#2a2a2a] p-6">
        <ClubForm mode="create" cancelHref="/clubs" friends={friends} />
      </div>
    </div>
  );
}
