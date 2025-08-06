import { Button } from '../ui/button';
import { CommentType } from '@/lib/types/books.type';
import ChapterComment from './chapter-comment';

export default function CommentSection({
  comments,
}: {
  comments: CommentType[];
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="whiteContainer">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4 font-['Caveat',cursive] flex items-center gap-2">
          💬 Comments
        </h2>
        <div className="space-y-4 mb-6">
          {comments.length === 0 ? (
            <div>No comments yet</div>
          ) : (
            comments.map((comment) => (
              <ChapterComment key={comment.id} comment={comment} />
            ))
          )}
        </div>
        <form className="flex flex-col gap-2">
          <textarea
            className="rounded-lg border border-yellow-200 p-3 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Add a comment..."
          />
          <div className="flex justify-end">
            <Button type="submit">Post Comment</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
