'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { hiveStyleGuide, hiveMembers } from '@/db/schema';
import type { ActionResult, StyleGuideDoc, HiveUser } from '@/lib/types/hive.types';

async function requireAuth() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function requireHiveMember(hiveId: string) {
  const userId = await requireAuth();
  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) throw new Error('Not a member of this hive');
  return { userId, membership };
}

export async function getStyleGuideAction(hiveId: string): Promise<StyleGuideDoc | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const membership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (!membership) return null;

  const doc = await db.query.hiveStyleGuide.findFirst({
    where: eq(hiveStyleGuide.hiveId, hiveId),
    with: { updatedBy: true },
  });

  if (!doc) return null;

  return {
    id: doc.id,
    hiveId: doc.hiveId,
    content: doc.content,
    updatedById: doc.updatedById,
    updatedBy: doc.updatedBy as HiveUser | null,
    updatedAt: doc.updatedAt,
  };
}

export async function updateStyleGuideAction(
  hiveId: string,
  content: string,
): Promise<ActionResult> {
  try {
    const { userId } = await requireHiveMember(hiveId);

    const existing = await db.query.hiveStyleGuide.findFirst({
      where: eq(hiveStyleGuide.hiveId, hiveId),
    });

    if (existing) {
      await db
        .update(hiveStyleGuide)
        .set({ content, updatedById: userId, updatedAt: new Date() })
        .where(eq(hiveStyleGuide.hiveId, hiveId));
    } else {
      await db.insert(hiveStyleGuide).values({
        hiveId,
        content,
        updatedById: userId,
      });
    }

    revalidatePath(`/hive/${hiveId}/style-guide`);
    return { success: true, message: 'Style guide saved.' };
  } catch {
    return { success: false, message: 'Failed to save style guide.' };
  }
}
