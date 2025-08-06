import { Button } from '../ui/button';

export default function CommentSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="whiteContainer">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4 font-['Caveat',cursive] flex items-center gap-2">
          💬 Comments
        </h2>
        <div className="space-y-4 mb-6">
          {/* Example comment */}
          <div className="bg-yellow-100 rounded-lg p-4 border-l-4 border-yellow-400">
            <div className="font-semibold text-yellow-800 mb-1">Sam Reader</div>
            <div className="text-slate-800">
              Loved this chapter! The world feels so alive 🐝
            </div>
            <div className="text-xs text-slate-500 mt-1">2025-07-31</div>
          </div>
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
