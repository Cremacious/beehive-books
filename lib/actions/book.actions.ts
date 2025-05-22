import { z } from 'zod';
import { bookCreationFormSchema } from '../validators/bookCreation';
import { connectDB } from '../config/database';
import { formatError } from '../utils';
import Book from '../models/Book';

export async function createBook(data: z.infer<typeof bookCreationFormSchema>) {
  try {
    await connectDB();
    const book = bookCreationFormSchema.parse(data);
    console.log('book', book);
    const existingBook = await Book.findOne({
      title: book.title,
    });
    if (existingBook) {
      throw new Error('Book already exists');
    }
    const newBook = new Book(book);
    await newBook.save();
    return { success: true, message: 'Book created successfully' };
  } catch (error) {
    return { success: false, message: `${formatError(error)}` };
  }
}
