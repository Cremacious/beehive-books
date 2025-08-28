'use client';
import { Button } from '@/components/ui/button';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Settings } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { signOut, useSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import defaultProfileImage from '@/assets/stock/stockProfile.png';
import { useNotificationStore } from '@/store/notifications.store';

export function Sidebar() {
  const router = useRouter();

  const unreadMessages = useNotificationStore((s) => s.unreadCount());
  const pendingFriendRequests = useNotificationStore((s) =>
    s.pendingFriendRequestsCount()
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleButtonClick = (path: string) => {
    setIsOpen(!isOpen);
    router.push(path);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  const { data: session } = useSession();

  const [imageSrc, setImageSrc] = useState<string | null | undefined>(
    () => session?.user?.image
  );

  useEffect(() => {
    setImageSrc(session?.user?.image ?? null);
  }, [session?.user?.image]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="bg-[#181818] text-yellow-300 font-bold rounded-xl border-b-4 border-t-2 border-r-2 border-l-2 border-b-yellow-500 border-t-yellow-400 border-r-yellow-400  border-l-yellow-400 hover:bg-[#121212] hover:border-b-yellow-500 hover:text-yellow-400 transition-all duration-300 hover:-translate-y-0.5 p-1 hover:cursor-pointer caveatBrush text-xl">
          <Menu className="h-6 w-8" />
        </button>
      </SheetTrigger>
      <SheetContent className="bg-[#202020] text-yellow-300 border-0">
        <SheetHeader>
          <SheetTitle className="text-xl font-extrabold tracking-tight text-yellow-300 playwright">
            Beehive Books
          </SheetTitle>
        </SheetHeader>

        {session?.user ? (
          <div className="space-y-4 mx-2 mt-6">
            <div className="flex justify-center mb-4">
              <Image
                src={imageSrc ?? defaultProfileImage}
                alt="Profile"
                width={60}
                height={60}
                className="rounded-full border-2 border-yellow-400 object-cover"
                style={{ aspectRatio: '1 / 1' }}
                priority
                onClick={() => router.push(`/profile/${session?.user?.id}`)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="ghost"
                className="relative text-xl font-bold w-full text-center px-4 py-8 text-yellow-300 rounded-lg overflow-hidden transition-all duration-300 group flex flex-col items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute inset-0  border border-white/20 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>
                <Badge className="relative z-0 bg-yellow-400 text-slate-800 text-xs font-bold rounded-full px-2 py-0.5 border-2 border-black">
                  {unreadMessages}
                </Badge>
                <span className="relative z-10 text-sm">Unread Messages</span>
              </Button>
              <Button
                variant="ghost"
                className="relative text-xl font-bold w-full text-center px-4 py-8 text-yellow-300 rounded-lg overflow-hidden transition-all duration-300 group flex flex-col items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="absolute inset-0  border border-white/20 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>
                <Badge className="relative z-10 bg-yellow-400 text-slate-800 text-xs font-bold rounded-full px-2 py-0.5 border-2 border-black">
                  {pendingFriendRequests}
                </Badge>
                <span className="relative z-10 text-sm">Friend Requests</span>
              </Button>
            </div>

            {ROUTES.map((route) => (
              <Button
                key={route.name}
                variant="ghost"
                onClick={() => handleButtonClick(route.path)}
                className="text-xl font-bold w-full text-center px-4 py-6 text-yellow-300  relative overflow-hidden rounded-lg transition-all duration-300 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                <div className="absolute inset-0 border border-white/20 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>

                <span className="relative z-10">{route.name}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 mx-2 mt-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/sign-in')}
              className="text-xl font-bold w-full text-center px-4 py-6 text-yellow-300  relative overflow-hidden rounded-lg transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

              <div className="absolute inset-0 border border-white/20 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>

              <span className="relative z-10">Sign In</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/sign-up')}
              className="text-xl font-bold w-full text-center px-4 py-6 text-yellow-300  relative overflow-hidden rounded-lg transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

              <div className="absolute inset-0 border border-white/20 group-hover:border-white/40 rounded-lg transition-all duration-300"></div>

              <span className="relative z-10">Sign Up</span>
            </Button>
          </div>
        )}
    
        {session?.user && (
          <SheetFooter>
            <div className="flex justify-between items-center w-full">
              <Settings
                size={35}
                className="text-yellow-400 hover:text-yellow-500 hoverAnimateTiny"
                onClick={() => router.push('/settings')}
              />
              <Button onClick={handleSignOut} className="w-3/4" type="submit">
                Sign Out
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
