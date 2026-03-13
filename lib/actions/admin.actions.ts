'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, count, desc, eq, gte, ilike, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import {
  users,
  books,
  chapters,
  bookClubs,
  hives,
  prompts,
  promptEntries,
  clubDiscussions,
  clubDiscussionReplies,
  notifications,
  announcements,
} from '@/db/schema';
import { coverPublicId } from '@/lib/cloudinary';
import { deleteImageAction } from '@/lib/actions/cloudinary.actions';

export type ActionResult = { success: boolean; message: string };

const PAGE_SIZE = 25;

async function requireAdmin() {
  const userId = await requireAuth();
  if (!userId) throw new Error('Unauthorized');
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });
  if (user?.role !== 'admin') throw new Error('Forbidden');
  return userId;
}



export async function getAdminStatsAction() {
  await requireAdmin();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    [totalUsers],
    [totalBooks],
    [totalChapters],
    [totalClubs],
    [totalHives],
    [totalPrompts],
    [newUsers],
    [newBooks],
    [newClubs],
    [newHives],
    [newPrompts],
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(books),
    db.select({ count: count() }).from(chapters),
    db.select({ count: count() }).from(bookClubs),
    db.select({ count: count() }).from(hives),
    db.select({ count: count() }).from(prompts),
    db.select({ count: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(books).where(gte(books.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(bookClubs).where(gte(bookClubs.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(hives).where(gte(hives.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(prompts).where(gte(prompts.createdAt, thirtyDaysAgo)),
  ]);

  return {
    totals: {
      users: totalUsers.count,
      books: totalBooks.count,
      chapters: totalChapters.count,
      clubs: totalClubs.count,
      hives: totalHives.count,
      prompts: totalPrompts.count,
    },
    newThisMonth: {
      users: newUsers.count,
      books: newBooks.count,
      clubs: newClubs.count,
      hives: newHives.count,
      prompts: newPrompts.count,
    },
  };
}



export async function getAllUsersAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search
    ? or(
        ilike(users.username, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
      )
    : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.users.findMany({
      where,
      orderBy: desc(users.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        image: true,
        role: true,
        premium: true,
        createdAt: true,
      },
    }),
    db.select({ total: count() }).from(users).where(where),
  ]);

  return { users: rows, total, page, pageSize: PAGE_SIZE };
}

export async function updateUserRoleAction(
  id: string,
  role: 'member' | 'moderator' | 'admin',
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
    return { success: true, message: 'Role updated.' };
  } catch {
    return { success: false, message: 'Failed to update role.' };
  }
}

export async function toggleUserPremiumAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: { premium: true },
    });
    if (!user) return { success: false, message: 'User not found.' };

    await db
      .update(users)
      .set({ premium: !user.premium, updatedAt: new Date() })
      .where(eq(users.id, id));
    return { success: true, message: `Premium ${!user.premium ? 'granted' : 'revoked'}.` };
  } catch {
    return { success: false, message: 'Failed to update premium status.' };
  }
}


export async function getAllBooksAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search ? ilike(books.title, `%${search}%`) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.books.findMany({
      where,
      orderBy: desc(books.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        title: true,
        author: true,
        privacy: true,
        wordCount: true,
        chapterCount: true,
        coverUrl: true,
        createdAt: true,
        userId: true,
      },
      with: {
        user: { columns: { username: true, firstName: true, lastName: true } },
      },
    }),
    db.select({ total: count() }).from(books).where(where),
  ]);

  return { books: rows, total, page, pageSize: PAGE_SIZE };
}

export async function deleteBookAdminAction(bookId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: { coverUrl: true },
    });
    if (!book) return { success: false, message: 'Book not found.' };

    if (book.coverUrl) {
      await deleteImageAction(coverPublicId(bookId));
    }

    await db.delete(books).where(eq(books.id, bookId));
    return { success: true, message: 'Book deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete book.' };
  }
}


export async function getAllChaptersAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search ? ilike(chapters.title, `%${search}%`) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.chapters.findMany({
      where,
      orderBy: desc(chapters.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        title: true,
        wordCount: true,
        order: true,
        createdAt: true,
        bookId: true,
      },
      with: {
        book: {
          columns: { title: true, userId: true },
          with: { user: { columns: { username: true } } },
        },
      },
    }),
    db.select({ total: count() }).from(chapters).where(where),
  ]);

  return { chapters: rows, total, page, pageSize: PAGE_SIZE };
}


export async function getAllClubsAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search ? ilike(bookClubs.name, `%${search}%`) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.bookClubs.findMany({
      where,
      orderBy: desc(bookClubs.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        name: true,
        privacy: true,
        memberCount: true,
        createdAt: true,
        ownerId: true,
      },
      with: {
        owner: { columns: { username: true, firstName: true, lastName: true } },
      },
    }),
    db.select({ total: count() }).from(bookClubs).where(where),
  ]);

  return { clubs: rows, total, page, pageSize: PAGE_SIZE };
}

