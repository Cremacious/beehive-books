import './globals.css';
import { Comfortaa } from 'next/font/google';
import { getLocale } from 'next-intl/server';

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-comfortaa',
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${comfortaa.variable} antialiased overflow-hidden h-screen`}>{children}</body>
    </html>
  );
}
