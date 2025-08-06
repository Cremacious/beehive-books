import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-yellow-300 text-slate-800 font-bold rounded-xl border-b-4 border-b-yellow-400 hover:bg-yellow-400 hover:border-b-yellow-500 hover:text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:cursor-pointer text-xl shadow-md',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'bg-[#181818] text-yellow-300 font-bold rounded-xl border-b-4 border-t-2 border-r-2 border-l-2 border-b-yellow-500 border-t-yellow-400 border-r-yellow-400  border-l-yellow-400 hover:bg-[#121212] hover:border-b-yellow-500 hover:text-yellow-400 transition-all duration-300 hover:-translate-y-0.5 hover:cursor-pointer text-xl',
        secondary:
          'bg-white text-slate-800 font-bold rounded-xl border-b-4 border-b-slate-400 hover:bg-gray-200 hover:border-b-slate-500 hover:text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:cursor-pointer text-xl shadow-md',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        lightMode:
          'bg-white text-slate-800 shadow-md border-2 border-yellow-200 transition-all duration-300 hover:-translate-y-0.5 hover:cursor-pointer',
        darkMode:
          'bg-[#202020] text-white border-2 border-yellow-200  shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:cursor-pointer',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
