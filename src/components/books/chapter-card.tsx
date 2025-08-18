import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChapterType } from '@/lib/types/books.type';
import { slateContentToPlainText } from '@/lib/utils';

export default function ChapterCard({
  chapter,
  index,
  bookId,
}: {
  chapter: ChapterType;
  index: number;
  bookId: string;
}) {
  return (
    <div className="bg-yellow-50  border-b-4 border-b-yellow-400 border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-yellow-400 group">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={'chapter'}>Chapter {index + 1}</Badge>
            {chapter.status === 'completed' ? (
              <Badge variant={'completed'}>Completed</Badge>
            ) : chapter.status === 'inProgress' ? (
              <Badge variant={'inProgress'}>In Progress</Badge>
            ) : (
              <Badge variant={'wood'}>Draft</Badge>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2 poppins group-hover:text-yellow-700 transition-colors">
            {chapter.title}
          </h3>

          <p className="line-clamp-3 text-slate-800 mb-3 leading-relaxed">
            {slateContentToPlainText(chapter.content)}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-slate-800 ">
            <span> {chapter.wordCount.toLocaleString()} words</span>
            <span>{chapter.comments?.length ?? 0} comments</span>
            {/* <span>Updated {chapter.updatedAt}</span> */}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button asChild>
            <Link href={`/books/${bookId}/chapters/${chapter.id}`}>Read</Link>
          </Button>
          <Button variant={'secondary'}>Edit</Button>
        </div>
      </div>
    </div>
  );
}
