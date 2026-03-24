import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type Props = {
  href: string;
  label: string;
  className?: string;
};

export default function BackButton({ href, label, className = '' }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-[#FFC300] transition-colors ${className} rounded-2xl border border-white/10 px-3 py-2 hover:bg-white/5 hover:border-[#FFC300]/30`}
    >
      <ChevronLeft className="w-4 h-4 text-[#FFC300]/60" />
      {label}
    </Link>
  );
}
