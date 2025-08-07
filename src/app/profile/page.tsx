'use client';
import { userBooks } from '@/lib/sampleData';
import BookCard from '@/components/books/book-card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2 } from 'lucide-react';

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
  favoriteBooks: [userBooks[0]],
  favoriteGenres: ['Adventure', 'Memoir', 'Fantasy'],
};

export default function ProfilePage() {
  function handleShare(platform: string) {
    // Replace with actual share logic
    alert(`Share profile on ${platform}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-1">
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
              {/* Share Buttons */}
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share on Twitter"
                  onClick={() => handleShare('Twitter')}
                >
                  <Share2 className="w-5 h-5 text-blue-400" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Share on Facebook"
                  onClick={() => handleShare('Facebook')}
                >
                  <Share2 className="w-5 h-5 text-blue-700" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy Link"
                  onClick={() => handleShare('Copy Link')}
                >
                  <Share2 className="w-5 h-5 text-slate-700" />
                </Button>
              </div>
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
              <div className="flex gap-4 items-center mb-4">
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
              {/* Favorite Genres */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-yellow-700 mb-2 font-['Caveat',cursive]">
                  Favorite Genres
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.favoriteGenres.map((genre) => (
                    <Badge key={genre} variant="wood" className="text-base">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Favorite Books */}
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
