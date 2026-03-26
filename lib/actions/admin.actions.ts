'use server';

import { requireAuth, getOptionalUserId } from '@/lib/require-auth';

import { and, count, desc, eq, gte, ilike, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import {
  users,
  books,
  chapters,
  bookClubs,
  bookComments,
  hives,
  prompts,
  promptEntries,
  promptEntryComments,
  clubDiscussions,
  clubDiscussionReplies,
  notifications,
  announcements,
  announcementDismissals,
  adminAuditLog,
  contentReports,
  session,
} from '@/db/schema';
import { checkActionRateLimit } from '@/lib/check-action-rate-limit';
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

async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  targetLabel?: string,
  note?: string,
) {
  await db.insert(adminAuditLog).values({ adminId, action, targetType, targetId, targetLabel, note });
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
        username: true,
        image: true,
        role: true,
        premium: true,
        banned: true,
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
        user: { columns: { username: true } },
      },
    }),
    db.select({ total: count() }).from(books).where(where),
  ]);

  type AdminBook = {
    id: string; title: string; author: string; privacy: string;
    wordCount: number; chapterCount: number; coverUrl: string | null;
    createdAt: Date; userId: string;
    user: { username: string | null } | null;
  };

  return { books: rows as unknown as AdminBook[], total, page, pageSize: PAGE_SIZE };
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

  type AdminChapter = {
    id: string; title: string; wordCount: number; bookId: string;
    order: number; createdAt: Date;
    book: { title: string; userId: string; user: { username: string | null } | null } | null;
  };

  return { chapters: rows as unknown as AdminChapter[], total, page, pageSize: PAGE_SIZE };
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
        owner: { columns: { username: true } },
      },
    }),
    db.select({ total: count() }).from(bookClubs).where(where),
  ]);

  type AdminClub = {
    id: string; name: string; privacy: string; memberCount: number;
    createdAt: Date; ownerId: string;
    owner: { username: string | null } | null;
  };

  return { clubs: rows as unknown as AdminClub[], total, page, pageSize: PAGE_SIZE };
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
        creator: { columns: { username: true } },
      },
    }),
    db.select({ total: count() }).from(prompts).where(where),
  ]);

  type AdminPrompt = {
    id: string; title: string; status: string; entryCount: number;
    endDate: Date; createdAt: Date; privacy: string;
    creator: { username: string | null } | null;
  };

  return { prompts: rows as unknown as AdminPrompt[], total, page, pageSize: PAGE_SIZE };
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
        user: { columns: { username: true } },
        prompt: { columns: { title: true } },
      },
    }),
    db.select({ total: count() }).from(promptEntries),
  ]);

  type AdminPromptEntry = {
    id: string; content: string; wordCount: number; likeCount: number;
    createdAt: Date; promptId: string;
    user: { username: string | null } | null;
    prompt: { title: string } | null;
  };

  return { entries: rows as unknown as AdminPromptEntry[], total, page, pageSize: PAGE_SIZE };
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
        author: { columns: { username: true } },
        club: { columns: { name: true } },
      },
    }),
    db.select({ total: count() }).from(clubDiscussions).where(where),
  ]);

  type AdminDiscussion = {
    id: string; title: string; likeCount: number; replyCount: number;
    isPinned: boolean; createdAt: Date; clubId: string;
    author: { username: string | null } | null;
    club: { name: string } | null;
  };

  return { discussions: rows as unknown as AdminDiscussion[], total, page, pageSize: PAGE_SIZE };
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
        author: { columns: { username: true } },
        discussion: { columns: { title: true } },
      },
    }),
    db.select({ total: count() }).from(clubDiscussionReplies),
  ]);

  type AdminDiscussionReply = {
    id: string; content: string; likeCount: number;
    createdAt: Date; discussionId: string;
    author: { username: string | null } | null;
    discussion: { title: string } | null;
  };

  return { replies: rows as unknown as AdminDiscussionReply[], total, page, pageSize: PAGE_SIZE };
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

  type AdminNotification = {
    id: string; type: string; isRead: boolean; link: string;
    createdAt: Date; recipientId: string; actorId: string | null;
    recipient: { username: string | null } | null;
    actor: { username: string | null } | null;
  };

  return { notifications: rows as unknown as AdminNotification[], total, page, pageSize: PAGE_SIZE };
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: { username: string | null } | null;
};

