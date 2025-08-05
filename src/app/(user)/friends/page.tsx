import { User } from 'lucide-react';

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
          <div className="whiteContainer relative overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-6 pt-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl md:text-5xl drop-shadow-lg">🐝</span>
                <User className="w-10 h-10 text-yellow-500 drop-shadow-md" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-yellow-700 font-['Caveat',cursive] drop-shadow-sm mb-1">
                  Your Friends
                </h1>
                <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
                  Connect, share, and collaborate with your fellow book lovers
                  in the hive!
                </p>
              </div>
            </div>
            {/* Divider */}
            <div className="border-b-2 border-yellow-200 mb-8" />
            {/* Friends Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:p-6">
              {mockFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="bg-yellow-50 border-2 border-yellow-100 rounded-xl shadow-md flex flex-col items-center p-6 transition hover:scale-[1.03] hover:shadow-lg hover:border-yellow-200"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-yellow-200 bg-white overflow-hidden mb-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="font-bold text-lg text-yellow-800 mb-1 font-['Caveat',cursive]">
                    {friend.name}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      friend.status === 'Online'
                        ? 'text-green-600'
                        : friend.status === 'Offline'
                        ? 'text-slate-400'
                        : 'text-yellow-600'
                    }`}
                  >
                    {friend.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
