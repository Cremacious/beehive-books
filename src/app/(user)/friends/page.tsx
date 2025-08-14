import Image from 'next/image';
import { Button } from '@/components/ui/button';
import friendImage from '../../../assets/site/friends.png';
import FriendsTable from '@/components/friends/friends-table';
import { mockUser } from '@/lib/sampleData';


const friends = mockUser.friends.map((friend: any) => ({
  ...friend,
  avatar: friend.avatar ?? 'https://randomuser.me/api/portraits/lego/1.jpg',
}));

//   {
//     id: 1,
//     name: 'Maya Honeywell',
//     avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
//   },
//   {
//     id: 2,
//     name: 'Buzz Aldrin',
//     avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
//   },
//   {
//     id: 3,
//     name: 'Beatrice Wood',
//     avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
//   },
//   {
//     id: 4,
//     name: 'Winston Hive',
//     avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
//   },
//   {
//     id: 5,
//     name: 'Sunny Fields',
//     avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
//   },
//   {
//     id: 6,
//     name: 'Bee Harmony',
//     avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
//   },
//   {
//     id: 7,
//     name: 'Honey Dew',
//     avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
//   },
//   {
//     id: 8,
//     name: 'Buzz Lightyear',
//     avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
//   },
//   {
//     id: 9,
//     name: 'Beeatrice',
//     avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
//   },
//   {
//     id: 10,
//     name: 'Woodrow Bee',
//     avatar: 'https://randomuser.me/api/portraits/men/25.jpg',
//   },
//   {
//     id: 11,
//     name: 'Honeycomb Smith',
//     avatar: 'https://randomuser.me/api/portraits/men/26.jpg',
//   },
//   {
//     id: 12,
//     name: 'Beezy Rider',
//     avatar: 'https://randomuser.me/api/portraits/men/27.jpg',
//   },
//   {
//     id: 13,
//     name: 'Queen Bee',
//     avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
//   },
// ];

export default function FriendsPage() {
 
  return (
    <div className="">
      <div className="max-w-6xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <Button
                size={'sm'}
                className="relative pr-8 shadow-md bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-200 transition text-sm"
                // onClick={() =>
                //   alert(
                //     'Friend Requests: ' +
                //       mockFriendRequests
                //         .map((r) => r.name + ' (' + r.email + ')')
                //         .join(', ')
                //   )
                // }
              >
                View All Friend Requests
                <span className="absolute top-0 right-2 -translate-y-1/2 bg-yellow-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
                  {/* {mockFriendRequests.length + friendRequests.length} */} 7
                </span>
              </Button>
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
