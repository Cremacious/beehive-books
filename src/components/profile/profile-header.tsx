import { UserType } from '@/lib/types/user.type';
import Image from 'next/image';
import { Button } from '../ui/button';
import defaultProfileImage from '../../assets/stock/stockProfile.png';
import { Share2 } from 'lucide-react';
import { Badge } from '../ui/badge';

export default function ProfileHeader({ user }: { user: UserType }) {
  return (
    <div className="darkContainer">
      <div className="lightContainer">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-300 shadow-lg">
              <Image
                src={user.image ?? defaultProfileImage}
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
                //   onClick={() => handleShare('Twitter')}
              >
                <Share2 className="w-5 h-5 text-blue-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Share on Facebook"
                //   onClick={() => handleShare('Facebook')}
              >
                <Share2 className="w-5 h-5 text-blue-700" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Copy Link"
                //   onClick={() => handleShare('Copy Link')}
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
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Badge>
              <Badge variant="wood"># Books</Badge>
              <Badge variant="wood"># Friends</Badge>
            </div>
            <p className="text-slate-700 mb-4 text-lg">BIO HERE</p>

            {/* Favorite Genres */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-yellow-700 mb-2 font-['Caveat',cursive]">
                Favorite Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* {user.favoriteGenres.map((genre) => (
                <Badge key={genre} variant="wood" className="text-base">
                  {genre}
                </Badge>
              ))} */}
              </div>
            </div>
            {/* Favorite Books */}
          </div>
        </div>
      </div>
    </div>
  );
}
