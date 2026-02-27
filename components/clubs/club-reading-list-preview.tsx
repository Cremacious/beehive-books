import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ClubReadingListBook, BookStatus } from '@/lib/types/club.types';

function StatusBadge({ status }: { status: BookStatus }) {
  if (status === 'IN_PROGRESS') {
    return (
      <span className="text-[11px] font-medium text-[#FFC300] bg-[#FFC300]/10 rounded-full px-2 py-0.5">
        In Progress
      </span>
    );
  }
  if (status === 'COMPLETED') {
    return (
      <span className="text-[11px] font-medium text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
        Completed
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium text-white/80 bg-white/10 rounded-full px-2 py-0.5">
      Not Started
    </span>
  );
}

interface ClubReadingListPreviewProps {
  books: ClubReadingListBook[];
  clubId: string;
  isMember: boolean;
}

export default function ClubReadingListPreview({
  books,
  clubId,
  isMember,
}: ClubReadingListPreviewProps) {
  const preview = books.slice(0, 3);

  return (
    <div className="rounded-2xl bg-[#252525] border border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#FFC300]" />
          <h3 className="text-base font-semibold text-white">Reading List</h3>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/clubs/${clubId}/reading-list`}>View all</Link>
        </Button>
      </div>

      {preview.length === 0 ? (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-white/80" />
          </div>
          <p className="text-sm font-medium text-white mb-1">No books yet</p>
          <p className="text-sm text-white/80 max-w-xs">
            {isMember
              ? 'Add the first book to start building your club\'s reading list.'
              : 'This club hasn\'t added any books to their reading list yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {preview.map((book) => (
            <div
              key={book.id}
              className="flex items-center gap-3 py-2 border-b border-[#2a2a2a] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {book.title}
                </p>
                <p className="text-xs text-white/80 truncate">{book.author}</p>
              </div>
              <StatusBadge status={book.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
