import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { TactileSurface } from '@/components/v2/tactile-surface';
import { cn } from '@/lib/utils';

type WorkspaceActionLinkProps = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  primary?: boolean;
};

export function WorkspaceActionLink({
  href,
  label,
  description,
  icon: Icon,
  primary = false,
}: WorkspaceActionLinkProps) {
  return (
    <TactileSurface
      as="article"
      interactive
      className={cn(
        'h-full p-4',
        primary && 'border border-[#FFC300]/40 bg-[#24210f]',
      )}
    >
      <Link href={href} className="group flex h-full gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFC300]/12 text-[#FFC300]">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3 text-sm font-bold text-white mainFont">
            <span className="break-words">{label}</span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-[#FFC300]"
            />
          </span>
          <span className="mt-1 block text-sm leading-5 text-white/65">
            {description}
          </span>
        </span>
      </Link>
    </TactileSurface>
  );
}
