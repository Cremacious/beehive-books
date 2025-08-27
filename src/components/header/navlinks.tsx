'use client';

import { useSession } from '@/lib/auth-client';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

export default function NavLinks() {
  const { data: session } = useSession();

  if (!session) {
    return <div></div>;
  }

  return (
    <div className="flex gap-8 text-yellow-100 font-medium">
      {ROUTES.map((route) => (
        <Link
          key={route.path}
          href={route.path}
          className="hover:text-yellow-400  text-yellow-300 hoverAnimateTiny text-lg font-bold"
        >
          {route.name}
        </Link>
      ))}
    </div>
  );
}
