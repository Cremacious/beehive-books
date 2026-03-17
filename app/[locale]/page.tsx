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
  MessageSquare,
  Eye,
  Clock,
  CheckCheck,
  TrendingUp,
  Zap,
  BookMarked,
  Crown,
} from 'lucide-react';
import logoImage from '@/public/logo3.png';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <section className="px-6 pt-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,195,0,0.08),transparent)]" />
        <div className="mx-auto max-w-3xl relative">
          <Image
            src={logoImage}
            alt="Beehive Books Logo"
            className="mx-auto mb-8"
            width={600}
            height={200}
          />
          <h1 className="mb-6 text-4xl font-bold mainFont">
            Get <span className='text-yellow-500'>buzzed</span> about writing!
          </h1>
          <p className="mb-10 text-lg text-white/80 leading-relaxed max-w-3xl mx-auto">
            Beehive Books is your creative writing home! Post your writing, join
            editing groups, read together in book clubs, and connect with readers
            who love the same stories you do.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button className="w-full md:w-auto" asChild size="lg">
              <Link href="/sign-up">
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              className="w-full md:w-auto"
              asChild
              variant="outline"
              size="lg"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-[#2a2a2a] bg-[#1a1a1a] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {[
              {
                icon: BookOpen,
                label: 'Personal Library',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
              },
              {
                icon: Hexagon,
                label: 'Writing Hives',
                color: 'text-[#FFC300]',
                bg: 'bg-[#FFC300]/10',
              },
              {
                icon: Users,
                label: 'Book Clubs',
                color: 'text-orange-400',
                bg: 'bg-orange-400/10',
              },
              {
                icon: List,
                label: 'Reading Lists',
                color: 'text-emerald-400',
                bg: 'bg-emerald-400/10',
              },
              {
                icon: Lightbulb,
                label: 'Writing Prompts',
                color: 'text-purple-400',
                bg: 'bg-purple-400/10',
              },
            ].map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className="flex flex-col items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-sm font-medium text-white/80">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Your personal writing library
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Publish books chapter by chapter, organize chapters into
                collections, write author notes, and share your work with the
                world or keep it private until you&apos;re ready.
              </p>
              <ul className="space-y-3 text-white/80">
                {[
                  'Rich text editor for easy formatting',
                  'Upload chapters directly from .docx files',
                  'Organize chapters into named collections',
                  'Public, friends-only, or private privacy settings',
                  'Readers can comment and like individual chapters',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden shadow-xl">
              <div className="h-0.5 w-full bg-linear-to-r from-blue-500 via-indigo-400 to-blue-500" />

              <div className="relative h-28 bg-linear-to-br from-blue-900/60 via-indigo-900/40 to-[#1c1c1c] px-5 pt-4 pb-0 flex flex-col justify-end">
                <div className="absolute inset-0 bg-linear-to-t from-[#1c1c1c] to-transparent" />
                <div className="relative flex items-end justify-between pb-3">
                  <div>
                    <h3 className="font-bold text-white text-lg mainFont leading-tight">
                      The Gilded Shore
                    </h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      by Eleanor Voss
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-2.5 flex gap-2 flex-wrap border-b border-[#2a2a2a]">
                {['Fantasy', 'Adventure'].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-400/10 px-2.5 py-0.5 text-[11px] text-blue-300 font-medium"
                  >
                    {tag}
                  </span>
                ))}
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-white/80 font-medium">
                  12 chapters · 24k words
                </span>
              </div>

              <div className="divide-y divide-[#2a2a2a]">
                {[
                  { title: 'Prologue', read: true, likes: 128, comments: 34 },
                  {
                    title: 'Chapter 1 — The Awakening',
                    read: true,
                    likes: 247,
                    comments: 61,
                  },
                  {
                    title: 'Chapter 2 — Beneath the Waves',
                    read: false,
                    likes: 89,
                    comments: 12,
                  },
                  { title: 'Chapter 3 — The Old King', draft: true },
                ].map(({ title, read, likes, comments, draft }) => (
                  <div
                    key={title}
                    className={`flex items-center justify-between px-5 py-3 ${draft ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`text-sm truncate ${read ? 'text-white/80' : 'text-white/80'}`}
                      >
                        {title}
                      </span>
                    </div>
                    {!draft && (
                      <div className="flex items-center gap-3 text-sm text-white/80 shrink-0 ml-3">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {comments}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-[#2a2a2a] flex items-center gap-4 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <PenLine className="w-3 h-3" /> 12 chapters
                </span>
                <span>24k words</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden shadow-xl">
              <div className="h-0.5 w-full bg-[#FFC300]" />

              <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFC300]/10 flex items-center justify-center">
                    <Hexagon className="w-5 h-5 text-[#FFC300]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mainFont">
                      The Gilded Shore Hive
                    </p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Private · 4 Members
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 text-[#FFC300] bg-[#FFC300]/10">
                  <Crown className="w-3 h-3" /> Owner
                </span>
              </div>

              <div className="px-5 py-3 border-b border-[#2a2a2a] flex items-center gap-3 bg-[#FFC300]/5">
                <BookOpen className="w-4 h-4 text-[#FFC300] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">
                    Linked Book
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    The Gilded Shore
                  </p>
                </div>
                <span className="text-sm text-white/80">Eleanor Voss</span>
              </div>

              <div className="px-5 py-3 border-b border-[#2a2a2a] grid grid-cols-4 gap-2">
                {[
                  {
                    icon: List,
                    label: 'Outline',
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-400/10',
                  },
                  {
                    icon: BookOpen,
                    label: 'Wiki',
                    color: 'text-sky-400',
                    bg: 'bg-sky-400/10',
                  },
                  {
                    icon: MessageSquare,
                    label: 'Annotations',
                    color: 'text-pink-400',
                    bg: 'bg-pink-400/10',
                  },
                  {
                    icon: Zap,
                    label: 'Buzz Board',
                    color: 'text-violet-400',
                    bg: 'bg-violet-400/10',
                  },
                ].map(({ icon: Icon, label, color, bg }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-1.5 rounded-xl ${bg} py-2.5`}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className={`text-[10px] font-medium ${color}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-4 divide-y divide-[#2a2a2a]">
                {[
                  {
                    initials: 'AV',
                    bg: 'bg-purple-600',
                    icon: TrendingUp,
                    iconColor: 'text-emerald-400',
                    iconBg: 'bg-emerald-400/10',
                    text: 'AriaV logged 1,240 words',
                    time: '12m ago',
                  },
                  {
                    initials: 'MK',
                    bg: 'bg-blue-600',
                    icon: BookOpen,
                    iconColor: 'text-sky-400',
                    iconBg: 'bg-sky-400/10',
                    text: 'MarcK added "The Thornwood" to the world wiki',
                    time: '1h ago',
                  },
                  {
                    initials: 'SR',
                    bg: 'bg-emerald-700',
                    icon: MessageSquare,
                    iconColor: 'text-pink-400',
                    iconBg: 'bg-pink-400/10',
                    text: 'SophR left an annotation on Chapter 3',
                    time: '2h ago',
                  },
                  {
                    initials: 'TL',
                    bg: 'bg-rose-600',
                    icon: BookMarked,
                    iconColor: 'text-orange-400',
                    iconBg: 'bg-orange-400/10',
                    text: 'TaraL added "Act 3" to the outline',
                    time: '3h ago',
                  },
                ].map(
                  ({
                    initials,
                    bg,
                    icon: Icon,
                    iconColor,
                    iconBg,
                    text,
                    time,
                  }) => (
                    <div
                      key={initials}
                      className="flex items-start gap-3 py-2.5"
                    >
                      <div className="relative shrink-0">
                        <div
                          className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center text-[10px] font-bold text-white`}
                        >
                          {initials}
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${iconBg} ring-2 ring-[#1c1c1c]`}
                        >
                          <Icon className={`w-2.5 h-2.5 ${iconColor}`} />
                        </div>
                      </div>
                      <p className="text-sm text-white/80 leading-snug flex-1">
                        {text}
                      </p>
                      <span className="text-xs text-white/80 shrink-0 mt-0.5">
                        {time}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Build your next novel with your crew
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                A Hive links your friends to one of your books so you can edit
                it together. Like bees building a hive, every collaborator
                contributes by leaving annotations, filling out the world wiki,
                and keeping each other on track.
              </p>
              <ul className="space-y-3 text-white/80">
                {[
                  'Link any book in your library to a hive',
                  'Outline board to plan your story structure',
                  'World wiki for characters, lore, and locations',
                  'Annotations for precise peer feedback',
                  'Word goals with daily, weekly, and even monthly progress',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFC300]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Read and discuss together
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Create or join book clubs with friends. Pick what you&apos;re
                reading next, hold discussions, and share your thoughts in a
                space built for readers who want to connect over the books they
                love.
              </p>
              <ul className="space-y-3 text-white/80">
                {[
                  'Create clubs with a shared reading list',
                  'Threaded discussions per book or topic',
                  'Like and reply to discussion posts',
                  'Pinned announcements from club admins',
                  'Manage members with moderator roles',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden shadow-xl">
              <div className="h-0.5 w-full bg-linear-to-r from-orange-500 to-amber-400" />
              <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white mainFont">
                      Fantasy Readers
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-orange-400 bg-orange-400/10 rounded-full px-2.5 py-1">
                  Active
                </span>
              </div>
              <div className="px-5 py-3 border-b border-[#2a2a2a] flex items-center gap-3 bg-orange-400/5">
                <BookOpen className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">
                    Now Reading
                  </p>
                  <p className="text-sm text-white font-medium">
                    A Court of Thorns and Roses
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">
                    Progress
                  </p>
                  <p className="text-sm text-orange-400 font-semibold">
                    Page 180 / 300
                  </p>
                </div>
              </div>
              <div className="divide-y divide-[#2a2a2a]">
                {[
                  {
                    initials: 'SM',
                    bg: 'bg-rose-600',
                    name: 'Sarah M.',
                    text: '"The ending of chapter 5 absolutely destroyed me. Can we talk about it?"',
                    likes: 8,
                    replies: 12,
                    pinned: false,
                  },
                  {
                    initials: 'JK',
                    bg: 'bg-blue-600',
                    name: 'James K.',
                    text: '"Who else thinks the magic system is totally underexplained so far?"',
                    likes: 5,
                    replies: 7,
                    pinned: false,
                  },
                  {
                    initials: 'RP',
                    bg: 'bg-[#FFC300]',
                    name: 'Admin',
                    text: '"I added some more books to our reading list! Check them out and vote for what we should read next."',
                    likes: 11,
                    replies: 3,
                    pinned: true,
                  },
                ].map(
                  ({ initials, bg, name, text, likes, replies, pinned }) => (
                    <div
                      key={name}
                      className="px-5 py-3 flex items-start gap-3"
                    >
                      <div
                        className={`w-7 h-7 shrink-0 rounded-full ${bg} flex items-center justify-center text-[10px] font-bold ${bg === 'bg-[#FFC300]' ? 'text-black' : 'text-white'}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-white">
                            {name}
                          </span>
                          {pinned && (
                            <span className="text-[10px] text-[#FFC300] bg-[#FFC300]/10 rounded px-1.5 py-0.5">
                              📌 Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/80 leading-snug">
                          {text}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-white/80">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {replies} replies
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mainFont mb-3">
              Even more ways to engage
            </h2>
            <p className="text-white/80 max-w-xl mx-auto">
              Curate your reading, spark creativity, and stay inspired every
              day.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] p-8">
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-lg font-bold mainFont">Reading Lists</h3>
              </div>
              <p className="text-white/80 leading-relaxed mb-5">
                Curate collections of books you love, want to read, or recommend
                to others. Share your lists publicly or keep them for personal
                reference.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  { title: 'A Memory Called Empire', author: 'Arkady Martine' },
                  { title: 'The Name of the Wind', author: 'Patrick Rothfuss' },
                  { title: 'Piranesi', author: 'Susanna Clarke' },
                ].map(({ title, author }) => (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-lg bg-[#252525] px-3 py-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white/80 truncate">{title}</p>
                      <p className="text-[11px] text-white/80">{author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] p-8">
              <div className="mb-2 flex items-center gap-3">
                <h3 className="text-lg font-bold mainFont">Writing Prompts</h3>
              </div>
              <p className="text-white/80 leading-relaxed mb-5">
                Browse community writing prompts, submit your own story entries,
                and read how others interpreted the same spark of an idea.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  {
                    prompt:
                      '"Write a scene where time stops — except for one person."',
                    entries: 23,
                  },
                  {
                    prompt:
                      '"A letter found in a book returned to the library 30 years later."',
                    entries: 14,
                  },
                  {
                    prompt:
                      '"Write a story that starts with the line: "The last thing I expected to find in the attic was..."',
                    entries: 8,
                  },
                ].map(({ prompt, entries }) => (
                  <div
                    key={prompt}
                    className="rounded-lg bg-[#252525] px-3 py-2.5"
                  >
                    <p className="text-sm text-white/80 leading-snug italic">
                      {prompt}
                    </p>
                    <p className="text-[11px] text-purple-400/70 mt-1">
                      {entries} entries
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,195,0,0.06),transparent)]" />
        <div className="mx-auto max-w-2xl relative">
      
          <h2 className="mb-4 text-4xl font-bold mainFont">
            Ready to find your hive?
          </h2>
          <p className="mb-10 text-lg text-white/80 leading-relaxed">
            Join Beehive Books today! It&apos;s free! Write your first chapter,
            discover a reading community, or explore thousands of stories from
            writers just like you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Create your free account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">Already have an account? Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2a2a2a] px-6 py-8 text-center">
        <p className="text-sm text-white/80">
          © {new Date().getFullYear()} Beehive Books. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
