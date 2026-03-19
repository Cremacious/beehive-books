'use client';

export function ReadingProgress({
  readCount,
  total,
}: {
  readCount: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((readCount / total) * 100) : 0;

  return (
    <div className="px-5 py-3 border-b border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/60">Your progress</span>
        <span className="text-xs font-medium text-[#FFC300]">
          {readCount} / {total} chapters &middot; {pct}%
        </span>
      </div>
      <div
        className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${readCount} of ${total} chapters read`}
      >
        <div
          className="h-full bg-[#FFC300] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
