import { BookOpen, CheckCircle2, BookMarked } from 'lucide-react';

interface ListStatsProps {
  bookCount: number;
  readCount: number;
}

export function ListStats({ bookCount, readCount }: ListStatsProps) {
  const pct       = bookCount > 0 ? Math.round((readCount / bookCount) * 100) : 0;
  const remaining = bookCount - readCount;

  return (
    <div className="rounded-xl bg-[#252525] border border-[#2a2a2a] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Progress
        </span>
        <span className="text-sm font-bold text-[#FFC300]">{pct}%</span>
      </div>

      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#FFC300] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1e1e1e]">
          <BookMarked className="w-5 h-5 text-[#FFC300]/60" />
          <span className="text-base font-bold text-white leading-none">{bookCount}</span>
          <span className="text-[12px] text-white/75">Total</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1e1e1e]">
          <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
          <span className="text-base font-bold text-white leading-none">{readCount}</span>
          <span className="text-[12px] text-white/75">Read</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[#1e1e1e]">
          <BookOpen className="w-5 h-5 text-white/20" />
          <span className="text-base font-bold text-white leading-none">{remaining}</span>
          <span className="text-[12px] text-white/75">Left</span>
        </div>
      </div>
    </div>
  );
}
