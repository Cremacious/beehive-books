import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SignUpButton } from '@clerk/nextjs';

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
      <SignUpButton />
    </div>
  );
}