export async function getAnnouncementsAction(): Promise<AnnouncementItem[]> {
  const userId = await getOptionalUserId();

  const rows = await db.query.announcements.findMany({
    orderBy: desc(announcements.createdAt),
    with: { createdBy: { columns: { username: true } } },
  });

  if (!userId) {
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt,
      createdBy: r.createdBy,
    }));
  }

  const dismissals = await db.query.announcementDismissals.findMany({
    where: eq(announcementDismissals.userId, userId),
    columns: { announcementId: true },
  });
  const dismissedIds = new Set(dismissals.map((d) => d.announcementId));

  return rows
    .filter((r) => !dismissedIds.has(r.id))
    .map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt,
      createdBy: r.createdBy,
    }));
}

export async function dismissAnnouncementAction(
  announcementId: string,
): Promise<{ success: boolean }> {
  try {
    const userId = await requireAuth();
    await db
      .insert(announcementDismissals)
      .values({ userId, announcementId })
      .onConflictDoNothing();
    return { success: true };
  } catch {
    return { success: false };
  }
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
  revalidatePath('/home');
  revalidatePath('/admin/announcements');
  return { success: true, message: 'Announcement created.' };
}

export async function deleteAnnouncementAdminAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath('/home');
  revalidatePath('/admin/announcements');
  return { success: true, message: 'Announcement deleted.' };
}


// ---------------------------------------------------------------------------
// Ban / Unban / Delete user
// ---------------------------------------------------------------------------

export async function banUserAction(userId: string, reason?: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  const target = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { username: true, role: true } });
  if (!target) return { success: false, message: 'User not found.' };
  if (target.role === 'admin') return { success: false, message: 'Cannot ban an admin.' };
  await db.update(users).set({ banned: true, bannedAt: new Date(), bannedReason: reason ?? null, updatedAt: new Date() }).where(eq(users.id, userId));
  // Delete all sessions for the user
  await db.delete(session).where(eq(session.userId, userId));
  void logAdminAction(adminId, 'BAN_USER', 'USER', userId, target.username ?? userId, reason);
  revalidatePath('/admin/users');
  return { success: true, message: 'User banned.' };
}

export async function unbanUserAction(userId: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  const target = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { username: true } });
  if (!target) return { success: false, message: 'User not found.' };
  await db.update(users).set({ banned: false, bannedAt: null, bannedReason: null, updatedAt: new Date() }).where(eq(users.id, userId));
  void logAdminAction(adminId, 'UNBAN_USER', 'USER', userId, target.username ?? userId);
  revalidatePath('/admin/users');
  return { success: true, message: 'User unbanned.' };
}

export async function deleteUserAdminAction(userId: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  if (userId === adminId) return { success: false, message: 'Cannot delete yourself.' };
  const target = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { username: true, role: true } });
  if (!target) return { success: false, message: 'User not found.' };
  if (target.role === 'admin') return { success: false, message: 'Cannot delete an admin.' };
  void logAdminAction(adminId, 'DELETE_USER', 'USER', userId, target.username ?? userId);
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath('/admin/users');
  return { success: true, message: 'User deleted.' };
}


// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export async function getAdminAuditLogAction(page = 1, perPage = PAGE_SIZE) {
  await requireAdmin();
  const offset = (page - 1) * perPage;
  const [rows, [{ total }]] = await Promise.all([
    db.query.adminAuditLog.findMany({
      orderBy: desc(adminAuditLog.createdAt),
      limit: perPage,
      offset,
      with: { admin: { columns: { username: true } } },
    }),
    db.select({ total: count() }).from(adminAuditLog),
  ]);
  type AuditRow = {
    id: string; action: string; targetType: string; targetId: string;
    targetLabel: string | null; note: string | null; createdAt: Date;
    admin: { username: string | null } | null;
  };
  return { rows: rows as unknown as AuditRow[], total, page, pageSize: perPage };
}


// ---------------------------------------------------------------------------
// Content reports
// ---------------------------------------------------------------------------

export async function getContentReportsAction(page = 1, perPage = PAGE_SIZE, status?: 'PENDING' | 'REVIEWED' | 'DISMISSED') {
  await requireAdmin();
  const offset = (page - 1) * perPage;
  const where = status ? eq(contentReports.status, status) : undefined;
  const [rows, [{ total }]] = await Promise.all([
    db.query.contentReports.findMany({
      where,
      orderBy: desc(contentReports.createdAt),
      limit: perPage,
      offset,
      with: { reporter: { columns: { username: true } } },
    }),
    db.select({ total: count() }).from(contentReports).where(where),
  ]);
  type ReportRow = {
    id: string; targetType: string; targetId: string; reason: string;
    status: string; createdAt: Date; reviewedAt: Date | null;
    reporter: { username: string | null } | null;
  };
  return { rows: rows as unknown as ReportRow[], total, page, pageSize: perPage };
}

