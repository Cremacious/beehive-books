import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/config/database';
import User from '@/lib/models/User';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === 'user.created') {
      const { id, email_addresses, username } = evt.data;
      const email = email_addresses?.[0]?.email_address || '';

      await connectDB();
      console.log('Connected to MongoDB');

      const existingUser = await User.findOne({ email });
      console.log('Existing user:', existingUser);

      if (!existingUser) {
        try {
          await User.create({
            username,
            email,
            // password: '', // Remove if not required
          });
          console.log(`Created new user in MongoDB for Clerk user ID: ${id}`);
        } catch (err) {
          console.error('Error creating user:', err);
        }
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
