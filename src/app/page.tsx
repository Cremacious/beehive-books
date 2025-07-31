import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between  text-slate-900 ">
      {/* Header */}

      <section className="flex flex-col items-center gap-4 mt-12">
        <div className="flex gap-4">
          <Link
            href="/sign-up"
            className="bg-yellow-400 text-slate-900 font-bold px-8 py-3 rounded-full shadow hover:bg-yellow-500 transition border-2 border-black text-center"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="bg-black text-yellow-300 font-bold px-8 py-3 rounded-full border-2 border-yellow-400 hover:bg-slate-800 transition text-center"
          >
            Sign In
          </Link>
          <Link href={'/dashboard'}>Dashboard</Link>
        </div>
      </section>

      <section className="w-full max-w-4xl mt-20 px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-yellow-200 mb-8">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-yellow-100 dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center text-center border-2 border-yellow-400">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 border-4 border-black mb-4">
              <span className="text-2xl font-extrabold text-black">1</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-yellow-200">
              Create Your Book
            </h3>
            <p className="text-slate-700 dark:text-yellow-100">
              Start a new book project, add a custom author, title, and cover.
              Organize your chapters easily.
            </p>
          </div>

          <div className="bg-yellow-100 dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center text-center border-2 border-yellow-400">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-black border-4 border-yellow-400 mb-4">
              <span className="text-2xl font-extrabold text-yellow-400">2</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-yellow-200">
              Edit with Friends
            </h3>
            <p className="text-slate-700 dark:text-yellow-100">
              Invite friends to comment, suggest edits, and collaborate on
              chapters. Manage privacy and feedback easily.
            </p>
          </div>
          <div className="bg-yellow-100 dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center text-center border-2 border-yellow-400">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 border-4 border-black mb-4">
              <span className="text-2xl font-extrabold text-black">3</span>
            </div>
            <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-yellow-200">
              Share Online
            </h3>
            <p className="text-slate-700 dark:text-yellow-100">
              Publish your book or chapters, share with friends, and control who
              can read or comment. Spread your story!
            </p>
          </div>
        </div>
      </section>

      <section className="w-full max-w-5xl mt-20 mb-12 px-4 grid gap-8 md:grid-cols-3">
        <div className="bg-slate-900 rounded-xl shadow p-6 flex flex-col items-center text-center border-2 border-yellow-400">
          <span className="inline-block bg-yellow-400 rounded-full p-3 mb-4 border-2 border-black">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M6 4h12v2H6V4zm0 4h12v2H6V8zm0 4h8v2H6v-2zm0 4h8v2H6v-2z"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="font-bold text-lg mb-2 text-yellow-400">
            Write Books Online
          </h3>
          <p className="text-yellow-100">
            Create, edit, and organize your books and chapters from anywhere, on
            any device.
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl shadow p-6 flex flex-col items-center text-center border-2 border-yellow-400">
          <span className="inline-block bg-yellow-400 rounded-full p-3 mb-4 border-2 border-black">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M17 8a5 5 0 0 1-10 0"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="10" stroke="#000" strokeWidth="2" />
            </svg>
          </span>
          <h3 className="font-bold text-lg mb-2 text-yellow-400">
            Share & Collaborate
          </h3>
          <p className="text-yellow-100">
            Easily share your books or chapters with friends. Control privacy
            and invite feedback for beta editing.
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl shadow p-6 flex flex-col items-center text-center border-2 border-yellow-400">
          <span className="inline-block bg-yellow-400 rounded-full p-3 mb-4 border-2 border-black">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <path
                d="M8 21h8M12 17v4M21 7l-9-4-9 4M4 10v4a8 8 0 0 0 16 0v-4"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="font-bold text-lg mb-2 text-yellow-400">
            Comment & Connect
          </h3>
          <p className="text-yellow-100">
            Friends can comment on chapters, reply, and help you improve your
            writing. Manage friends and notifications easily.
          </p>
        </div>
      </section>

      <footer className="w-full py-6 bg-black text-center text-yellow-400 text-sm border-t-4 border-yellow-400">
        &copy; {new Date().getFullYear()} Beehive Books. Write, share, and grow
        together.
      </footer>
    </main>
  );
}
