'use client';
import Link from 'next/link';
import { useSession, signOut } from '../../lib/auth-client';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNotificationStore } from '@/store/notifications.store';

export default function AuthButtons() {
  const notificationCount = useNotificationStore((s) => s.unreadCount());
  const { data: session } = useSession();

  // const notificationCount = 14;

  if (!session?.user) {
    return (
      <div className="flex gap-2">
        <Button>{notificationCount}</Button>
        <Button asChild variant="outline">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center space-x-4">
        <div className="relative">
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
              <Badge variant={'notification'}>{notificationCount}</Badge>
            )}
          </Link>
        </div>
        <Settings
          size={35}
          className="text-yellow-400 hover:text-yellow-500 hoverAnimateTiny"
        />
      </div>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
