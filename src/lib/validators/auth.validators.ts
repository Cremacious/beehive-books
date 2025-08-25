import { z } from 'zod';

export const signUpFormSchema = z
  .object({
    name: z.string().min(1),
    email: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signInFormSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
});
