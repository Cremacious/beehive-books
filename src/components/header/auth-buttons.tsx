'use client';
import Link from 'next/link';
import { useSession, signOut } from '../../lib/auth-client';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useNotificationStore } from '@/store/notifications.store';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserLike = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
} | null;

export default function AuthButtons({
  initialUser,
}: {
  initialUser?: UserLike;
}) {
  const router = useRouter();

  const notificationCount = useNotificationStore((s) => s.unreadCount());

  const { data: session } = useSession();

  // track whether the client has hydrated — after this point prefer client session
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Prefer server-provided initial user only before client hydration to avoid UI flash.
  const resolvedUser = hydrated
    ? session?.user ?? null
    : session?.user ?? initialUser ?? null;

  const [currentImage, setCurrentImage] = useState<string | null>(
    resolvedUser?.image ?? null
  );

  const handleSignOut = async () => {
    // await signOut so client session updates before redirect
    await signOut();
    // clear local UI state immediately to avoid transient signed-in UI
    setCurrentImage(null);
    router.push('/'); // Redirect to home after sign out
  };

  useEffect(() => {
    // update when session changes (client hydrates)
    // after hydration we should prefer the live session value and not fall back to initialUser
    const newImage = hydrated
      ? session?.user?.image ?? null
      : session?.user?.image ?? initialUser?.image ?? null;
    setCurrentImage(newImage);
  }, [session?.user?.image, initialUser?.image, hydrated]);

  useEffect(() => {
    function onImageUpdated(e: any) {
      const newImage = e?.detail?.image;
      if (newImage) setCurrentImage(newImage);
    }
    window.addEventListener('user:image:updated', onImageUpdated);
    return () =>
      window.removeEventListener('user:image:updated', onImageUpdated);
  }, []);

  if (!resolvedUser) {
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
              src={currentImage ?? resolvedUser.image ?? defaultProfileImage}
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
            className="text-yellow-400 hover:text-yellow-500 hoverAnimateTiny"
          />{' '}
        </Link>
      </div>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </div>
  );
}
