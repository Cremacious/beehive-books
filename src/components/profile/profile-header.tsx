import Image from 'next/image';
import { Button } from '../ui/button';
import defaultProfileImage from '../../assets/stock/stockProfile.png';
import { Share2 } from 'lucide-react';
import { UserType } from '@/lib/types/user.type';
import FriendStatusButton from '../friends/friend-status-button';
import { getAuthenticatedUser } from '@/lib/types/server-utils';
import {
  checkFriendshipStatus,
} from '@/lib/actions/friend.actions';

export default async function ProfileHeader({ user }: { user: UserType }) {
  const currentUser = await getAuthenticatedUser();

  const isCurrentUser = currentUser?.user?.id !== user.id;

  const friendshipStatus = await checkFriendshipStatus(user.id);
  console.log('Friendship Status:', friendshipStatus);

  const isLoggedInUser = !currentUser.error;

  return (
    <div className="darkContainer ">
      <div className="grid grid-cols-1 md:grid-cols-3 md:space-x-6 space-y-4 md:space-y-0">
        <div className="lightContainer">
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

            {isCurrentUser && isLoggedInUser ? (
              <FriendStatusButton friendshipStatus={friendshipStatus.status} friendId={user.id} />
            ) : null}
            <div className="text-white">
              Joined{' '}
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
        <div className="lightContainer col-span-2">
          <div className="flex flex-col justify-between h-full">
            <div>
              <div className="text-3xl mt-4 font-bold text-yellow-400 mb-2 playWright text-center">
                {user.name}
              </div>
              <div className="text-white mb-4 text-lg text-center mt-4">
                {user.bio}
              </div>
            </div>
            <div className="flex gap-2 mt-2 justify-center">
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
        </div>
      </div>
    </div>
  );
}
