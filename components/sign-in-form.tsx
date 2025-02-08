import Link from 'next/link';
import { GiTreeBeehive } from 'react-icons/gi';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const SignInForm = () => {
  return (
    <Card className="w-[350px] no-outline shadow-xl border-white border-8 bg-bee-dark">
      <CardHeader className="space-y-2">
        <GiTreeBeehive className="text-bee-yellow text-6xl mx-auto m-2" />
        <CardTitle className="text-bee-yellow text-center">Sign in</CardTitle>
        <CardDescription className="text-white text-center">
          Sign in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          className="hover:border-bee-yellow hover:border-4"
          placeholder="Email"
        ></Input>
        <Input
          className="hover:border-bee-yellow hover:border-4"
          placeholder="Password"
        ></Input>
      </CardContent>
      <CardFooter className="flex justify-center flex-col space-y-2">
        <Button className="text-bee-dark bg-bee-yellow font-bold text-xl">
          Sign In
        </Button>
        <div>
          <p className="text-white">Don&apos;t have an account?</p>

          <Link href="/register">
            <p className="text-bee-yellow text-center">Click here!</p>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
