import { Button } from '../ui/button';
import { CommentType } from '@/lib/types/books.type';
import ChapterComment from './chapter-comment';

export default function CommentSection({
  comments,
}: {
  comments: CommentType[];
}) {
  return (
    <div className="max-w-5xl mx-auto darkContainer">
      <div className="lightContainer">
        <div className=" ">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 playWright] flex items-center gap-2">
            Comments
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
              className="rounded-lg text-slate-800 border bg-white border-yellow-200 p-3 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-yellow-300"
              placeholder="Add a comment..."
            />
            <div className="flex justify-end mt-2">
              <Button type="submit">Post Comment</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
