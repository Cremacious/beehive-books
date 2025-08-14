// import { userBooks } from '@/lib/sampleData';
import ProfileHeader from '@/components/profile/profile-header';
import BookShelf from '@/components/books/bookshelf';
import { mockUser } from '@/lib/sampleData';

const userBooks = mockUser.books;

// const user = {
//   id: 'user-001',
//   name: 'Jane Writer',
//   avatar: '/assets/stock/profile.png',
//   bio: 'Adventurer, storyteller, and lover of bees. Writing tales that buzz with life.',
//   email: 'jane.writer@example.com',
//   emailVerified: true,
//   createdAt: '2024-03-01T10:00:00Z',
//   updatedAt: '2024-03-15T12:00:00Z',
//   joined: '2024-03-15',
//   isFriend: true,
//   friendsCount: 42,
//   booksCount: userBooks.length,
//   social: {
//     twitter: 'janewrites',
//     website: 'janewriter.com',
//   },
//   favoriteBooks: [userBooks[0]],
//   favoriteGenres: ['Adventure', 'Memoir', 'Fantasy'],
// };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-1">
      <div className="space-y-6">
        <ProfileHeader user={mockUser} />
        <div className="darkContainer">
          <BookShelf books={userBooks} owner={`${mockUser.name}'s`} />
        </div>
      </div>
    </div>
  );
}
