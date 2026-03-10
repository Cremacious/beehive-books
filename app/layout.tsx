import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Comfortaa } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';

//TODO:  Create alert on club page when pending join requests
//TODO: Delete Dialog for deleting club discussion
//TODO: User's names can be clicked to view their profile
//TODO: Fix issue with page shifting when uploading docx

//TODO: Notifications work when receiving a request to join a club, when someone comments on your discussion, when someone posts a discussion in your club, NOT when someone likes your discussion comment, NOT when someone replies to your discussion comment, when someone posts in your prompt, when someone comments on your prompt entry, when someone  comments on your book, when someone replies to your book comment, when someone likes your book comment, when someone wants to join your hive,

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-comfortaa',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Beehive Books',
    template: '%s · Beehive Books',
  },
  description:
    'Beehive Books — write, read, and share stories with your community. Create books, join reading groups, and connect with other writers.',
  openGraph: {
    siteName: 'Beehive Books',
    type: 'website',
    locale: 'en_US',
  },
  metadataBase: new URL('https://beehivebooks.com'),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className={comfortaa.variable}>
        <body className="antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
