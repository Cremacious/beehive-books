import beeMailbox from '@/assets/site/mailbox.png';
import Image from 'next/image';
import MessagesTable from '@/components/notifications/messages-table';
// import { mockUser } from '@/lib/sampleData';
import { getUserMessages } from '@/lib/actions/message.actions';

export default async function MessagesPage() {
  // const messages = mockUser.notifications
  const messages = await getUserMessages();

  return (
    <div className="mx-auto max-w-5xl px-2">
      <div className="darkContainer ">
        <div className="lightContainer">
          <div className="flex flex-col items-center  mb-8 md:mb-12 px-2 md:px-6 pt-6">
            <div>
              <Image
                src={beeMailbox}
                alt="Bee Mailbox"
                width={200}
                height={100}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl text-center md:text-4xl font-bold text-yellow-400 playWright drop-shadow-sm mb-1">
                Messages & Notifications
              </h1>
            </div>
          </div>
          <MessagesTable userMessages={messages} />
        </div>
      </div>
    </div>
  );
}
