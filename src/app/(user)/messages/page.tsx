import beeMailbox from '@/assets/site/mailbox.png';
import Image from 'next/image';
import MessagesTable from '@/components/messages/messages-table';

const mockMessages = [
  {
    id: 1,
    type: 'Friend Request',
    message: 'Your friend request to Maya Honeywell was approved!',
    date: '2025-08-05',
    read: false,
  },
  {
    id: 2,
    type: 'Comment',
    message: 'Buzz Aldrin commented on your chapter: "Loved the twist!"',
    date: '2025-08-04',
    read: true,
  },
  {
    id: 3,
    type: 'Comment',
    message: 'Beatrice Wood commented: "Great writing as always!"',
    date: '2025-08-03',
    read: false,
  },
  {
    id: 4,
    type: 'Friend Request',
    message: 'Winston Hive accepted your friend request.',
    date: '2025-08-02',
    read: true,
  },
  {
    id: 5,
    type: 'Comment',
    message: 'Sunny Fields commented: "Can’t wait for the next chapter!"',
    date: '2025-08-01',
    read: false,
  },
];

export default function MessagesPage() {
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
          <MessagesTable userMessages={mockMessages} />

          {/* <div className="w-full overflow-x-auto rounded-lg border-b-6 border-b-yellow-400 shadow-lg mb-6">
            <div className="min-w-[600px]">
              <div className="flex bg-yellow-100 font-bold text-yellow-900 rounded-t-lg border-b-2 border-yellow-200">
                <div className="w-32 px-4 py-3">Type</div>
                <div className="flex-1 px-4 py-3">Message</div>
                <div className="w-32 px-4 py-3">Date</div>
                <div className="w-32 px-4 py-3 text-right">Actions</div>
              </div>

              {paginated.length === 0 ? (
                <div className="flex text-center text-slate-400 py-8">
                  <div className="w-full">No messages found.</div>
                </div>
              ) : (
                paginated.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-center border-b border-yellow-100 transition cursor-pointer ${
                      msg.read ? 'bg-white' : 'bg-yellow-50'
                    } hover:bg-yellow-200 focus-within:bg-yellow-200`}
                    tabIndex={0}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.actions-cell'))
                        return;
                      handleRowClick(msg.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        handleRowClick(msg.id);
                    }}
                  >
                    <div className="w-32 px-4 py-3 font-medium text-yellow-700">
                      {msg.type}
                    </div>
                    <div className="flex-1 px-4 py-3">{msg.message}</div>
                    <div className="w-32 px-4 py-3">{msg.date}</div>
                    <div
                      className="w-32 px-4 py-3 text-right flex gap-2 actions-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="View"
                        onClick={() => handleView(msg.id)}
                      >
                        <Eye className="w-5 h-5 text-yellow-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete"
                        onClick={() => handleDelete(msg.id)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-white mx-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
