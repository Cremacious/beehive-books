import Image from 'next/image';
import logo from '@/public/logo.png';
import Link from 'next/link';
import { Button } from '../ui/button';

const Header = () => {
  const links = [
    { href: '/', name: 'Home' },
    {
      href: '/dashboard',
      name: 'Dashboard',
    },
  ];

  return (
    <nav className="flex flex-row justify-between bg-beeDark p-1">
      <Link href={'/'}>
        <Image src={logo} alt="beehive books" width="270" />
      </Link>
      <div className="flex flex-row items-center justify-center gap-4">
        {links.map((link) => (
          <Link href={link.href} key={link.name}>
            <h3 className="font-bold text-beeYellow">{link.name}</h3>
          </Link>
        ))}
      </div>
      <div className="flex items-center">
        <Button>Sign Up</Button>
      </div>
    </nav>
  );
};

export default Header;
