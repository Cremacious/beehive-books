import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/header/navbar';
import { Toaster } from '@/components/ui/sonner';
import Footer from '@/components/footer';
// import NotificationInitializer from '@/lib/providers/notificationProvider';
// import { getPendingFriendRequests } from '@/lib/actions/friend.actions';
export const metadata: Metadata = {
  title: 'Beehive Books',
  description: 'Write, share, and grow together.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const pendingFriendRequests = await getPendingFriendRequests();
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-500 min-h-screen flex flex-col">
          {/* <NotificationInitializer
            initialFriendRequests={pendingFriendRequests}
          /> */}
          <Navbar />
          <main className="flex-1 flex flex-col relative z-0 h-full">
            {children}
          </main>
          <Footer />
          <Toaster richColors />
        </div>
      </body>
    </html>
  );
}
