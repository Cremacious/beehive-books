import ProfileHeader from '@/components/profile/profile-header';
import BookShelf from '@/components/books/bookshelf';
import { getUserBooksById } from '@/lib/actions/book.actions';
import { getDatabaseUserById } from '@/lib/actions/user.actions';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  if (!userId) {
    return <div>User ID is required</div>;
  }
  const userBooks = await getUserBooksById(userId);
  if (!userBooks) {
    return <div>User not found</div>;
  }

  const profileUser = await getDatabaseUserById(userId);
  if (!profileUser) {
    return <div>User not found</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-1 mt-4">
      <div className="space-y-6">
        <ProfileHeader
          user={{
            name: profileUser.name,
            image: profileUser.image || undefined,
            isFriend: false,
            createdAt: profileUser.createdAt,
            bio: profileUser.bio || undefined,
            id: profileUser.id,
          }}
        />
        <div className="darkContainer">
          <BookShelf
            editable={false}
            books={userBooks}
            owner={`${profileUser.name}'s`}
          />
        </div>
      </div>
    </div>
  );
}
