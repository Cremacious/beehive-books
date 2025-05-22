import type { Metadata } from 'next';
import '@/assets/styles/globals.css';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/shared/Footer';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    template: ` %s | Next Clothing`,
    default: APP_NAME,
  },
  // description: `${APP_DESCRIPTION}`,
  // metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
      <Toaster />
      <Footer />
    </html>
  );
}
