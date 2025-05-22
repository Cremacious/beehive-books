import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/config/database'; // Adjust path as needed
import User from '@/lib/models/User'; // Your Mongoose User model

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Only handle user.created events
    if (evt.type === 'user.created') {
      const { id, email_addresses, username } = evt.data;
      const email = email_addresses?.[0]?.email_address || '';

      await connectDB();

      // Check if user already exists (optional, but recommended)
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        await User.create({
          username, // fallback to email if username is missing
          email,
          password: '', // Clerk handles auth, so you can leave this blank or null
        });
        console.log(`Created new user in MongoDB for Clerk user ID: ${id}`);
      }
    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}