import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1).optional(),
  genre: z.string().min(1),
  description: z.string().optional(),
  coverUrl: z.string().optional(),
  privacy: z.enum(['public', 'private']),
});
