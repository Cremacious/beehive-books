import { getMessageById } from '@/lib/actions/message.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function MessagePage({
  params,
}: {
  params: Promise<{ messageId: string }>;
}) {
  const { messageId } = await params;
  const message = await getMessageById(messageId);

  if (message.type === 'friend_request') {
    return (
      <div className="mx-auto max-w-5xl px-2">
        <div className="darkContainer ">
          <div className="lightContainer p-6 md:p-10">
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/messages"
                className="inline-flex items-center text-yellow-700 hover:underline font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-1" /> Back to Messages
              </Link>
            </div>
            <div className="text-lg text-white mb-2">
              {message.sender} sent you a friend request!
            </div>

            <div className="mb-6 text-slate-700 text-lg bg-yellow-50 rounded-lg p-4 border border-yellow-100 shadow-sm text-center">
              You have a new friend request from {message.sender}. Go to your
              friends list to accept or decline the request.
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-white text-sm">
              <div>
                <span className="font-semibold text-yellow-400">Date:</span>{' '}
                {message.date}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-2">
      <div className="darkContainer ">
        <div className="lightContainer p-6 md:p-10">
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/messages"
              className="inline-flex items-center text-yellow-700 hover:underline font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-1" /> Back to Messages
            </Link>
          </div>
          <div className="text-lg text-white mb-2">
            <span className="text-yellow-400">{message.sender}</span> commented
            on <span className="text-yellow-400">{message.chapterTitle}</span>{' '}
            in <span className="text-yellow-400">{message.bookTitle}</span>
          </div>

          <div className="mb-6 text-slate-700 text-lg bg-yellow-50 rounded-lg p-4 border border-yellow-100 shadow-sm">
            {message.message}
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-white text-sm">
            <div>
              <span className="font-semibold text-yellow-400">Date:</span>{' '}
              {message.date}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
