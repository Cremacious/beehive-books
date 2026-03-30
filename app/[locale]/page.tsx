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
        <div className="absolute inset-0 opacity-[0.04]" />
        <div className="mx-auto max-w-3xl relative">
          <Image
            src={logoImage}
            alt="Beehive Books Logo"
            className="mx-auto mb-8"
            width={600}
            height={200}
          />
          <h1 className="mb-6 text-4xl font-bold mainFont">
            Get <span className="text-yellow-500">buzzed</span> about writing!
          </h1>
          <p className="mb-10 text-lg text-white/80 leading-relaxed max-w-3xl mx-auto">
            Write your story. Collaborate with other writers. Share it with the
            world. More than a text editor, Beehive Books is where books get
            made.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button className="w-full md:w-auto" asChild size="lg">
              <Link href="/sign-up">
                Create your account
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              className="w-full md:w-auto"
              asChild
              variant="outline"
              size="lg"
            >
              <Link href="/explore">Explore stories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* <section className="border-y border-[#2a2a2a] bg-[#1a1a1a] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            {[
              {
                icon: BookOpen,
                label: 'Personal Library',
                color: 'text-[#FFC300]',
                bg: 'bg-[#FFC300]/10',
              },
              {
                icon: Hexagon,
                label: 'Writing Hives',
                color: 'text-blue-400',
                bg: 'bg-blue-400/10',
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
            ].map(({ icon: Icon, label, color, bg }, i) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-2.5 ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
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
      </section> */}

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Your book, the way you{' '}
                <span className="text-[#FFC300]">imagined</span> it.
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                A real writing environment built for long-form work. Organize
                your story into chapters and collections, track your word count,
                and export finished work to EPUB, DOCX, or PDF. No distractions.
                No compromises.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  'Rich text editor',
                  'Chapter collections',
                  'EPUB export',
                  'Privacy controls',
                ].map((f) => (
                  <span
                    key={f}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#2a2a2a] text-white/70 font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] overflow-hidden shadow-xl">
              <div className="h-0.5 w-full bg-[#FFC300]" />

              <div className="relative h-28 bg-linear-to-br from-[#3d2e00]/60 via-[#2a1e00]/40 to-[#1c1c1c] px-5 pt-4 pb-0 flex flex-col justify-end">
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
                    className="rounded-full bg-[#FFC300]/10 px-2.5 py-0.5 text-[11px] text-[#FFC300] font-medium"
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
                    title: 'Chapter 1: The Awakening',
                    read: true,
                    likes: 247,
                    comments: 61,
                  },
                  {
                    title: 'Chapter 2: Beneath the Waves',
                    read: false,
                    likes: 89,
                    comments: 12,
                  },
                  { title: 'Chapter 3: The Old King', draft: true },
                ].map(({ title, read, comments, draft }) => (
                  <div
                    key={title}
                    className={`flex items-center justify-between px-5 py-3 `}
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
              <div className="h-0.5 w-full bg-blue-400" />

              <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center">
                    <Hexagon className="w-5 h-5 text-blue-400" />
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
                <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 text-blue-400 bg-blue-400/10">
                  <Crown className="w-3 h-3" /> Owner
                </span>
              </div>

              <div className="px-5 py-3 border-b border-[#2a2a2a] flex items-center gap-3 bg-blue-400/5">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
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
                    icon: TrendingUp,
                    iconColor: 'text-emerald-400',
                    iconBg: 'bg-emerald-400/10',
                    text: 'AriaV logged 1,240 words',
                    time: '12m ago',
                  },
                  {
                    initials: 'MK',
                    icon: BookOpen,
                    iconColor: 'text-sky-400',
                    iconBg: 'bg-sky-400/10',
                    text: 'MarcK added "The Thornwood" to the world wiki',
                    time: '1h ago',
                  },
                  {
                    initials: 'SR',
                    icon: MessageSquare,
                    iconColor: 'text-pink-400',
                    iconBg: 'bg-pink-400/10',
                    text: 'SophR left an annotation on Chapter 3',
                    time: '2h ago',
                  },
                  {
                    initials: 'TL',
                    icon: BookMarked,
                    iconColor: 'text-orange-400',
                    iconBg: 'bg-orange-400/10',
                    text: 'TaraL added "Act 3" to the outline',
                    time: '3h ago',
                  },
                ].map(
                  ({ initials, icon: Icon, iconColor, iconBg, text, time }) => (
                    <div
                      key={initials}
                      className="flex items-start gap-3 py-2.5"
                    >
                      <div className="relative shrink-0">
                        <div className="w-7 h-7 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 text-[10px] font-bold text-[#FFC300]">
                          {initials}
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
                Writing is better{' '}
                <span className="text-[#FFC300]">together</span>.
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Your Hive is your book&apos;s command center. Invite co-authors,
                beta readers, and editors to annotate specific passages, propose
                rewrites you can accept or reject, and submit chapters for
                approval. Plan your story on the outline board, build your world
                in the wiki, track progress with shared word goals, and more!
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  'Co-author tools',
                  'Annotations',
                  'World wiki',
                  'Word goals',
                  'Outline board',
                ].map((f) => (
                  <span
                    key={f}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#2a2a2a] text-white/70 font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-4 text-3xl font-bold mainFont">
                Read More. Discuss{' '}
                <span className="text-[#FFC300]">everything</span>.
              </h2>
              <p className="mb-6 text-white/80 leading-relaxed">
                Reading alone is fine. Reading with people who actually want to
                talk about it is better. Join a book club to track progress
                together and discuss chapters as you go. Find your people in the
                community or start your own club.
              </p>
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
                    name: 'Sarah M.',
                    text: '"The ending of chapter 5 absolutely destroyed me. Can we talk about it?"',
                    likes: 8,
                    replies: 12,
                    pinned: false,
                  },
                  {
                    initials: 'JK',
                    name: 'James K.',
                    text: '"Who else thinks the magic system is totally underexplained so far?"',
                    likes: 5,
                    replies: 7,
                    pinned: false,
                  },
                  {
                    initials: 'RP',
                    name: 'Admin',
                    text: '"I added some more books to our reading list! Check them out and vote for what we should read next."',
                    likes: 11,
                    replies: 3,
                    pinned: true,
                  },
                ].map(({ initials, name, text, likes, replies, pinned }) => (
                  <div key={name} className="px-5 py-3 flex items-start gap-3">
                    <div className="w-7 h-7 shrink-0 rounded-full bg-[#FFC300]/15 flex items-center justify-center ring-2 ring-[#FFC300]/20 text-[10px] font-bold text-[#FFC300]">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white">
                          {name}
                        </span>
                        {pinned && (
                          <span className="text-[10px] text-[#FFC300] bg-[#FFC300]/10 rounded px-1.5 py-0.5">
                            Pinned
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
                ))}
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
                <h3 className="text-xl font-bold mainFont text-yellow-500">
                  Your shelves, your way.
                </h3>
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
                <h3 className="text-xl font-bold mainFont text-yellow-500">
                  A spark when you need one.
                </h3>
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
            Join the writers already building on Beehive Books.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#2a2a2a] px-6 py-8 text-center">
        <p className="text-sm text-white/80">
          © {new Date().getFullYear()} Beehive Books. All rights reserved.
        </p>
        <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 mt-3">
          <Link
            href="/terms"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/dmca"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            DMCA
          </Link>
          <Link
            href="/cookies"
            className="text-sm text-white/80 hover:text-white transition-colors"
          >
            Cookies
          </Link>
        </div>
      </footer>
    </div>
  );
}
