import NextAuth from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import client from '@/lib/config/mongodb';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [],
});
