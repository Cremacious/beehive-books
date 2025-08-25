'use client';
import Link from 'next/link';
import { useSession, signOut } from '../../lib/auth-client';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNotificationStore } from '@/store/notifications.store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export default function AuthButtons() {
  const router = useRouter();

  // const notificationCount = useNotificationStore((s) => s.unreadCount());

  const notificationCount = useNotificationStore(
    (s) => s.unreadCount() + s.pendingFriendRequestsCount()
  );
  const unreadMessages = useNotificationStore((s) => s.unreadCount());
  const pendingFriendRequests = useNotificationStore((s) =>
    s.pendingFriendRequestsCount()
  );

  const { data: session, isPending } = useSession();

  const [imageSrc, setImageSrc] = useState<string | null | undefined>(
    () => session?.user?.image
  );

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  useEffect(() => {
    setImageSrc(session?.user?.image ?? null);
  }, [session?.user?.image]);

  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail;
        if (detail?.image) setImageSrc(detail.image);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('user:image:updated', handler);
    return () => window.removeEventListener('user:image:updated', handler);
  }, []);

  const containerClass = 'w-[300px] flex items-center justify-end gap-6';

  if (!session?.user) {
    return (
      <div className={containerClass}>
        {isPending ? (
          <div className="flex items-center justify-end w-full">
            <div className="relative flex items-center">
              <Skeleton className="h-[50px] w-[50px] rounded-full bg-white/5 backdrop-blur-sm shadow-sm animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="flex gap-2 justify-end w-full">
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="relative flex items-center space-x-4 ">
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <Image
                  src={imageSrc ?? defaultProfileImage}
                  alt="Profile"
                  width={50}
                  height={50}
                  className="rounded-full border-2 border-yellow-400 object-cover"
                  style={{ aspectRatio: '1 / 1' }}
                  priority
                />
                {notificationCount > 0 && (
                  <Badge variant={'notification'}>{notificationCount}</Badge>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#202020] text-yellow-400 border-yellow-400">
              <DropdownMenuLabel className="text-lg">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-yellow-400" />
              <DropdownMenuItem
                className="text-white hover:bg-yellow-400 hover:text-slate-800 text-lg"
                onClick={() => router.push(`/messages`)}
              >
                Unread Messages{' '}
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                  {unreadMessages}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white hover:bg-yellow-400 hover:text-slate-800 text-lg"
                onClick={() => router.push(`/friends`)}
              >
                Friend Requests
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">
                  {pendingFriendRequests}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white hover:bg-yellow-400 hover:text-slate-800 text-lg"
                onClick={() => router.push(`/profile/${session?.user?.id}`)}
              >
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-white hover:bg-yellow-400 hover:text-slate-800 text-lg"
                onClick={() => router.push('/settings')}
              >
                Settings
              </DropdownMenuItem>
              {/* Sign Out */}
              <DropdownMenuItem
                className="text-white hover:bg-yellow-400 hover:text-slate-800 text-lg"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