export async function deleteClubAdminAction(clubId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(bookClubs).where(eq(bookClubs.id, clubId));
    return { success: true, message: 'Club deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete club.' };
  }
}



export async function getAllPromptsAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search ? ilike(prompts.title, `%${search}%`) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.prompts.findMany({
      where,
      orderBy: desc(prompts.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        title: true,
        status: true,
        entryCount: true,
        endDate: true,
        createdAt: true,
        privacy: true,
      },
      with: {
        creator: { columns: { username: true, firstName: true, lastName: true } },
      },
    }),
    db.select({ total: count() }).from(prompts).where(where),
  ]);

  return { prompts: rows, total, page, pageSize: PAGE_SIZE };
}

export async function deletePromptAdminAction(promptId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(prompts).where(eq(prompts.id, promptId));
    return { success: true, message: 'Prompt deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete prompt.' };
  }
}

export async function getAllPromptEntriesAdminAction(page = 1) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db.query.promptEntries.findMany({
      orderBy: desc(promptEntries.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        content: true,
        wordCount: true,
        likeCount: true,
        createdAt: true,
        promptId: true,
      },
      with: {
        user: { columns: { username: true, firstName: true, lastName: true } },
        prompt: { columns: { title: true } },
      },
    }),
    db.select({ total: count() }).from(promptEntries),
  ]);

  return { entries: rows, total, page, pageSize: PAGE_SIZE };
}

export async function deletePromptEntryAdminAction(entryId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(promptEntries).where(eq(promptEntries.id, entryId));
    return { success: true, message: 'Entry deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete entry.' };
  }
}


export async function getAllDiscussionsAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search ? ilike(clubDiscussions.title, `%${search}%`) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.clubDiscussions.findMany({
      where,
      orderBy: desc(clubDiscussions.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        title: true,
        likeCount: true,
        replyCount: true,
        isPinned: true,
        createdAt: true,
        clubId: true,
      },
      with: {
        author: { columns: { username: true, firstName: true, lastName: true } },
        club: { columns: { name: true } },
      },
    }),
    db.select({ total: count() }).from(clubDiscussions).where(where),
  ]);

  return { discussions: rows, total, page, pageSize: PAGE_SIZE };
}

export async function deleteDiscussionAdminAction(discussionId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(clubDiscussions).where(eq(clubDiscussions.id, discussionId));
    return { success: true, message: 'Discussion deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete discussion.' };
  }
}

export async function getAllDiscussionRepliesAdminAction(page = 1) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db.query.clubDiscussionReplies.findMany({
      orderBy: desc(clubDiscussionReplies.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        content: true,
        likeCount: true,
        createdAt: true,
        discussionId: true,
      },
      with: {
        author: { columns: { username: true, firstName: true, lastName: true } },
        discussion: { columns: { title: true } },
      },
    }),
    db.select({ total: count() }).from(clubDiscussionReplies),
  ]);

  return { replies: rows, total, page, pageSize: PAGE_SIZE };
}

export async function deleteDiscussionReplyAdminAction(replyId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(clubDiscussionReplies).where(eq(clubDiscussionReplies.id, replyId));
    return { success: true, message: 'Reply deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete reply.' };
  }
}


export async function getAllNotificationsAdminAction(page = 1) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db.query.notifications.findMany({
      orderBy: desc(notifications.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        type: true,
        isRead: true,
        link: true,
        createdAt: true,
        recipientId: true,
        actorId: true,
      },
      with: {
        recipient: { columns: { username: true } },
        actor: { columns: { username: true } },
      },
    }),
    db.select({ total: count() }).from(notifications),
  ]);

  return { notifications: rows, total, page, pageSize: PAGE_SIZE };
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: { username: string | null; firstName: string | null } | null;
};

export async function getAnnouncementsAction(): Promise<AnnouncementItem[]> {
  const rows = await db.query.announcements.findMany({
    orderBy: desc(announcements.createdAt),
    with: { createdBy: { columns: { username: true, firstName: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    createdAt: r.createdAt,
    createdBy: r.createdBy,
  }));
}

export async function getAllAnnouncementsAdminAction(): Promise<AnnouncementItem[]> {
  await requireAdmin();
  return getAnnouncementsAction();
}

export async function createAnnouncementAction(
  title: string,
  content: string,
): Promise<ActionResult> {
  const userId = await requireAdmin();
  if (!title.trim() || !content.trim()) {
    return { success: false, message: 'Title and content are required.' };
  }
  await db.insert(announcements).values({
    title: title.trim(),
    content: content.trim(),
    createdById: userId,
  });
  revalidatePath('/feed');
  revalidatePath('/admin/announcements');
  return { success: true, message: 'Announcement created.' };
}

export async function deleteAnnouncementAdminAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath('/feed');
  revalidatePath('/admin/announcements');
  return { success: true, message: 'Announcement deleted.' };
}
