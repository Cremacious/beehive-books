import SignInForm from '@/components/auth/signin-form';
import logo from '@/assets/hive-icon4.png';
import Image from 'next/image';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex flex-col justify-center sm:h-screen p-4">
      <div className="max-w-md w-full mx-auto rounded-2xl p-8 bg-[#202020] shadow-2xl">
        <div className=" ">
          <div className="justify-center flex flex-col items-center">
            <Image src={logo} alt="logo" className="w-40 inline-block" />
            <div className="text-yellow-400 caveatBrush text-3xl">
              Sign In
            </div>
          </div>
        </div>
        <SignInForm />
        <p className="text-white text-sm text-center">
          Don&apos;t have an account?
          <Link
            href="/sign-up"
            className="text-yellow-400 font-medium hover:underline ml-1"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
