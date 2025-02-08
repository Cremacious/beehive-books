import Image from 'next/image';
import logo from '@/app/logo.png';
import Link from 'next/link';

const Header = () => {
  return (
    <div>
      <nav className="bg-bee-dark p-1 flex flex-row justify-between">
        <Link href={'/'}>
          <Image src={logo} alt="beehive books" width="270" />
        </Link>
        <div className="flex flex-row justify-end md:mr-8">
          <h3 className="font-bold text-bee-yellow m-2 p-2 rounded-md">
            About
          </h3>
          <h3 className="font-bold text-bee-yellow m-2 p-2 rounded-md">
            Register
          </h3>
          <Link href="/sign-in">
            <h3 className="font-bold text-bee-yellow m-2 p-2 rounded-md">
              Login
            </h3>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;
