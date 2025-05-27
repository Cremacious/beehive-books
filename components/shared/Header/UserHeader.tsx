import Image from 'next/image';
import logo from '@/public/logo.png';
import Link from 'next/link';
import Sidebar from './Sidebar';
import SignOutButton from './SignOutButton';
import { auth } from '@/lib/config/auth';

const Header = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  const links = [
    { href: '/', name: 'Home' },
    {
      href: '/dashboard',
      name: 'Dashboard',
    },
    { href: `/profile/${userId}`, name: 'Profile' },
    { href: '/dashboard/my-books', name: 'My Books' },
    { href: '/dashboard/my-books', name: 'Friends' },
    { href: '/dashboard/my-books', name: 'Messages' },
  ];

  return (
    <nav className="mb-4">
      <div className="flex flex-row justify-between bg-beeDark p-2">
        <Link href={'/'}>
          <Image className="" src={logo} alt="beehive books" width="200" />
        </Link>
        <div className="hidden flex-row items-center gap-8 md:flex">
          {links.map((link) => (
            <Link href={link.href} key={link.name}>
              <div className="font-bold text-2xl text-beeYellow">
                {link.name}
              </div>
            </Link>
          ))}
        </div>
        <div className="hidden items-center md:flex">
          <SignOutButton />
        </div>
        <div className="flex items-center md:hidden">
          <Sidebar links={links} />
        </div>
      </div>
    </nav>
  );
};

export default Header;
