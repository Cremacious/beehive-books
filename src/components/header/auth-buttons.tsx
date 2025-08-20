'use client';
import Link from 'next/link';
import { useSession, signOut } from '../../lib/auth-client';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNotificationStore } from '@/store/notifications.store';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthButtons() {
  const router = useRouter();

  const notificationCount = useNotificationStore((s) => s.unreadCount());

  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const containerClass = 'w-[300px] flex items-center justify-end gap-6';

  if (!session?.user) {
    return (
      <div className={containerClass}>
        {isPending ? (
   
          <div className="flex items-center justify-end w-full gap-6">
            <div className="relative flex items-center space-x-4">
 
              <Skeleton className="h-10 w-10 rounded-full bg-white/5 backdrop-blur-sm shadow-sm animate-pulse" />
   
              <Skeleton className="h-[35px] w-[35px] rounded-md bg-white/5 backdrop-blur-sm shadow-sm animate-pulse" />
            </div>


            <Skeleton className="h-[38px] w-[90px] rounded-md bg-white/5 backdrop-blur-sm shadow-sm animate-pulse" />
          </div>
        ) : (
          <div className="flex gap-2 justify-end w-full">
            <Button>{notificationCount}</Button>
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
          <Link href="/profile">
            <Image
              src={session?.user?.image ?? defaultProfileImage}
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
        <Link href={'/settings'}>
          <Settings
            size={35}
            className="text-yellow-400 hover:text-yellow-500 hoverAnimateTiny "
          />{' '}
        </Link>
      </div>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
