import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        wood: 'text-md font-bold bg-yellow-900 text-white  px-2 py-1 rounded-full border-0 border-b-2 border-b-yellow-400/50',
        inProgress:
          'text-md font-bold border-0 bg-orange-100 text-orange-600 border-b-2 border-b-orange-300 px-2 py-1 rounded-full ',
        completed:
          'text-md font-bold  border-0 bg-green-100 text-green-700 border-b-2 border-b-green-300 px-2 py-1 rounded-full ',
        public:
          'border-0 text-md font-bold bg-gray-100 text-gray-700 border-b-2 border-b-gray-300 px-2 py-1 rounded-full ',
        chapter:
          'border-0 text-md font-bold bg-yellow-200 text-slate-800 border-b-2 border-b-[#121212] px-3 py-1 rounded-full ',
        notification:
          'absolute -top-1 -right-1 bg-yellow-400 text-slate-800 text-xs font-bold rounded-full px-2 py-0.5 border-2 border-black z-10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
