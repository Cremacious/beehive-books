'use server';

import { db } from '@/db';
import { books } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type MilestoneKey =
  | 'FIRST_WORD'
  | 'FIRST_CHAPTER'
  | 'IN_THE_GROOVE'
  | 'GETTING_STARTED'
  | 'FRESH_EYES'
  | 'FIRST_DRAFT_DONE'
  | 'SECOND_DRAFT'
  | 'FINISHED';

export type Milestone = {
  key: MilestoneKey;
  label: string;
  description: string;
};

export const MILESTONES: Milestone[] = [
  {
    key: 'FIRST_WORD',
    label: 'First Word',
    description: 'Created your first book.',
  },
  {
    key: 'GETTING_STARTED',
    label: 'Getting Started',
    description: 'Wrote content in a chapter for the first time.',
  },
  {
    key: 'FIRST_CHAPTER',
    label: 'First Chapter',
    description: 'Added the first chapter to the book.',
  },
  {
    key: 'IN_THE_GROOVE',
    label: 'In the Groove',
    description: 'Reached 3 chapters in the book.',
  },
  {
    key: 'FRESH_EYES',
    label: 'Fresh Eyes',
    description: 'Made the book visible to others (Friends or Public).',
  },
  {
    key: 'FIRST_DRAFT_DONE',
    label: 'First Draft Done',
    description: 'Marked the book as First Draft complete.',
  },
  {
    key: 'SECOND_DRAFT',
    label: 'Second Draft',
    description: 'Advanced to Second Draft.',
  },
  {
    key: 'FINISHED',
    label: 'Finished',
    description: 'Marked the book as Completed.',
  },
];

export async function awardMilestoneIfNew(
  bookId: string,
  key: MilestoneKey,
): Promise<void> {
  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    columns: { milestones: true },
  });
  if (!book) return;

  const existing = book.milestones as { key: string; achievedAt: string }[];
  if (existing.some((m) => m.key === key)) return;

  const updated = [...existing, { key, achievedAt: new Date().toISOString() }];
  await db.update(books).set({ milestones: updated }).where(eq(books.id, bookId));
}
