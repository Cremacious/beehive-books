import * as React from 'react';
import { cn } from '@/lib/utils';

type TactileSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article' | 'aside';
  interactive?: boolean;
  grit?: boolean;
};

export function TactileSurface({
  as = 'div',
  interactive = false,
  grit = false,
  className,
  ...props
}: TactileSurfaceProps) {
  const Comp = as;

  return (
    <Comp
      className={cn(
        'rounded-xl bg-[#1c1c1c] paper-stack',
        grit && 'paper-grit',
        interactive && 'paper-stack-hover',
        className,
      )}
      {...props}
    />
  );
}
