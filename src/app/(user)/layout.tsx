import NotificationInitializer from '@/lib/providers/notificationProvider';
import { getPendingFriendRequests } from '@/lib/actions/friend.actions';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pendingFriendRequests = await getPendingFriendRequests();
  return (
    <div className="mt-4">
      <NotificationInitializer initialFriendRequests={pendingFriendRequests} />
      {children}
    </div>
  );
}
