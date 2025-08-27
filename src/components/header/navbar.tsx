import Link from 'next/link';
import Image from 'next/image';
import AuthButtons from './auth-buttons';
import hiveIcon from '@/assets/hive-icon4.png';
import { Sidebar } from './sidebar';
import { ROUTES } from '@/lib/constants';

export default async function Navbar() {
  return (
    <nav className="w-full px-6 py-2 bg-[#202020] shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center ">
          <Image
            src={hiveIcon}
            alt="Beehive Books"
            className="h-12 w-12 mr-2 mb-1"
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
            {ROUTES.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className="hover:text-yellow-400  text-yellow-300 hoverAnimateTiny text-lg font-bold"
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center min-w-[180px] justify-end ">
          <AuthButtons />
        </div>
        <div className="md:hidden">
          <Sidebar />
        </div>
      </div>
    </nav>
  );
}
