import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import SignInForm from './sign-in-form';
import hiveIcon from '@/assets/images/layout/hive.png';
import Image from 'next/image';
import Link from 'next/link';

const SignInPage = () => {
  return (
    <>
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md bg-white p-2 shadow-xl rounded-xl">
          <Card className="border-none  bg-beeDark pt-8">
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-4 mb-4">
                <Image
                  src={hiveIcon}
                  alt="Hive Icon"
                  width={100}
                  height={100}
                  className=""
                />
                <CardTitle className="text-beeYellow">Sign In</CardTitle>
              </div>
              <SignInForm />
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center">
              <p className="text-white">Don&apos;t have an account?</p>
              <Link href="/sign-up">
                <p className="text-beeYellow font-bold">Sign Up</p>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignInPage;
