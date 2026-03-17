'use client';

type Props = {
  page:         number;
  totalPages:   number;
  onPageChange: (page: number) => void;
  className?:   string;
};

function getPageWindow(page: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | '...')[] = [1];

  if (page > 3)            items.push('...');
  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) {
    items.push(i);
  }
  if (page < total - 2)   items.push('...');

  items.push(total);
  return items;
}

export default function Pagination({ page, totalPages, onPageChange, className = '' }: Props) {
  if (totalPages <= 1) return null;

  const pageWindow = getPageWindow(page, totalPages);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>

      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl text-sm text-white/80 bg-[#252525] border border-[#2a2a2a] hover:border-[#FFC300]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#2a2a2a]"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pageWindow.map((n, i) =>
          n === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-9 h-9 flex items-center justify-center text-sm text-white/80"
            >
              …
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                n === page
                  ? 'bg-[#FFC300] text-[#1a1a1a]'
                  : 'text-white/80 hover:text-white hover:bg-white/6'
              }`}
            >
              {n}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 rounded-xl text-sm text-white/80 bg-[#252525] border border-[#2a2a2a] hover:border-[#FFC300]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[#2a2a2a]"
      >
        Next
      </button>

    </div>
  );
}
