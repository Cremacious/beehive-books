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

  const user = await getDatabaseUserById(userId);
  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-1">
      <div className="space-y-6">
        <ProfileHeader
          user={{
            name: user.name,
            image: user.image || undefined,
            isFriend: false,
            createdAt: user.createdAt,
            bio: user.bio || undefined,
          }}
        />
        <div className="darkContainer">
          <BookShelf books={userBooks} owner={`${user.name}'s`} />
        </div>
      </div>
    </div>
  );
}
