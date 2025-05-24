import { z } from 'zod';
import { chapterCreationFormSchema } from '../validators/bookCreation';

export type Chapter = z.infer<typeof chapterCreationFormSchema>;

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  chapters: Chapter[];
};
