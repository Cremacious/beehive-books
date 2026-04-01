'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

type Props = {
  href: string;
  label: string;
  className?: string;
};

export default function BackButton({ href, label, className = '' }: Props) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-[#FFC300] transition-colors ${className} rounded-2xl border border-white/10 px-3 py-2 hover:bg-white/5 hover:border-[#FFC300]/30`}
    >
      <ChevronLeft className="w-4 h-4 text-[#FFC300]/60" />
      {label}
    </a>
  );
}
