import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import SignUpForm from './sign-up-form';
import hiveIcon from '@/assets/images/layout/hive.png';
import Image from 'next/image';
import Link from 'next/link';

const SignUpPage = () => {
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
                <CardTitle className="text-beeYellow">
                  Create an account!
                </CardTitle>
              </div>
              <SignUpForm />
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center">
              <p className="text-white">Already have an account?</p>
              <Link href="/sign-in">
                <p className="text-beeYellow font-bold">Sign In</p>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignUpPage;
