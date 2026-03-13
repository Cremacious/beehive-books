'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { getCurrentUserImageUrlAction } from '@/lib/actions/user.actions';


export function useCurrentUserImage(): string | null {
  const { data: session } = useSession();
  const [dbImageUrl, setDbImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    getCurrentUserImageUrlAction().then((url) => setDbImageUrl(url));
  }, [session?.user?.id]);

  const sessionImage = (session?.user as { image?: string | null } | undefined)?.image ?? null;
  return dbImageUrl ?? sessionImage;
}
