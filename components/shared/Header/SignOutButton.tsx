'use client';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/actions/user.actions';
import { useRouter } from 'next/navigation';

const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  return <Button onClick={handleSignOut}>Sign Out</Button>;
};

export default SignOutButton;
