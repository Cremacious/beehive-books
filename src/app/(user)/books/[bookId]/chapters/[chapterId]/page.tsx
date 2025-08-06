import ChapterContent from '@/components/chapter-page/chapter-content';
import CommentSection from '@/components/chapter-page/comment-section';
import { Button } from '@/components/ui/button';
import { userBooks } from '@/lib/sampleData';
import Link from 'next/link';

export default function ChapterPage() {
  
  const chapter = userBooks[0].chapters[0];

  return (
    <div className="max-w-4xl mx-auto px-2 py-8">
      <div className="darkContainer">
        <div className="whiteContainer mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-yellow-700 font-['Caveat',cursive] mb-2">
                {chapter.title}
              </h1>
              <div className="flex flex-wrap gap-2 items-center text-slate-700 text-sm mb-2">
                <span>
                  by{' '}
                  <span className="font-semibold text-yellow-800">
                    {chapter.author}
                  </span>
                </span>
                <span>·</span>
                <span>Updated {chapter.updatedAt}</span>
                <span>·</span>
                <span>{chapter.wordCount} words</span>
                <span>·</span>
                <span>{chapter.comments.length} comments</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="../">← Back to Book</Link>
              </Button>
            </div>
          </div>
        </div>
        <ChapterContent chapter={chapter} />

        <CommentSection />
      </div>
    </div>
  );
}
