'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { hives, hiveMembers, books, users } from '@/db/schema';
import { hiveSchema } from '@/lib/validations/hive.schema';
import { insertNotification } from '@/lib/notifications';
import type {
  HiveFormData,
  HiveRole,
  ActionResult,
  HiveWithMembership,
  HiveMemberWithUser,
} from '@/lib/types/hive.types';

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

async function requireHiveMod(hiveId: string) {
  const { userId, membership } = await requireHiveMember(hiveId);
  if (membership.role === 'CONTRIBUTOR' || membership.role === 'BETA_READER') {
    throw new Error('Insufficient permissions');
  }
  return { userId, membership };
}

async function requireHiveOwner(hiveId: string) {
  const userId = await requireAuth();
  const hive = await db.query.hives.findFirst({
    where: and(eq(hives.id, hiveId), eq(hives.ownerId, userId)),
  });
  if (!hive) throw new Error('Hive not found or unauthorized');
  return { userId, hive };
}

export async function createHiveAction(
  data: HiveFormData,
): Promise<ActionResult & { hiveId?: string }> {
  const userId = await requireAuth();
  const parsed = hiveSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    let bookId: string | null = null;


    if (data.bookId) {
      const book = await db.query.books.findFirst({
        where: eq(books.id, data.bookId),
      });
      if (book) bookId = book.id;
    }
   
    else if (data.newBookTitle && data.newBookAuthor) {
      const [newBook] = await db
        .insert(books)
        .values({
          userId,
          title: data.newBookTitle.trim(),
          author: data.newBookAuthor.trim(),
          genre: parsed.data.genre || 'Fiction',
          category: 'NOVEL',
          description: parsed.data.description || parsed.data.name,
          privacy: parsed.data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
        })
        .returning({ id: books.id });
      bookId = newBook.id;
    }

    const [hive] = await db
      .insert(hives)
      .values({ ownerId: userId, bookId, ...parsed.data })
      .returning({ id: hives.id });

    await db.insert(hiveMembers).values({
      hiveId: hive.id,
      userId,
      role: 'OWNER',
    });

    revalidatePath('/hive');
    return { success: true, message: 'Hive created!', hiveId: hive.id };
  } catch {
    return { success: false, message: 'Failed to create hive.' };
  }
}

export async function getHiveAction(hiveId: string): Promise<HiveWithMembership | null> {
  const { userId } = await auth();

  const hive = await db.query.hives.findFirst({
    where: eq(hives.id, hiveId),
  });
  if (!hive) return null;

  let myRole: HiveRole | null = null;
  if (userId) {
    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    myRole = (membership?.role as HiveRole) ?? null;
  }

  if (hive.privacy === 'PRIVATE' && !myRole) return null;

  // When a book is linked, pull live word/chapter counts from the book itself
  if (hive.bookId) {
    const book = await db.query.books.findFirst({
      where: eq(books.id, hive.bookId),
      columns: { wordCount: true, chapterCount: true },
    });
    if (book) {
      return {
        ...hive,
        totalWordCount: book.wordCount,
        chapterCount: book.chapterCount,
        myRole,
        isMember: myRole !== null,
      };
    }
  }

  return { ...hive, myRole, isMember: myRole !== null };
}

export async function getAllUserHivesAction(): Promise<HiveWithMembership[]> {
  const userId = await requireAuth();

  const memberships = await db.query.hiveMembers.findMany({
    where: eq(hiveMembers.userId, userId),
    with: { hive: true },
    orderBy: (m, { desc }) => [desc(m.joinedAt)],
  });

  return memberships.map((m) => ({
    ...m.hive,
    myRole: m.role as HiveRole,
    isMember: true,
  }));
}

export async function searchHivesAction(query: string): Promise<HiveWithMembership[]> {
  const { userId } = await auth();

  const publicHives = await db.query.hives.findMany({
    where: and(
      eq(hives.privacy, 'PUBLIC'),
      query.trim()
        ? or(ilike(hives.name, `%${query}%`), ilike(hives.description, `%${query}%`))
        : undefined,
    ),
    orderBy: [desc(hives.memberCount), desc(hives.createdAt)],
    limit: 30,
  });

  if (!userId) {
    return publicHives.map((h) => ({ ...h, myRole: null, isMember: false }));
  }

  const myMemberships = await db.query.hiveMembers.findMany({
    where: and(
      eq(hiveMembers.userId, userId),
      sql`${hiveMembers.hiveId} = ANY(${sql`ARRAY[${sql.join(publicHives.map((h) => sql`${h.id}`), sql`, `)}]::text[]`})`,
    ),
  });

  const membershipMap = new Map(myMemberships.map((m) => [m.hiveId, m.role as HiveRole]));

  return publicHives.map((h) => ({
    ...h,
    myRole: membershipMap.get(h.id) ?? null,
    isMember: membershipMap.has(h.id),
  }));
}

