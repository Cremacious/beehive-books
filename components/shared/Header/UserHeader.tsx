import Image from 'next/image';
import logo from '@/public/logo.png';
import Link from 'next/link';
import { Button } from '../../ui/button';
import Sidebar from './Sidebar';

const Header = () => {
  const links = [
    { href: '/', name: 'Home' },
    {
      href: '/dashboard',
      name: 'Dashboard',
    },
  ];

  return (
    <nav className="">
      <div className="flex flex-row justify-between bg-beeDark p-2">
        <Link href={'/'}>
          <Image className="" src={logo} alt="beehive books" width="200" />
        </Link>
        {/* Desktop */}

        <div className="hidden flex-row items-center gap-4 md:flex">
          {links.map((link) => (
            <Link href={link.href} key={link.name}>
              <h3 className="font-bold text-beeYellow">{link.name}</h3>
            </Link>
          ))}
        </div>

        <div className="hidden items-center md:flex">
          <Button>Sign Out</Button>
        </div>
        <div className="flex items-center md:hidden">
          <Sidebar links={links} />
        </div>
      </div>
    </nav>
  );
};

export default Header;
