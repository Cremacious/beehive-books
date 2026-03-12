'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveMembers, prompts } from '@/db/schema';
import type { HivePromptCard } from '@/lib/types/hive.types';

export async function getHivePromptsAction(hiveId: string): Promise<HivePromptCard[]> {
  const userId = await requireAuth();
  if (!userId) return [];

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return [];

  const rows = await db
    .select({
      id: prompts.id,
      title: prompts.title,
      description: prompts.description,
      endDate: prompts.endDate,
      entryCount: prompts.entryCount,
      createdAt: prompts.createdAt,
    })
    .from(prompts)
    .where(and(eq(prompts.privacy, 'PUBLIC'), eq(prompts.status, 'ACTIVE')))
    .orderBy(desc(prompts.createdAt))
    .limit(20);

  return rows;
}
