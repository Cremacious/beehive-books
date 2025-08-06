'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

const PAGE_SIZE = 10;

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState(mockMessages);
  const router = useRouter();

  const totalPages = Math.ceil(messages.length / PAGE_SIZE);
  const paginated = messages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleDelete(id: number) {
    setMessages(messages.filter((msg) => msg.id !== id));
  }

  function handleView(id: number) {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
    );
  }

  function handleRowClick(id: number) {
    router.push(`/messages/${id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-2">
      <div className="darkContainer ">
        <div className="whiteContainer">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-6 pt-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl md:text-5xl drop-shadow-lg">📬</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-700 font-['Caveat',cursive] drop-shadow-sm mb-1">
                Messages & Notifications
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
                Stay up to date with your friends and your books.
              </p>
            </div>
          </div>
          <div className="border-b-2 border-yellow-200 mb-8" />
          <div className="overflow-x-auto rounded-lg">
            <Table className="min-w-[600px]">
              <TableCaption>
                A list of your recent messages and notifications.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-slate-400"
                    >
                      No messages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((msg) => (
                    <TableRow
                      key={msg.id}
                      className={
                        (msg.read ? '' : 'bg-yellow-50') +
                        ' group cursor-pointer transition hover:bg-yellow-100 focus-within:bg-yellow-200'
                      }
                      tabIndex={0}
                      onClick={(e) => {
                        // Only trigger if not clicking on actions
                        if ((e.target as HTMLElement).closest('.actions-cell'))
                          return;
                        handleRowClick(msg.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleRowClick(msg.id);
                      }}
                    >
                      <TableCell className="font-medium text-yellow-700">
                        {msg.type}
                      </TableCell>
                      <TableCell>{msg.message}</TableCell>
                      <TableCell>{msg.date}</TableCell>
                      <TableCell
                        className="text-right space-x-2 actions-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="View"
                          onClick={() => handleView(msg.id)}
                        >
                          <Eye className="w-5 h-5 text-yellow-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Delete"
                          onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-slate-600 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
