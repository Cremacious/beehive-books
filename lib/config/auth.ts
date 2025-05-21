import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from './database';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import client from '@/lib/config/mongoClient';
import User from '../models/User';
import { compareSync } from 'bcrypt-ts-edge';

export const { signIn, signOut, auth, handlers } = NextAuth({
  adapter: MongoDBAdapter(client),
  pages: {
    signIn: '/signin',
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        await connectDB();
        const user = await User.findOne({
          email: credentials.email,
        });
        if (user && user.password) {
          const isValid = compareSync(
            credentials.password as string,
            user.password
          );
          if (isValid) {
            console.log('User authenticated successfully');
            return user;
          }
        }
        return null;
      },
    }),
  ],
});

