import { cn } from '@/lib/utils';

/**
 * Small numeric badge chip — used for counts on tabs, headings, etc.
 * Consistent style across the whole app.
 */
export function BadgeCount({
  count,
  max = 99,
  className,
  variant = 'default',
}: {
  count: number;
  max?: number;
  className?: string;
  variant?: 'default' | 'active';
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums',
        variant === 'active'
          ? 'bg-black text-yellow-500'
          : 'bg-[#FFC300] text-black',
        className,
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
