import ChapterContent from '@/components/chapter-page/chapter-content';
import CommentSection from '@/components/chapter-page/comment-section';
import { Button } from '@/components/ui/button';
// import { mockUser } from '@/lib/sampleData';
import Link from 'next/link';
import { getChapterById } from '@/lib/actions/book.actions';
import { MoveLeft } from 'lucide-react';
import { getChapterWordCount } from '@/lib/utils';
import { checkFriendshipStatus } from '@/lib/actions/friend.actions';
import { getAuthenticatedUser } from '@/lib/types/server-utils';

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = await getChapterById({ chapterId });

  if (!chapter) {
    return <div className="text-red-500">Chapter not found</div>;
  }

  const bookOwnerId = chapter.author;
  const { user } = await getAuthenticatedUser();

  const isOwner = user?.id === bookOwnerId;
  const friendship = await checkFriendshipStatus(bookOwnerId);
  const isFriend = friendship?.isFriend === true;
  const canSeeComments = isOwner || isFriend;

  return (
    <div className="max-w-7xl mx-auto px-1">
      <div className="mb-4">
        <Button variant={'secondary'} asChild>
          <Link href={`/books/${chapter.bookId}`}>
            <MoveLeft className="mr-2" />
            Back to Book Page
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        <div className="max-w-5xl mx-auto">
          <div className="darkContainer">
            <div className="lightContainer">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 playWright mb-2">
                    {chapter.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 items-center text-white text-sm mb-2">
                    <span>
                      by{' '}
                      <span className="font-semibold text-yellow-400">
                        {chapter.author}
                      </span>
                    </span>
                    <span>·</span>
                    {/* <span>Updated {chapter.updatedAt}</span> */}
                    <span>·</span>
                    <span>
                      {getChapterWordCount(chapter).toLocaleString()} words
                    </span>
                    <span>·</span>
                    <span>{chapter.comments.length} comments</span>
                  </div>
                </div>
              </div>
            </div>{' '}
          </div>
        </div>
        <div className="darkContainer">
          <div className="lightContainer space-y-2">
            <div className="text-yellow-400 text-lg playWright">
              Author&apos;s Notes
            </div>
            <div className="text-white ">
              {chapter.notes && chapter.notes.length > 0 ? (
                chapter.notes
              ) : (
                <div className="flex justify-center items-center h-16">
                  <div className="text-center">No author notes.</div>
                </div>
              )}
            </div>
          </div>
        </div>
        <ChapterContent chapter={chapter} />
        {canSeeComments && <CommentSection comments={chapter.comments} />}
      </div>
    </div>
  );
}
