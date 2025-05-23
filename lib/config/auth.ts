import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
// import { MongoDBAdapter } from '@auth/mongodb-adapter';
// import client from '@/lib/config/mongodb';
// import User from '@/lib/models/User';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/config/prisma';



export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          // console.log(user);
          if (isMatch) {
            return {
              id: user.id,
              name: user.username,
              email: user.email,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      (session.user as { id?: string; email?: string; username?: string }).id = token.id as string | undefined;
      (session.user as { id?: string; email?: string; username?: string }).email = token.email as string | undefined;
      (session.user as { id?: string; email?: string; username?: string }).username = token.username as string | undefined;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.name;
      }
      return token;
    },
  },
});
