import { Resend } from 'resend';


const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  try {
    await resend.emails.send({
      from: 'Beehive Books <noreply@beehive-books.app>',
      to: email,
      subject: 'Reset your Beehive Books password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #141414; color: #ffffff; border-radius: 12px;">
          <h1 style="color: #FFC300; font-size: 24px; margin-bottom: 8px;">Reset your password</h1>
          <p style="color: rgba(255,255,255,0.8); margin-bottom: 24px;">Click the button below to reset your Beehive Books password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #FFC300; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 999px; text-decoration: none; margin-bottom: 24px;">Reset password</a>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[Resend] Failed to send password reset email to', email, error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
  console.log('Attempting to send verification email to:', email);
  console.log('Verification URL:', verificationUrl);
  try {
    const result = await resend.emails.send({
      from: 'Beehive Books <noreply@beehive-books.app>',
      to: email,
      subject: 'Verify your Beehive Books email',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #141414; color: #ffffff; border-radius: 12px;">
          <h1 style="color: #FFC300; font-size: 24px; margin-bottom: 8px;">Verify your email</h1>
          <p style="color: rgba(255,255,255,0.8); margin-bottom: 24px;">Click the button below to verify your Beehive Books email address.</p>
          <a href="${verificationUrl}" style="display: inline-block; background: #FFC300; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 999px; text-decoration: none; margin-bottom: 24px;">Verify email</a>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log('Resend result:', JSON.stringify(result));
  } catch (error) {
    console.error('[Resend] Failed to send verification email to', email, error);
    throw error;
  }
}
