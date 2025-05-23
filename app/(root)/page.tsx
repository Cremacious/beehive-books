import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SessionCheck from './sessioncheck';
import SignOutButton from './signoutButton';

export default function Home() {
  return (
    <div>
      Hello world
      <Button asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
      <SignOutButton />
      <SessionCheck />
    </div>
  );
}
