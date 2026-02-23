import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Link
        href="/sign-up"
        className="flex h-12 w-48 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Sign Up
      </Link>
      <Link
        href="/sign-in"
        className="flex h-12 w-48 items-center justify-center rounded-full border border-black/8 transition-colors hover:border-transparent hover:bg-black/4 dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
      >
        Sign In
      </Link>
    </div>
  );
}
