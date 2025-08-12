import { CommentType } from '@/lib/types/books.type';
import { Button } from '../ui/button';

export default function ChapterComment({ comment }: { comment: CommentType }) {
  return (
    <div className="">
      <div className="bg-yellow-50 rounded-lg p-4 border-b-4 border-yellow-200 shadow-md">
        <div className="font-semibold text-yellow-800 mb-1">
          {comment.author.name}
        </div>
        <div className="text-slate-800">{comment.content}</div>
        <div className="flex justify-between mt-2">
          <div className="text-xs text-slate-500 mt-1">{comment.createdAt}</div>
          <Button size={'sm'}>Reply</Button>
        </div>
      </div>
      {comment.replies.length === 0 ? null : (
        <div className="mt-4 pl-4 border-l-2 border-yellow-200">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-yellow-50 rounded-lg p-3 mb-2 border-b-4 border-yellow-200 shadow-md"
            >
              <div className="font-semibold text-yellow-800 mb-1">
                {reply.author.name}
              </div>
              <div className="text-slate-800">{reply.content}</div>
              <div className="text-xs text-slate-500 mt-1">
                {reply.createdAt}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
