import type { Metadata } from 'next';
import { Comfortaa } from 'next/font/google';
import { Providers } from '@/app/providers';
import './globals.css';


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
    <html lang="en" className={comfortaa.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
