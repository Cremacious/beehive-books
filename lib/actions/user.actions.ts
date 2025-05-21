'use server';
export const runtime = 'nodejs';
import { connectDB } from '../config/database';
import { signUpFormSchema } from '../validators/forms';
import User from '../models/User';
import z from 'zod';
// import { formatError } from '../utils';

export async function createUser(data: z.infer<typeof signUpFormSchema>) {
  try {
    await connectDB();
    const user = signUpFormSchema.parse(data);
    console.log(user);
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
    // console.log(formatError(error));
    return { success: false, message: `${(error)}` };
    //  return { success: false, message: `${formatError(error)}` };
    console.log(error);
  }
}