export async function updateHiveAction(hiveId: string, data: HiveFormData): Promise<ActionResult> {
  await requireHiveOwner(hiveId);
  const parsed = hiveSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: parsed.error.issues[0].message };

  try {
    await db
      .update(hives)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    return { success: true, message: 'Hive updated.' };
  } catch {
    return { success: false, message: 'Failed to update hive.' };
  }
}

export async function deleteHiveAction(hiveId: string): Promise<ActionResult> {
  await requireHiveOwner(hiveId);
  try {
    await db.delete(hives).where(eq(hives.id, hiveId));
    revalidatePath('/hive');
    return { success: true, message: 'Hive deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete hive.' };
  }
}

export async function joinHiveAction(hiveId: string): Promise<ActionResult> {
  const userId = await requireAuth();

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return { success: false, message: 'Hive not found.' };
  if (hive.privacy === 'PRIVATE') return { success: false, message: 'This hive is private.' };

  const existing = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (existing) return { success: false, message: 'Already a member.' };

  try {
    await db.insert(hiveMembers).values({ hiveId, userId, role: 'CONTRIBUTOR' });
    await db
      .update(hives)
      .set({ memberCount: sql`${hives.memberCount} + 1`, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));

    const actor = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
    void insertNotification({
      recipientId: hive.ownerId,
      actorId: userId,
      type: 'HIVE_INVITE',
      link: `/hive/${hiveId}`,
      metadata: { actorUsername: actor?.username ?? '', hiveName: hive.name, hiveId },
    });

    revalidatePath(`/hive/${hiveId}`);
    revalidatePath('/hive');
    return { success: true, message: `Joined ${hive.name}!` };
  } catch {
    return { success: false, message: 'Failed to join hive.' };
  }
}

export async function leaveHiveAction(hiveId: string): Promise<ActionResult> {
  const userId = await requireAuth();

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return { success: false, message: 'Hive not found.' };
  if (hive.ownerId === userId) {
    return { success: false, message: 'Owner cannot leave. Transfer ownership or delete the hive.' };
  }

  try {
    await db
      .delete(hiveMembers)
      .where(and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)));
    await db
      .update(hives)
      .set({ memberCount: sql`GREATEST(${hives.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));

    revalidatePath(`/hive/${hiveId}`);
    revalidatePath('/hive');
    return { success: true, message: 'Left hive.' };
  } catch {
    return { success: false, message: 'Failed to leave hive.' };
  }
}

export async function inviteMemberAction(
  hiveId: string,
  targetUserId: string,
  role: HiveRole = 'CONTRIBUTOR',
): Promise<ActionResult> {
  const { userId } = await requireHiveMod(hiveId);

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return { success: false, message: 'Hive not found.' };

  const existing = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)),
  });
  if (existing) return { success: false, message: 'User is already a member.' };

  try {
    await db.insert(hiveMembers).values({ hiveId, userId: targetUserId, role });
    await db
      .update(hives)
      .set({ memberCount: sql`${hives.memberCount} + 1`, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));

    const actor = await db.query.users.findFirst({ where: eq(users.clerkId, userId) });
    void insertNotification({
      recipientId: targetUserId,
      actorId: userId,
      type: 'HIVE_INVITE',
      link: `/hive/${hiveId}`,
      metadata: { actorUsername: actor?.username ?? '', hiveName: hive.name, hiveId },
    });

    revalidatePath(`/hive/${hiveId}/members`);
    return { success: true, message: 'Member invited.' };
  } catch {
    return { success: false, message: 'Failed to invite member.' };
  }
}

export async function removeMemberFromHiveAction(
  hiveId: string,
  targetUserId: string,
): Promise<ActionResult> {
  const { userId } = await requireHiveMod(hiveId);

  if (targetUserId === userId) return { success: false, message: 'Cannot remove yourself.' };

  const targetMembership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)),
  });
  if (!targetMembership) return { success: false, message: 'Member not found.' };
  if (targetMembership.role === 'OWNER') return { success: false, message: 'Cannot remove the owner.' };

  const myMembership = await db.query.hiveMembers.findFirst({
    where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
  });
  if (myMembership?.role === 'MODERATOR' && targetMembership.role === 'MODERATOR') {
    return { success: false, message: 'Moderators cannot remove other moderators.' };
  }

  try {
    await db
      .delete(hiveMembers)
      .where(and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)));
    await db
      .update(hives)
      .set({ memberCount: sql`GREATEST(${hives.memberCount} - 1, 0)`, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}/members`);
    return { success: true, message: 'Member removed.' };
  } catch {
    return { success: false, message: 'Failed to remove member.' };
  }
}

