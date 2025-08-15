import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1).optional(),
  genre: z.string().min(1),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  coverImageBase64: z.string().optional(),
  privacy: z.enum(['public', 'private']),
});

export const chapterSchema = z.object({
  title: z.string().min(1),
  notes: z.string().min(1).optional(),
  content: z.string().min(1),
  privacy: z.enum(['public', 'private']).optional(),
});
