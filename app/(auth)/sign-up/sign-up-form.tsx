'use client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUpFormSchema } from '@/lib/validators/accountCreation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signUpUserWithCredentials } from '@/lib/actions/user.actions';
import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';

const SignUpForm = () => {
  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
  });

  async function onSubmit(data: z.infer<typeof signUpFormSchema>) {
    const response = await signUpUserWithCredentials(data);
    if (response.success) {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.ok) {
        redirect('/dashboard');
      } else {
        toast.error('Sign in failed');
      }
    } else {
      toast.error(response.message);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-3xl space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-beeYellow">
                Username
              </FormLabel>
              <FormControl>
                <Input placeholder="BeeWork1991" type="" {...field} />
              </FormControl>
              <FormDescription className="text-white">
                This is your public username, not author name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-beeYellow">Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-beeYellow">
                Password
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-beeYellow">
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
          <Button className="w-full" type="submit">
            {form.formState.isSubmitting ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