export async function updateMemberRoleAction(
  hiveId: string,
  targetUserId: string,
  role: Exclude<HiveRole, 'OWNER'>,
): Promise<ActionResult> {
  await requireHiveOwner(hiveId);

  try {
    await db
      .update(hiveMembers)
      .set({ role })
      .where(and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, targetUserId)));
    revalidatePath(`/hive/${hiveId}/members`);
    return { success: true, message: 'Role updated.' };
  } catch {
    return { success: false, message: 'Failed to update role.' };
  }
}

export async function getHiveMembersAction(hiveId: string): Promise<HiveMemberWithUser[]> {
  const { userId } = await auth();

  const hive = await db.query.hives.findFirst({ where: eq(hives.id, hiveId) });
  if (!hive) return [];

  if (hive.privacy === 'PRIVATE') {
    if (!userId) return [];
    const membership = await db.query.hiveMembers.findFirst({
      where: and(eq(hiveMembers.hiveId, hiveId), eq(hiveMembers.userId, userId)),
    });
    if (!membership) return [];
  }

  const members = await db.query.hiveMembers.findMany({
    where: eq(hiveMembers.hiveId, hiveId),
    with: { user: true },
    orderBy: [
      sql`CASE ${hiveMembers.role} WHEN 'OWNER' THEN 0 WHEN 'MODERATOR' THEN 1 WHEN 'CONTRIBUTOR' THEN 2 ELSE 3 END`,
      hiveMembers.joinedAt,
    ],
  });

  return members as HiveMemberWithUser[];
}

export async function linkBookToHiveAction(
  hiveId: string,
  bookId: string,
): Promise<ActionResult> {
  const { userId } = await requireHiveOwner(hiveId);

  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId)),
  });
  if (!book) return { success: false, message: 'Book not found in your library.' };

  try {
    await db
      .update(hives)
      .set({ bookId, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    return { success: true, message: 'Book linked to hive.' };
  } catch {
    return { success: false, message: 'Failed to link book.' };
  }
}

export async function unlinkBookFromHiveAction(hiveId: string): Promise<ActionResult> {
  await requireHiveOwner(hiveId);

  try {
    await db
      .update(hives)
      .set({ bookId: null, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    return { success: true, message: 'Book unlinked.' };
  } catch {
    return { success: false, message: 'Failed to unlink book.' };
  }
}

export async function createAndLinkBookAction(
  hiveId: string,
  title: string,
  author: string,
): Promise<ActionResult> {
  const { userId, hive } = await requireHiveOwner(hiveId);

  if (!title.trim() || !author.trim()) {
    return { success: false, message: 'Book title and author are required.' };
  }

  try {
    const [newBook] = await db
      .insert(books)
      .values({
        userId,
        title: title.trim(),
        author: author.trim(),
        genre: hive.genre || 'Fiction',
        category: 'NOVEL',
        description: hive.description || hive.name,
        privacy: hive.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      })
      .returning({ id: books.id });

    await db
      .update(hives)
      .set({ bookId: newBook.id, updatedAt: new Date() })
      .where(eq(hives.id, hiveId));

    revalidatePath(`/hive/${hiveId}`);
    revalidatePath(`/hive/${hiveId}/settings`);
    revalidatePath('/library');
    return { success: true, message: 'Book created and linked.' };
  } catch {
    return { success: false, message: 'Failed to create book.' };
  }
}

export async function completeHiveAction(hiveId: string): Promise<ActionResult> {
  await requireHiveOwner(hiveId);
  try {
    await db
      .update(hives)
      .set({ status: 'COMPLETED', updatedAt: new Date() })
      .where(eq(hives.id, hiveId));
    revalidatePath(`/hive/${hiveId}`);
    revalidatePath('/hive');
    return { success: true, message: 'Hive marked as complete!' };
  } catch {
    return { success: false, message: 'Failed to complete hive.' };
  }
}
