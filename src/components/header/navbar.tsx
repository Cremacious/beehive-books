import Link from 'next/link';
import AuthButtons from './auth-buttons';

export default async function Navbar() {
  return (
    <nav className="w-full px-6 py-4 customDark  shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center min-w-[180px]">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg"
          >
            Beehive Books
          </Link>
        </div>

        <div className="flex-1 md:flex hidden justify-center">
          <div className="flex gap-8 text-yellow-100 font-medium">
            <Link
              href="/dashboard"
              className="hover:text-yellow-400 hoverAnimateTiny"
            >
              Dashboard
            </Link>
            <Link href="/books" className="hover:text-yellow-400 hoverAnimateTiny">
              Books
            </Link>
            <Link href="/friends" className="hover:text-yellow-400 hoverAnimateTiny">
              Friends
            </Link>
            <Link
              href="/notifications"
              className="hover:text-yellow-400 hoverAnimateTiny"
            >
              Messages
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center min-w-[180px] justify-end ">
          <AuthButtons />
        </div>
      </div>
    </nav>
  );
}
