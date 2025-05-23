'use server';

import {
  signInFormSchema,
  signUpFormSchema,
} from '../validators/accountCreation';
import z from 'zod';
import { formatError } from '../utils';
import { hashSync } from 'bcrypt-ts-edge';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import prisma from '../config/prisma';
import { signIn, signOut } from '@/lib/config/auth';
import { redirect } from 'next/navigation';

export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const result = await signIn('credentials', {
      email: user.email,
      password: user.password,
      redirect: false,
    });
    if (result?.ok) {
      redirect('/dashboard');
    }

    redirect('/dashboard');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: 'Invalid email or password' };
  }
}

export async function signUpUserWithCredentials(
  data: z.infer<typeof signUpFormSchema>
) {
  try {
    const user = signUpFormSchema.parse(data);
    const plainPassword = user.password;
    user.password = hashSync(plainPassword, 10);
    await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });
    return { success: true, message: 'User created successfully!' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: `${formatError(error)}` };
  }
}

export async function signOutUser() {
  await signOut();
}
