import { z } from 'zod';

export const chapterSchema = z.object({
  title:        z.string().min(1, 'Title is required').max(120, 'Title too long'),
  content:      z.string().optional(),
  authorNotes:  z.string().max(600, 'Author notes too long').optional(),
  collectionId: z.string().nullable().optional(),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;