export async function dismissReportAction(reportId: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  await db.update(contentReports).set({ status: 'DISMISSED', reviewedAt: new Date(), reviewedById: adminId }).where(eq(contentReports.id, reportId));
  void logAdminAction(adminId, 'DISMISS_REPORT', 'REPORT', reportId);
  revalidatePath('/admin/reports');
  return { success: true, message: 'Report dismissed.' };
}

export async function removeReportedContentAction(reportId: string): Promise<ActionResult> {
  const adminId = await requireAdmin();
  const report = await db.query.contentReports.findFirst({ where: eq(contentReports.id, reportId) });
  if (!report) return { success: false, message: 'Report not found.' };
  try {
    if (report.targetType === 'BOOK') await db.delete(books).where(eq(books.id, report.targetId));
    else if (report.targetType === 'CLUB') await db.delete(bookClubs).where(eq(bookClubs.id, report.targetId));
    else if (report.targetType === 'PROMPT') await db.delete(prompts).where(eq(prompts.id, report.targetId));
    else if (report.targetType === 'COMMENT') await db.delete(promptEntryComments).where(eq(promptEntryComments.id, report.targetId));
    else if (report.targetType === 'BOOK_COMMENT') await db.delete(bookComments).where(eq(bookComments.id, report.targetId));
    else if (report.targetType === 'USER') await db.delete(users).where(eq(users.id, report.targetId));
    await db.update(contentReports).set({ status: 'REVIEWED', reviewedAt: new Date(), reviewedById: adminId }).where(eq(contentReports.id, reportId));
    void logAdminAction(adminId, `DELETE_${report.targetType}`, report.targetType, report.targetId);
    revalidatePath('/admin/reports');
    return { success: true, message: 'Content removed.' };
  } catch {
    return { success: false, message: 'Failed to remove content.' };
  }
}

export async function createReportAction(
  targetType: 'BOOK' | 'COMMENT' | 'BOOK_COMMENT' | 'CLUB' | 'PROMPT' | 'USER',
  targetId: string,
  reason: string,
): Promise<ActionResult> {
  const userId = await requireAuth();
  const limited = await checkActionRateLimit(userId);
  if (limited) return { success: false, message: limited };
  if (!reason.trim()) return { success: false, message: 'Reason is required.' };
  await db.insert(contentReports).values({ reporterId: userId, targetType, targetId, reason: reason.trim() });
  return { success: true, message: 'Report submitted.' };
}

export async function getPendingReportsCountAction(): Promise<number> {
  await requireAdmin();
  const [{ total }] = await db.select({ total: count() }).from(contentReports).where(eq(contentReports.status, 'PENDING'));
  return total;
}


// ---------------------------------------------------------------------------
// Hives admin
// ---------------------------------------------------------------------------

export async function getAllHivesAdminAction(page = 1, search?: string) {
  await requireAdmin();
  const offset = (page - 1) * PAGE_SIZE;

  const where = search ? ilike(hives.name, `%${search}%`) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db.query.hives.findMany({
      where,
      orderBy: desc(hives.createdAt),
      limit: PAGE_SIZE,
      offset,
      columns: {
        id: true,
        name: true,
        privacy: true,
        memberCount: true,
        createdAt: true,
        ownerId: true,
        bookId: true,
      },
      with: {
        owner: { columns: { username: true } },
        book: { columns: { title: true } },
      },
    }),
    db.select({ total: count() }).from(hives).where(where),
  ]);

  type AdminHive = {
    id: string; name: string; privacy: string; memberCount: number;
    createdAt: Date; ownerId: string; bookId: string | null;
    owner: { username: string | null } | null;
    book: { title: string } | null;
  };

  return { hives: rows as unknown as AdminHive[], total, page, pageSize: PAGE_SIZE };
}

export async function deleteHiveAdminAction(hiveId: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(hives).where(eq(hives.id, hiveId));
    return { success: true, message: 'Hive deleted.' };
  } catch {
    return { success: false, message: 'Failed to delete hive.' };
  }
}


// ---------------------------------------------------------------------------
// Signup chart
// ---------------------------------------------------------------------------

export async function getSignupChartDataAction(): Promise<{ date: string; count: number }[]> {
  await requireAdmin();
  const rows = await db.select({
    date: sql<string>`DATE(${users.createdAt})`,
    count: count(),
  }).from(users)
    .where(gte(users.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);
  return rows.map(r => ({ date: r.date, count: r.count }));
}
