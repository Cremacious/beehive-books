import { auth } from '@/lib/config/auth';

const SessionCheck = async () => {
  const session = await auth();
  const user = session?.user?.email;
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Session Check</h1>
        <p className="mt-4">Session is valid!</p>
      </div>
    );
  }
  return <>Session? {user}</>;
};

export default SessionCheck;
