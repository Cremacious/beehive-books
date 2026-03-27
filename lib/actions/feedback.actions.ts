'use server';

import { db } from '@/db';
import { feedback, users, adminAuditLog } from '@/db/schema';
import { requireAuth } from '@/lib/require-auth';
import { count, desc, eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type ActionResult = { success: boolean; message: string };

const feedbackSchema = z.object({
  category: z.enum(['feature_request', 'bug_report', 'general', 'content_concern']),
  email: z.string().email().optional().or(z.literal('')),
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
});

export type FeedbackStatus = 'pending' | 'reviewed' | 'in_progress' | 'shipped' | 'declined';

export type FeedbackItem = {
  id: string;
  userId: string | null;
  category: 'feature_request' | 'bug_report' | 'general' | 'content_concern';
  status: FeedbackStatus;
  email: string | null;
  content: string;
  createdAt: Date;
  user: { username: string | null; image: string | null } | null;
};

async function requireAdmin() {
  const userId = await requireAuth();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });
  if (user?.role !== 'admin') throw new Error('Forbidden');
  return userId;
}

export async function submitFeedbackAction(data: {
  category: string;
  email: string;
  content: string;
}): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { category, email, content } = parsed.data;

  let userId: string | null = null;
  try {
    userId = await requireAuth();
  } catch {
    // unauthenticated — fine
  }

  await db.insert(feedback).values({
    userId: userId ?? undefined,
    category,
    email: email || null,
    content,
    status: 'pending',
  });

  return { success: true, message: 'Feedback submitted.' };
}

export async function updateFeedbackStatusAction(
  feedbackId: string,
  status: FeedbackStatus,
): Promise<ActionResult> {
  const adminId = await requireAdmin();

  const item = await db.query.feedback.findFirst({
    where: eq(feedback.id, feedbackId),
    columns: { category: true },
  });
  if (!item) return { success: false, message: 'Not found.' };

  await db
    .update(feedback)
    .set({ status, updatedAt: new Date() })
    .where(eq(feedback.id, feedbackId));

  await db.insert(adminAuditLog).values({
    adminId,
    action: 'UPDATE_FEEDBACK_STATUS',
    targetType: 'FEEDBACK',
    targetId: feedbackId,
    targetLabel: item.category,
    note: status,
  });

  revalidatePath('/admin/feedback');
  return { success: true, message: 'Status updated.' };
}

export async function getFeedbackAdminAction(
  page = 1,
  perPage = 25,
  status?: FeedbackStatus,
): Promise<{ items: FeedbackItem[]; total: number }> {
  await requireAdmin();

  const where = status ? eq(feedback.status, status) : undefined;

  const [rows, countResult] = await Promise.all([
    db.query.feedback.findMany({
      where,
      with: { user: { columns: { username: true, image: true } } },
      orderBy: desc(feedback.createdAt),
      limit: perPage,
      offset: (page - 1) * perPage,
    }),
    db.select({ count: count() }).from(feedback).where(where),
  ]);

  type UserRow = { username: string | null; image: string | null } | null;
  const items: FeedbackItem[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    category: r.category as FeedbackItem['category'],
    status: r.status as FeedbackStatus,
    email: r.email,
    content: r.content,
    createdAt: r.createdAt,
    user: (r.user as unknown as UserRow) ?? null,
  }));

  return { items, total: countResult[0]?.count ?? 0 };
}

export async function deleteFeedbackAdminAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(feedback).where(eq(feedback.id, id));
  revalidatePath('/admin/feedback');
  return { success: true, message: 'Feedback deleted.' };
}
