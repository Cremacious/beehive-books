'use client';
import Image from 'next/image';
import defaultProfileImage from '../../../assets/stock/stockProfile.png';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  // Add more mock friends for pagination demonstration
  {
    id: 6,
    name: 'Bee Harmony',
    avatar: 'https://randomuser.me/api/portraits/women/21.jpg',
    status: 'Online',
  },
  {
    id: 7,
    name: 'Honey Dew',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    status: 'Offline',
  },
  {
    id: 8,
    name: 'Buzz Lightyear',
    avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
    status: 'Reading',
  },
  {
    id: 9,
    name: 'Beeatrice',
    avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
    status: 'Online',
  },
  {
    id: 10,
    name: 'Woodrow Bee',
    avatar: 'https://randomuser.me/api/portraits/men/25.jpg',
    status: 'Writing',
  },
  {
    id: 11,
    name: 'Honeycomb Smith',
    avatar: 'https://randomuser.me/api/portraits/men/26.jpg',
    status: 'Online',
  },
  {
    id: 12,
    name: 'Beezy Rider',
    avatar: 'https://randomuser.me/api/portraits/men/27.jpg',
    status: 'Offline',
  },
  {
    id: 13,
    name: 'Queen Bee',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    status: 'Online',
  },
];

export default function FriendsPage() {
  const [searchEmail, setSearchEmail] = useState('');
  const [friendRequests, setFriendRequests] = useState<
    { id: number; email: string }[]
  >([]);
  const [filterName, setFilterName] = useState('');
  const [sortAlpha, setSortAlpha] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const friendsPerPage = 12;

  // Filter and sort logic
  let filteredFriends = mockFriends.filter((f) =>
    f.name.toLowerCase().includes(filterName.toLowerCase())
  );
  if (sortAlpha) {
    filteredFriends = [...filteredFriends].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  const totalPages = Math.ceil(filteredFriends.length / friendsPerPage);
  const paginatedFriends = mockFriends
    ? filteredFriends
    : filteredFriends.slice(
        (currentPage - 1) * friendsPerPage,
        currentPage * friendsPerPage
      );

  // Mock friend requests
  const mockFriendRequests = [
    { id: 101, name: 'Bee Curious', email: 'bee.curious@hive.com' },
    { id: 102, name: 'Honey Helper', email: 'honey.helper@hive.com' },
  ];

  return (
    <div className="">
      <div className="max-w-6xl mx-auto p-2">
        <div className="darkContainer">
          <div className="lightContainer relative overflow-hidden">
            {/* Friend Requests Button - Top Right Floating */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                size={'sm'}
                className="relative pr-8 shadow-md bg-yellow-100 text-yellow-700 font-semibold hover:bg-yellow-200 transition text-sm"
                onClick={() =>
                  alert(
                    'Friend Requests: ' +
                      mockFriendRequests
                        .map((r) => r.name + ' (' + r.email + ')')
                        .join(', ')
                  )
                }
              >
                View All Friend Requests
                <span className="absolute top-0 right-2 -translate-y-1/2 bg-yellow-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
                  {mockFriendRequests.length + friendRequests.length}
                </span>
              </Button>
            </div>

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

            {/* Controls - Search by name and find by email on same row with divider */}
            <div className="flex flex-col gap-6 mb-6 px-2 md:px-6">
              <div className="flex flex-col md:flex-row items-stretch gap-6 w-full">
                {/* Search by Name and Sort Button */}
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2">
                  <div className="flex flex-col w-full">
                    <label className="text-sm font-semibold text-yellow-700 mb-1">
                      Search by Name
                    </label>
                    <input
                      type="text"
                      placeholder="Search friends by name..."
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="rounded-lg px-4 py-2 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-slate-800 shadow-sm transition w-full"
                    />
                  </div>
                  <Button
                    className={`md:ml-2 mt-2 md:mt-5 w-full md:w-auto ${
                      sortAlpha ? 'bg-yellow-500' : ''
                    }`}
                    onClick={() => setSortAlpha(!sortAlpha)}
                  >
                    Sort A-Z
                  </Button>
                </div>
                {/* Divider for desktop */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="h-12 w-px bg-yellow-300 mx-2" />
                </div>
                {/* Find by Email */}
                <div className="flex-1 flex flex-col justify-center">
                  <label className="text-sm font-semibold text-yellow-700 mb-1">
                    Find Friends by Email
                  </label>
                  <div className="flex flex-col md:flex-row gap-2 w-full">
                    <input
                      type="email"
                      placeholder="Enter email address..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="rounded-lg px-4 py-2 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-slate-800 shadow-sm transition w-full"
                    />
                    <Button
                      className="w-full ml-2 md:w-auto mt-2 md:mt-1"
                      onClick={() => {
                        if (searchEmail) {
                          setFriendRequests([
                            ...friendRequests,
                            { id: Date.now(), email: searchEmail },
                          ]);
                          setSearchEmail('');
                        }
                      }}
                    >
                      Send Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b-2 border-yellow-200 mb-8" />

            {/* Friends Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:p-6">
              {paginatedFriends.map((friend) => (
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
                </div>
              ))}
            </div>

            {/* Pagination */}
            {!mockFriends && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-3 py-1 rounded bg-yellow-100 border border-yellow-300 text-yellow-700 font-semibold disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </button>
                <span className="text-yellow-700 font-bold mx-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-yellow-100 border border-yellow-300 text-yellow-700 font-semibold disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
