import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Props = {
  href: string;
  label: string;
  className?: string;
};

export default function BackButton({ href, label, className = '' }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm text-white hover:text-white transition-colors ${className} rounded-2xl border border-white/10 px-3 py-2 hover:bg-white/5`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  );
}
