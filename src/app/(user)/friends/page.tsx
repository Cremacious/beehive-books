import Image from 'next/image';
import friendImage from '../../../assets/site/friends.png';
import FriendsTable from '@/components/friends/friends-table';
import ViewFriendRequestsButton from '@/components/friends/view-friends-button';
import { getPendingFriendRequests } from '@/lib/actions/friend.actions';
import { getUserFriends } from '@/lib/actions/friend.actions';
import { getAuthenticatedUser } from '@/lib/server-utils';

export default async function FriendsPage() {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return <div className="text-red-500">User not authenticated</div>;
  }
  const friends = await getUserFriends();
  const friendRequests = await getPendingFriendRequests();

  return (
    <div className="">
      <div className="max-w-6xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <ViewFriendRequestsButton
                pendingFriendRequests={friendRequests}
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-6 pt-6">
              <div className="flex-1 text-center md:text-left ">
                <div className="flex justify-center">
                  <Image
                    height={250}
                    width={250}
                    src={friendImage}
                    alt="Your Friends"
                  />
                </div>
                <div className="text-3xl md:text-4xl text-center font-bold text-yellow-400 playWright drop-shadow-sm mb-4">
                  Your Friends
                </div>
                <div className="text-white text-center md:text-lg ">
                  Connect, share, and collaborate with your fellow book lovers
                  in the hive!
                </div>
              </div>
            </div>

            <div className="border-b-2 border-yellow-200 mb-8" />
       
            <FriendsTable friends={friends} />
          </div>
        </div>
      </div>
    </div>
  );
}
