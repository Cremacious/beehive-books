import { z } from 'zod';

export const signUpFormSchema = z.object({
  username: z.string().min(1, {
    message: 'Username is required',
  }),
  email: z.string().email({
    message: 'Email is invalid',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 6 characters',
  }),
  confirmPassword: z.string().min(8, {
    message: 'Confirm Password must be at least 6 characters',
  }),
});
export const signInFormSchema = z.object({
  email: z.string().email({
    message: 'Email is invalid',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 6 characters',
  }),
});
