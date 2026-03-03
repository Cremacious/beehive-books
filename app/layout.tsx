import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Fredoka } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
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
      <html lang="en" className={fredoka.variable}>
        <body className="antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
