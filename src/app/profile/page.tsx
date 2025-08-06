import { userBooks } from '@/lib/sampleData';
import BookCard from '@/components/books/book-card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock user data
const user = {
  name: 'Jane Writer',
  avatar: '/assets/stock/profile.png',
  bio: 'Adventurer, storyteller, and lover of bees. Writing tales that buzz with life.',
  joined: '2024-03-15',
  isFriend: true,
  friendsCount: 42,
  booksCount: userBooks.length,
  social: {
    twitter: 'janewrites',
    website: 'janewriter.com',
  },
};

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-2">
      <div className="darkContainer">
        <div className="whiteContainer p-6 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar & Add Friend */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg">
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              <Button
                variant={user.isFriend ? 'secondary' : 'default'}
                className="w-full"
              >
                {user.isFriend ? 'Friends ✓' : 'Add to Friends'}
              </Button>
            </div>
            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-yellow-700 mb-2 font-['Caveat',cursive]">
                {user.name}
              </h1>
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Badge variant="wood">
                  Joined{' '}
                  {new Date(user.joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Badge>
                <Badge variant="wood">{user.booksCount} Books</Badge>
                <Badge variant="wood">{user.friendsCount} Friends</Badge>
              </div>
              <p className="text-slate-700 mb-4 text-lg">{user.bio}</p>
              <div className="flex gap-4 items-center">
                {user.social.twitter && (
                  <a
                    href={`https://twitter.com/${user.social.twitter}`}
                    target="_blank"
                    rel="noopener"
                    className="text-yellow-700 hover:text-yellow-900 font-semibold"
                  >
                    🐦 @{user.social.twitter}
                  </a>
                )}
                {user.social.website && (
                  <a
                    href={`https://${user.social.website}`}
                    target="_blank"
                    rel="noopener"
                    className="text-yellow-700 hover:text-yellow-900 font-semibold"
                  >
                    🌐 {user.social.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* User's Books Grid */}
        <div className="whiteContainer p-6 md:p-10">
          <h2 className="text-2xl font-bold text-yellow-700 mb-6 font-['Caveat',cursive]">
            {user.name}&apos;s Books
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {userBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
