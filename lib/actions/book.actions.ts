// import { z } from 'zod';
// import { bookCreationFormSchema } from '../validators/bookCreation';
// import connectDB from '../config/database';
// import { formatError } from '../utils';
// import Book from '../models/Book';
// import { auth } from '../config/auth';
// import User from '../models/User';

// export async function createBook(data: z.infer<typeof bookCreationFormSchema>) {
//   try {
//     const session = await auth();
//     if (!session) {
//       throw new Error('Session not found');
//     }
//     const userId = session.user?.id;
//     if (!userId) {
//       throw new Error('User not found');
//     }
//     await connectDB();
//     const bookData = bookCreationFormSchema.parse(data);
//     const book = await Book.create({
//       ...bookData,
//       user: userId,
//     });
//     await User.findByIdAndUpdate(userId, { $push: { books: book._id } });

//     return { success: true, message: `${bookData.title} created successfully` };
//   } catch (error) {
//     return { success: false, message: `${formatError(error)}` };
//   }
// }

// export async function getBooksByUser(userId: string) {
//   await connectDB();
//   return Book.find({ user: userId });
// }
