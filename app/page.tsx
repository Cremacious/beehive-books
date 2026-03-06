import Link from 'next/link';
import {
  BookOpen,
  Users,
  Hexagon,
  List,
  Lightbulb,
  ArrowRight,
  PenLine,
  Globe,
  Heart,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* Nav */}
      <nav className="border-b border-[#2a2a2a] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-xl font-bold text-[#FFC300] mainFont tracking-wide">
            Beehive Books
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-[#FFC300] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD040] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFC300]/30 bg-[#FFC300]/10 px-4 py-1.5 text-xs font-semibold text-[#FFC300] uppercase tracking-widest">
            For writers & readers
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight mainFont">
            Write, share, and{' '}
            <span className="text-[#FFC300]">discover stories</span>{' '}
            with your community
          </h1>
          <p className="mb-10 text-lg text-white/80 leading-relaxed max-w-2xl mx-auto">
            Beehive Books is your creative home — publish your writing, join book clubs,
            explore writing hives, and connect with readers who love the same stories you do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-[#FFC300] px-8 py-3.5 text-base font-bold text-black hover:bg-[#FFD040] transition-colors"
            >
              Start writing for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-xl border border-[#333] px-8 py-3.5 text-base font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Explore content
            </Link>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-[#2a2a2a] bg-[#1a1a1a] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {[
              { icon: BookOpen, label: 'Personal Library', color: 'text-blue-400' },
              { icon: Users, label: 'Book Clubs', color: 'text-orange-400' },
              { icon: Hexagon, label: 'Writing Hives', color: 'text-[#FFC300]' },
              { icon: List, label: 'Reading Lists', color: 'text-emerald-400' },
              { icon: Lightbulb, label: 'Writing Prompts', color: 'text-purple-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className={`w-6 h-6 ${color}`} />
                <span className="text-sm font-medium text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library feature */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-blue-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">Library</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Your personal writing library
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Publish books chapter by chapter, like a serialized novel. Organize chapters
                into collections, write author notes, and share your work with the world — or keep
                it private until you&apos;re ready.
              </p>
              <ul className="space-y-3 text-white/80">
                {[
                  'Rich text editor for beautiful formatting',
                  'Upload chapters directly from .docx files',
                  'Organize chapters into named collections',
                  'Public, friends-only, or private privacy settings',
                  'Readers can comment and like individual chapters',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#2a2a2a]">
                <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-white mainFont">The Gilded Shore</p>
                  <p className="text-xs text-white/80">Fantasy · 12 chapters · 24k words</p>
                </div>
              </div>
              {['Prologue', 'Chapter 1 — The Awakening', 'Chapter 2 — Beneath the Waves'].map((ch) => (
                <div key={ch} className="flex items-center gap-3 rounded-lg bg-[#252525] px-3 py-2.5">
                  <PenLine className="w-4 h-4 text-white/80 flex-shrink-0" />
                  <span className="text-sm text-white/80">{ch}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Book Clubs feature */}
      <section className="px-6 py-20 bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6 space-y-3">
              {[
                { name: 'Fantasy Readers', members: '14 members', active: true },
                { name: 'Classic Lit Club', members: '8 members', active: false },
                { name: 'Sci-Fi & Beyond', members: '22 members', active: false },
              ].map(({ name, members, active }) => (
                <div
                  key={name}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 ${active ? 'bg-orange-400/10 border border-orange-400/20' : 'bg-[#252525]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-white/80'}`} />
                    <div>
                      <p className={`text-sm font-medium ${active ? 'text-orange-400' : 'text-white/80'}`}>{name}</p>
                      <p className="text-xs text-white/80">{members}</p>
                    </div>
                  </div>
                  {active && (
                    <span className="text-[10px] font-semibold text-orange-400 bg-orange-400/10 rounded-full px-2 py-0.5">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 text-orange-400">
                <Users className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">Book Clubs</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Read and discuss together
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Create or join book clubs with friends. Pick what you&apos;re reading next, hold
                discussions, and share reactions — a social space built around books.
              </p>
              <ul className="space-y-3 text-white/80">
                {[
                  'Create clubs with a shared reading list',
                  'Threaded discussions per book or topic',
                  'Invite friends with a private invite link',
                  'Like and reply to discussion posts',
                  'Manage members with moderator roles',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Hives feature */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 text-[#FFC300]">
                <Hexagon className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">Writing Hives</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Communities built around writing
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Hives are genre- or theme-based communities where writers and readers gather.
                Share writing prompts, give feedback, and celebrate each other&apos;s work in
                a space that fits your niche.
              </p>
              <ul className="space-y-3 text-white/80">
                {[
                  'Organized by genre, theme, or writing style',
                  'Open or members-only hives',
                  'Post writing prompts to inspire the community',
                  'Share your books inside relevant hives',
                  'Discover hives that match your interests',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FFC300]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-[#FFC300]" />
                <span className="font-semibold text-white mainFont">Fantasy Writers Hive</span>
              </div>
              <div className="space-y-2 mb-4">
                {['Epic Fantasy', 'Dark Fantasy', 'High Fantasy'].map((tag) => (
                  <span
                    key={tag}
                    className="mr-2 inline-block rounded-full bg-[#FFC300]/10 px-3 py-1 text-xs text-[#FFC300] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                A community for lovers of all things fantasy — from sprawling epics to intimate
                magical realism. Share your work, get feedback, and find your readers.
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-white/80">
                <span>142 members</span>
                <span>·</span>
                <span>38 books shared</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Lists + Prompts — two-up */}
      <section className="px-6 py-20 bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mainFont mb-3">Even more ways to engage</h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Curate your reading, spark creativity, and stay inspired every day.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Reading Lists */}
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
                  <List className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold mainFont">Reading Lists</h3>
              </div>
              <p className="text-white/80 leading-relaxed mb-5">
                Curate collections of books you love, want to read, or recommend to others.
                Share your lists publicly or keep them for personal reference.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                {[
                  'Add any book on Beehive to a list',
                  'Public or private lists',
                  'Share curated lists with the community',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Prompts */}
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1e1e1e] p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mainFont">Writing Prompts</h3>
              </div>
              <p className="text-white/80 leading-relaxed mb-5">
                Browse community writing prompts, submit your own story entries, and read
                how others interpreted the same spark of an idea.
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                {[
                  'Create and share prompts with the community',
                  'Submit written entries to any prompt',
                  'Like and comment on entries',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-center gap-2 text-[#FFC300]">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="mb-4 text-4xl font-bold mainFont">
            Ready to find your hive?
          </h2>
          <p className="mb-10 text-white/80 leading-relaxed">
            Join Beehive Books today — it&apos;s free. Write your first chapter, discover a
            reading community, or explore thousands of stories from writers just like you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-xl bg-[#FFC300] px-10 py-4 text-base font-bold text-black hover:bg-[#FFD040] transition-colors"
            >
              Create your free account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="text-sm text-white/80 hover:text-white transition-colors underline underline-offset-4"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] px-6 py-8 text-center">
        <p className="text-sm text-white/80">
          © {new Date().getFullYear()} Beehive Books. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
