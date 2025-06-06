import { z } from 'zod';

export const signUpFormSchema = z
  .object({
    username: z.string().min(1, {
      message: 'Username is required',
    }),
    email: z.string().email({
      message: 'Email is invalid',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Confirm Password must be at least 6 characters',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export const signInFormSchema = z.object({
  email: z.string().email({
    message: 'Email is invalid',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});
