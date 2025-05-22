import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// import { compareSync } from 'bcrypt-ts-edge';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import client from '@/lib/config/mongodb';
import User from '@/lib/models/User';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  pages: {
    signIn: '/sign-in',
    error: '/',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        const user = await User.findOne({ email: credentials?.email });
        if (user && user.password === credentials?.password) {
     
          return { id: user._id, email: user.email, name: user.username };
        }
        return null;
      },
    }),
  ],
});
