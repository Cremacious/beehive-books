import { z } from 'zod';

export const bookSchema = z.object({
  title:       z.string().min(1, 'Title is required').max(120, 'Title too long'),
  author:      z.string().min(1, 'Author name is required').max(80, 'Author name too long'),
  genre:       z.string().min(1, 'Genre is required'),
  category:    z.string().min(1, 'Category is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1200, 'Description is too long (max 1200 characters)')
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length <= 200,
      'Description is too long (max 200 words)',
    ),
  privacy:     z.enum(['PUBLIC', 'PRIVATE', 'FRIENDS']),
  coverUrl:    z.string().url().optional().or(z.literal('')),
  explorable:  z.boolean(),
  draftStatus: z.enum(['FIRST_DRAFT', 'SECOND_DRAFT', 'THIRD_DRAFT', 'FOURTH_DRAFT', 'FIFTH_DRAFT', 'COMPLETED']),
  tags: z.array(z.string().max(30)).max(10),
});

export type BookFormData = z.infer<typeof bookSchema>;
