'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NotificationType } from '@/lib/types/message.type';
import { Button } from '../ui/button';
import { Eye, Trash2 } from 'lucide-react';

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

  function handleDelete(id: number) {
    setMessages(messages.filter((msg) => msg.id !== id.toString()));
  }

  function handleView(id: number) {
    setMessages(
      messages.map((msg) => (Number(msg.id) === id ? { ...msg, read: true } : msg))
    );
  }

  function handleRowClick(id: number) {
    router.push(`/messages/${id}`);
  }

  return (
    <div>
      <div className="w-full overflow-x-auto rounded-lg border-b-6 border-b-yellow-400 shadow-lg mb-6">
        <div className="min-w-[600px]">
          <div className="flex bg-yellow-100 font-bold text-yellow-900 rounded-t-lg border-b-2 border-yellow-200">
            <div className="w-32 px-4 py-3">Type</div>
            <div className="flex-1 px-4 py-3">Message</div>
            <div className="w-32 px-4 py-3">Date</div>
            <div className="w-32 px-4 py-3 text-right">Actions</div>
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
                  msg.read ? 'bg-white' : 'bg-yellow-50'
                } hover:bg-yellow-200 focus-within:bg-yellow-200`}
                tabIndex={0}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.actions-cell'))
                    return;
                  handleRowClick(Number(msg.id));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    handleRowClick(Number(msg.id));
                }}
              >
                <div className="w-32 px-4 py-3 font-medium text-yellow-700">
                  {msg.type}
                </div>
                <div className="flex-1 px-4 py-3">{msg.message}</div>
                <div className="w-32 px-4 py-3">{msg.date}</div>
                <div
                  className="w-32 px-4 py-3 text-right flex gap-2 actions-cell"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="View"
                    onClick={() => handleView(Number(msg.id))}
                  >
                    <Eye className="w-5 h-5 text-yellow-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => handleDelete(Number(msg.id))}
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </Button>
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
