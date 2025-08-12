import { User } from 'lucide-react';
import Image from 'next/image';
import defaultProfileImage from '../../../assets/stock/stockProfile.png';
import { Button } from '@/components/ui/button';

const mockFriends = [
  {
    id: 1,
    name: 'Maya Honeywell',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    status: 'Online',
  },
  {
    id: 2,
    name: 'Buzz Aldrin',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Reading',
  },
  {
    id: 3,
    name: 'Beatrice Wood',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'Offline',
  },
  {
    id: 4,
    name: 'Winston Hive',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    status: 'Writing',
  },
  {
    id: 5,
    name: 'Sunny Fields',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    status: 'Online',
  },
];

export default function FriendsPage() {
  return (
    <div className="">
      <div className="max-w-5xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-6 pt-6">
              <div className="flex-1 text-center md:text-left ">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:p-6">
              {mockFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-yellow-50 border-b-6 border-b-yellow-400 rounded-xl shadow-md flex flex-col items-center p-6 hoverAnimate1  hover:shadow-lg hover:border-yellow-200"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-200 bg-white overflow-hidden mb-3">
                    <Image
                      width={100}
                      height={100}
                      src={defaultProfileImage}
                      alt={friend.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="font-bold text-lg text-slate-800 mb-1 playWright">
                    {friend.name}
                  </div>
                  <div className="flex flex-row gap-8 mt-4">
                    <Button size={'sm'}> Books</Button>
                    <Button size={'sm'}>Profile</Button>
                  </div>
                  {/* <div
                    className={`text-sm font-medium ${
                      friend.status === 'Online'
                        ? 'text-green-600'
                        : friend.status === 'Offline'
                        ? 'text-slate-400'
                        : 'text-yellow-600'
                    }`}
                  >
                    {friend.status}
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
