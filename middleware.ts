import NextAuth from 'next-auth';
import { authConfig } from './lib/config/auth.config';

export const { auth: middleware } = NextAuth(authConfig);
