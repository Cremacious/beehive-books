'use server';

import connectDB from '@/lib/config/database';
import {
  signUpFormSchema,
} from '../validators/accountCreation';
import User from '../models/User';
import z from 'zod';
import { formatError } from '../utils';
import { hashSync } from 'bcrypt-ts-edge';
import { signIn, signOut } from '@/lib/config/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

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
    const plainPassword = user.password;
    const hashedPassword = hashSync(plainPassword, 10);
    const newUser = new User({
      username: user.username,
      email: user.email,
      password: hashedPassword,
    });
    await newUser.save();
    const signInResult = await signIn('credentials', {
      email: user.email,
      password: user.password,
      redirect: false,
    });
    if (signInResult && signInResult.error) {
      return { success: false, message: signInResult.error };
    }
    return { success: true, message: 'User created successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: `${formatError(error)}` };
  }
}

// export async function signInUser(data: z.infer<typeof signInFormSchema>) {
//   try {
//     await connectDB();
//     const user = signInFormSchema.parse(data);
//     console.log(user);
//     await signIn('credentials', user);
//     return { success: true, message: 'User signed in successfully' };
//   } catch (error) {
//     console.log(error);
//     if (isRedirectError(error)) {
//       throw error;
//     }
//     return { success: false, message: `${formatError(error)}` };
//   }
// }

// export async function signInUser(data: z.infer<typeof signInFormSchema>) {
//   try {
//     await connectDB();
//     const user = signInFormSchema.parse(data);
//     // Optionally check if user exists here, but do NOT call signIn
//     return { success: true, message: 'User exists' };
//   } catch (error) {
//     return { success: false, message: `${formatError(error)}` };
//   }
// }

export async function signOutUser() {
  await signOut();
  console.log('clicked sign out');
}
