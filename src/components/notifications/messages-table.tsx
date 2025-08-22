'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationType } from '@/lib/types/message.type';
import { Button } from '../ui/button';
import { markMessageAsRead } from '@/lib/actions/message.actions';
import { useNotificationStore } from '@/store/notifications.store';

export default function MessagesTable({
  userMessages,
}: {
  userMessages: NotificationType[];
}) {
  const PAGE_SIZE = 20;

  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState(userMessages);
  const router = useRouter();

  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const paginated = messages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const markAsRead = useNotificationStore((s) => s.markAsRead);

  function handleView(id: string) {
    router.push(`/messages/${id}`);
    markAsRead(id);
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
  }

  return (
    <div>
      <div className="w-full overflow-x-auto rounded-lg border-b-6 border-b-yellow-400 shadow-lg mb-6">
        <div className="min-w-[600px]">
          <div className="flex bg-yellow-100 font-bold text-yellow-900 rounded-t-lg border-b-2 border-yellow-200">
            <div className="w-32 px-4 py-3">Type</div>
            <div className="w-32 px-4 py-3">From</div>
            <div className="flex-1 px-4 py-3">Message</div>
            <div className="w-32 px-4 py-3">Date</div>
            <div className="w-32 px-4 py-3 text-center"></div>
          </div>

          {paginated.length === 0 ? (
            <div className="flex text-center text-slate-400 py-8">
              <div className="w-full">No messages found.</div>
            </div>
          ) : (
            paginated.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-center border-b border-yellow-100 transition cursor-pointer ${
                  msg.read
                    ? 'bg-white'
                    : 'bg-yellow-100 font-bold border-l-8 border-yellow-400'
                } hover:bg-yellow-200 focus-within:bg-yellow-200`}
                tabIndex={0}
              >
                <div className="w-32 px-4 py-3 font-medium text-yellow-700">
                  {msg.type === 'friend_request'
                    ? 'Friend Request'
                    : msg.type === 'comment'
                    ? 'Comment'
                    : msg.type}
                </div>
                <div className="w-32 px-4 py-3 text-yellow-700">
                  {msg.sender || 'Unknown'}
                </div>
                <div className="flex-1 px-4 py-3 truncate">
                  {' '}
                  {msg.type === 'friend_request'
                    ? 'New friend request'
                    : msg.message}
                </div>
                <div className="w-32 px-4 py-3">
                  {new Date(msg.date).toLocaleDateString(undefined, {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit',
                  })}
                </div>
                <div
                  className="w-32 px-4 py-3 text-right flex gap-2 actions-cell"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size={'sm'}
                    aria-label="View"
                    onClick={async () => {
                      await markMessageAsRead(msg.id);
                      handleView(msg.id);
                    }}
                  >
                    View
                  </Button>{' '}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-6">
        {page !== 1 && (
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
        )}

        <span className="text-white mx-2">
          Page {page} of {totalPages}
        </span>

        {page !== totalPages && (
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        )}
        {/* <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button> */}
      </div>
    </div>
  );
}
