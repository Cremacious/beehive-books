import { z } from 'zod';

export const readingListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long'),
  privacy: z.enum(['PUBLIC', 'PRIVATE', 'FRIENDS']),
});

export const bookEntrySchema = z.object({
  title: z.string().min(1, 'Book title is required').max(200, 'Title too long'),
  author: z
    .string()
    .min(1, 'Author is required')
    .max(100, 'Author name too long'),
});
