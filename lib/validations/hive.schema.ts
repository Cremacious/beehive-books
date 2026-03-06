import { z } from 'zod';

export const hiveSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name too long'),
  description: z.string().max(1000, 'Description too long'),
  privacy: z.enum(['PUBLIC', 'FRIENDS', 'PRIVATE']),
  explorable: z.boolean(),
  genre: z.string().max(50, 'Genre too long'),
  tags: z.array(z.string().max(30, 'Tag too long')).max(10, 'Maximum 10 tags'),
});

export const hiveBookLinkSchema = z.object({
  bookId: z.string().optional(),
  newBookTitle: z.string().min(1, 'Book title required').max(200, 'Title too long').optional(),
  newBookAuthor: z.string().min(1, 'Author required').max(200, 'Author too long').optional(),
});

export type HiveSchemaData = z.infer<typeof hiveSchema>;
export type HiveBookLinkData = z.infer<typeof hiveBookLinkSchema>;
