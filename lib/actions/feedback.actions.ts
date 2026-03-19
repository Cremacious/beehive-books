'use server';

import { db } from '@/db';
import { feedback, users } from '@/db/schema';
import { requireAuth } from '@/lib/require-auth';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type ActionResult = { success: boolean; message: string };

const feedbackSchema = z.object({
  type: z.enum(['content_suggestion', 'general_feedback', 'technical_support']),
  email: z.string().email().optional().or(z.literal('')),
  content: z.string().min(10, 'Feedback must be at least 10 characters').max(2000),
});

export type FeedbackItem = {
  id: string;
  type: 'content_suggestion' | 'general_feedback' | 'technical_support';
  email: string | null;
  content: string;
  createdAt: Date;
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
  type: string;
  email: string;
  content: string;
}): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const { type, email, content } = parsed.data;

  await db.insert(feedback).values({
    type,
    email: email || null,
    content,
  });

  return { success: true, message: 'Thank you for your feedback!' };
}

export async function getFeedbackAdminAction(): Promise<FeedbackItem[]> {
  await requireAdmin();

  const rows = await db
    .select()
    .from(feedback)
    .orderBy(desc(feedback.createdAt));

  return rows as FeedbackItem[];
}

export async function deleteFeedbackAdminAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  await db.delete(feedback).where(eq(feedback.id, id));
  revalidatePath('/admin/feedback');

  return { success: true, message: 'Feedback deleted.' };
}
