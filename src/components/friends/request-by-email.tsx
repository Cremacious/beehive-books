'use client';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendFriendRequestByEmail } from '@/lib/actions/friend.actions';
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

const formSchema = z.object({
  friendEmail: z.string(),
});

export default function FriendRequestByEmail() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      friendEmail: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await sendFriendRequestByEmail(values.friendEmail);
      if (response.success) {
        toast.success('Friend request sent successfully!');
        form.reset();
      } else {
        toast.error(response.message || 'Failed to send friend request.');
      }
    } catch (error) {
      console.error('Form submission error', error);
      toast.error('Failed to submit the form. Please try again.');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col md:flex-row gap-2 w-full items-end"
      >
        <FormField
          control={form.control}
          name="friendEmail"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-yellow-400 text-lg">
                Friend Email
              </FormLabel>
              <FormControl>
                <Input
                  className="rounded-lg px-4 py-2 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white text-slate-800 shadow-sm transition w-full"
                  placeholder=""
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full md:w-auto" type="submit">
          Send Request
        </Button>
      </form>
    </Form>
  );
}
