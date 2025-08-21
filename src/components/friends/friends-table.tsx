'use client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { FriendType } from '@/lib/types/friend.type';
import defaultProfileImage from '../../assets/stock/stockProfile.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function FriendsTable({ friends }: { friends: FriendType[] }) {
  const router = useRouter();
  const [searchEmail, setSearchEmail] = useState('');
  const [friendRequests, setFriendRequests] = useState<
    { id: number; email: string }[]
  >([]);
  const [filterName, setFilterName] = useState('');
  const [sortAlpha, setSortAlpha] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const friendsPerPage = 12;

  let filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(filterName.toLowerCase())
  );
  if (sortAlpha) {
    filteredFriends = [...filteredFriends].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
  const totalPages = Math.ceil(filteredFriends.length / friendsPerPage);
  const paginatedFriends = friends
    ? filteredFriends
    : filteredFriends.slice(
        (currentPage - 1) * friendsPerPage,
        currentPage * friendsPerPage
      );

  return (
    <div>
      <div className="flex flex-col gap-6 mb-6 px-2 md:px-6">
        <div className="flex flex-col md:flex-row items-stretch gap-6 w-full">
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

          <div className="hidden md:flex items-center justify-center">
            <div className="h-12 w-px bg-yellow-300 mx-2" />
          </div>

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
              <Button
                onClick={() => router.push(`/profile/${friend.id}`)}
                size={'sm'}
              >
                Profile
              </Button>
            </div>
          </div>
        ))}
      </div>

      {!friends && totalPages > 1 && (
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
  );
}
