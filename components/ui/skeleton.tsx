import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-white/10', className)} />
  );
}

export function UserSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />

      <div className="hidden lg:block flex-1 min-w-0">
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="hidden lg:flex items-center gap-0.5 shrink-0">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}
