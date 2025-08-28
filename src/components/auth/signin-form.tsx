'use client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { signIn } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { signInFormSchema } from '@/lib/validators/auth.validators';
import { LoaderPinwheel } from 'lucide-react';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof signInFormSchema>) {
    try {
      await signIn.email({
        email: values.email,
        password: values.password,
      });
      router.push('/books');
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-yellow-400">Email</FormLabel>
              <FormControl>
                <Input
                  className="bg-white"
                  placeholder=""
                  type="email"
                  {...field}
                />
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
              <FormLabel className="text-yellow-400">Password</FormLabel>
              <FormControl>
                <Input
                  className="bg-white"
                  placeholder=""
                  type="password"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        {isSubmitting ? (
          <Button className="w-full" disabled>
            <LoaderPinwheel
              className="animate-spin text-[#202020]"
              size={300}
            />
          </Button>
        ) : (
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        )}
      </form>
    </Form>
  );
}
