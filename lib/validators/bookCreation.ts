import { z } from 'zod';

export const bookCreationFormSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }),
  author: z.string().min(1, {
    message: 'Author is required',
  }),
  description: z.string().min(1, {
    message: 'Description is required',
  }),
  genre: z.string().min(1, {
    message: 'Genre is required',
  }),
  category: z.string().min(1, {
    message: 'Category is required',
  }),
});

export const chapterCreationFormSchema = z.object({
  title: z.string().min(1, { message: 'Chapter title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  notes: z.string().optional(),
});
