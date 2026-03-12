'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getCurrentUserImageUrlAction } from '@/lib/actions/user.actions';


export function useCurrentUserImage(): string | null {
  const { user } = useUser();
  const [dbImageUrl, setDbImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getCurrentUserImageUrlAction().then((url) => setDbImageUrl(url));
  }, [user?.id]);

  return dbImageUrl ?? user?.imageUrl ?? null;
}
