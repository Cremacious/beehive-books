'use client';
import Link from 'next/link';
import { useSession, signOut } from '../../lib/auth-client';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { Button } from '../ui/button';

export default function AuthButtons() {
  const { data: session } = useSession();

  const notificationCount = 4;

  if (!session?.user) {
    return (
      <div className="flex gap-2">
        <Link
          href="/sign-in"
          className="bg-black text-yellow-300 font-bold px-5 py-2 rounded-full border-2 border-yellow-400 hover:bg-slate-800 transition text-center"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="bg-yellow-400 text-slate-900 font-bold px-5 py-2 rounded-full shadow hover:bg-yellow-500 transition border-2 border-black text-center"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center">
        <Link href="/profile">
          <Image
            src={session.user.image || defaultProfileImage}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-yellow-400 object-cover"
            style={{ aspectRatio: '1 / 1' }}
            priority
          />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full px-2 py-0.5 border-2 border-black">
              {notificationCount}
            </span>
          )}
        </Link>
      </div>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
