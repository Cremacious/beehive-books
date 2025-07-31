import Link from 'next/link';
import AuthButtons from './auth-buttons';

export default async function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 border-b-4 border-yellow-400 shadow-md">
      <div className="flex items-center min-w-[180px]">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-tight text-yellow-400 drop-shadow-lg"
        >
          Beehive Books
        </Link>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex gap-8 text-yellow-100 font-medium">
          <Link href="/books" className="hover:text-yellow-400 transition">
            Books
          </Link>
          <Link href="/dashboard" className="hover:text-yellow-400 transition">
            Dashboard
          </Link>
          <Link href="/friends" className="hover:text-yellow-400 transition">
            Friends
          </Link>
          <Link
            href="/notifications"
            className="hover:text-yellow-400 transition"
          >
            Notifications
          </Link>
        </div>
      </div>

      <div className="flex items-center min-w-[180px] justify-end">
        <AuthButtons />
      </div>
    </nav>
  );
}
