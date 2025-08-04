import Link from 'next/link';
import Image from 'next/image';
import AuthButtons from './auth-buttons';
import hiveIcon from '@/assets/hive-icon3.png';
import { Sidebar } from './sidebar';
export default async function Navbar() {
  return (
    <nav className="w-full px-6 py-4 customDark  shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center ">
          <Image
            src={hiveIcon}
            alt="Beehive Books"
            className="h-10 w-10 mr-2"
          />
          <Link
            href="/"
            className="text-2xl md:text-3xl font-extrabold tracking-tight text-yellow-300 drop-shadow-lg playwright"
          >
            Beehive Books
          </Link>
        </div>

        <div className="flex-1 md:flex hidden justify-center">
          <div className="flex gap-8 text-yellow-100 font-medium">
            <Link
              href="/dashboard"
              className="hover:text-yellow-400  text-yellow-300 hoverAnimateTiny text-lg font-bold"
            >
              Dashboard
            </Link>
            <Link
              href="/books"
              className="hover:text-yellow-400  text-yellow-300 hoverAnimateTiny text-lg font-bold"
            >
              Books
            </Link>
            <Link
              href="/friends"
              className="hover:text-yellow-400  text-yellow-300 hoverAnimateTiny text-lg font-bold"
            >
              Friends
            </Link>
            <Link
              href="/notifications"
              className="hover:text-yellow-400  text-yellow-300 hoverAnimateTiny text-lg font-bold"
            >
              Messages
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center min-w-[180px] justify-end ">
          <AuthButtons />
        </div>
        <div className='md:hidden'>
          <Sidebar />
        </div>
      </div>
    </nav>
  );
}
