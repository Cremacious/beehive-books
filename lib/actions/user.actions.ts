'use server';
// import { useSession, signIn, signOut } from "next-auth/react";
import { connectDB } from '../config/database';
import { signUpFormSchema } from '../validators/accountCreation';
import User from '../models/User';
import z from 'zod';
import { formatError } from '../utils';

export async function createUser(data: z.infer<typeof signUpFormSchema>) {
  try {
    await connectDB();
    const user = signUpFormSchema.parse(data);
    const existingUser = await User.findOne({
      email: user.email,
    });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = new User(user);
    await newUser.save();
    return { success: true, message: 'User created successfully' };
  } catch (error) {
    // return { success: false, message: `${error}` };
    return { success: false, message: `${formatError(error)}` };
  }
}



//  },
//       async authorize(credentials) {
//         // Find user in MongoDB and verify password
//         const user = await User.findOne({ email: credentials?.email });
//         if (user && user.password === credentials?.password) {
//           // In production, use hashed passwords!
//           return { id: user._id, email: user.email, name: user.username };
//         }
//         return null;
//       },