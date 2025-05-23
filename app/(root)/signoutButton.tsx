'use client';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/actions/user.actions';

const SignOutButton = () => {
  const handleSignOut = async () => {
    await signOutUser();
    console.log('User signed out successfully');
  };

  return (
    <Button onClick={handleSignOut}>Sign Out Action</Button>
  );
};

export default SignOutButton;
