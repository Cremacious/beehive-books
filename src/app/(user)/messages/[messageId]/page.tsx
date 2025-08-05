import { ArrowLeft,} from 'lucide-react';
import Link from 'next/link';

// Mock message data for demonstration
const mockMessages = [
  {
    id: 1,
    type: 'Friend Request',
    message: 'Your friend request to Maya Honeywell was approved!',
    date: '2025-08-05',
    read: false,
  },
  {
    id: 2,
    type: 'Comment',
    message: 'Buzz Aldrin commented on your chapter: "Loved the twist!"',
    date: '2025-08-04',
    read: true,
  },
  {
    id: 3,
    type: 'Comment',
    message: 'Beatrice Wood commented: "Great writing as always!"',
    date: '2025-08-03',
    read: false,
  },
  {
    id: 4,
    type: 'Friend Request',
    message: 'Winston Hive accepted your friend request.',
    date: '2025-08-02',
    read: true,
  },
  {
    id: 5,
    type: 'Comment',
    message: 'Sunny Fields commented: "Can’t wait for the next chapter!"',
    date: '2025-08-01',
    read: false,
  },
];

export default function MessagePage() {
  // In a real app, fetch by params.messageId
  const messageId = 1;
  const message =
    mockMessages.find((m) => m.id === messageId) || mockMessages[0];

  return (
    <div className="mx-auto max-w-5xl px-2">
      <div className="darkContainer ">
        <div className="whiteContainer p-6 md:p-10">
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/messages"
              className="inline-flex items-center text-yellow-700 hover:underline font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-1" /> Back to Messages
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">
              {message.type === 'Comment' ? '💬' : '🤝'}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-yellow-700 font-['Caveat', cursive]">
              {message.type}
            </h1>
          </div>
          <div className="mb-6 text-slate-700 text-lg bg-yellow-50 rounded-lg p-4 border border-yellow-100 shadow-sm">
            {message.message}
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-slate-500 text-sm">
            <div>
              <span className="font-semibold text-slate-700">Date:</span>{' '}
              {message.date}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Status:</span>{' '}
              {message.read ? 'Read' : 'Unread'}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Message ID:</span>{' '}
              {message.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
