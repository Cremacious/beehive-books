import type {
  Book,
  Chapter,
  Collection,
  ChapterNav,
} from '@/lib/types/books.types';

export const SAMPLE_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Silent Garden',
    author: 'Sarah Mitchell',
    genre: 'Literary Fiction',
    category: 'Fiction',
    description:
      "A story about silence, loss, and finding beauty in unexpected places. When Maya returns to her grandmother's abandoned garden after ten years away, she discovers not just overgrown roses but buried secrets that will change everything she thought she knew about her family.",
    privacy: 'PUBLIC',
    explorable: true,
    draftStatus: 'COMPLETED',
    wordCount: 45230,
    commentCount: 28,
    chapterCount: 6,
    likeCount: 0,
    coverUrl: null,
  },
  {
    id: '2',
    title: 'Starfall Chronicles',
    author: 'Sarah Mitchell',
    genre: 'Science Fiction',
    category: 'Fiction',
    description:
      'An epic journey across dying star systems as the last cartographers of the universe race to map what remains before the lights go out forever.',
    privacy: 'PUBLIC',
    explorable: true,
    draftStatus: 'SECOND_DRAFT',
    wordCount: 31500,
    commentCount: 14,
    chapterCount: 7,
    likeCount: 0,
    coverUrl: null,
  },
  {
    id: '3',
    title: 'Letters Unsent',
    author: 'Sarah Mitchell',
    genre: 'Romance',
    category: 'Fiction',
    description:
      'Twenty-four letters written over twenty years — none of them ever mailed. A quiet love story told entirely through what was never said.',
    privacy: 'FRIENDS',
    explorable: false,
    draftStatus: 'COMPLETED',
    wordCount: 68400,
    commentCount: 57,
    chapterCount: 24,
    coverUrl: null,
  },
  {
    id: '4',
    title: 'The Amber Road',
    author: 'Sarah Mitchell',
    genre: 'Fantasy',
    category: 'Fiction',
    description:
      'A merchant following an ancient trade route discovers that the amber she carries contains something alive — and very old.',
    privacy: 'PRIVATE',
    explorable: false,
    draftStatus: 'FIRST_DRAFT',
    wordCount: 9200,
    commentCount: 0,
    chapterCount: 3,
    coverUrl: null,
  },
  {
    id: '5',
    title: 'Midnight Confessions',
    author: 'Sarah Mitchell',
    genre: 'Thriller',
    category: 'Fiction',
    description:
      "A late-night radio host receives a call from someone who claims to have witnessed a murder — eighteen years ago, in the host's own home.",
    privacy: 'PUBLIC',
    explorable: true,
    draftStatus: 'THIRD_DRAFT',
    wordCount: 52700,
    commentCount: 41,
    chapterCount: 18,
    coverUrl: null,
  },
  {
    id: '6',
    title: 'Notes on Silence',
    author: 'Sarah Mitchell',
    genre: 'Contemporary',
    category: 'Non-Fiction',
    description:
      'A memoir-in-essays exploring what it means to choose quiet in a world that rewards noise.',
    privacy: 'PUBLIC',
    explorable: false,
    draftStatus: 'SECOND_DRAFT',
    wordCount: 28900,
    commentCount: 22,
    chapterCount: 9,
    coverUrl: null,
  },
];

export const SAMPLE_CHAPTERS: Chapter[] = [
  {
    id: 'ch1',
    bookId: '1',
    title: 'The Return',
    wordCount: 3420,
    order: 1,
    collectionId: null,
    authorNotes: null,
    content: null,
  },
  {
    id: 'ch2',
    bookId: '1',
    title: 'First Light',
    wordCount: 2890,
    order: 2,
    collectionId: null,
    authorNotes: null,
    content: null,
  },
  {
    id: 'ch3',
    bookId: '1',
    title: 'Old Letters',
    wordCount: 4100,
    order: 3,
    collectionId: 'col1',
    authorNotes:
      "This chapter was the hardest to write. Maya's discovery of the letters felt very personal to me — I've kept letters from my own grandmother that I've never read. I hope you feel the weight of that moment.",
    content: `
      <p>The attic smelled of cedar and forgotten decades. Maya pressed her palm against the low door and felt it give, the old wood swollen with summer humidity, resistant yet somehow eager to be opened.</p>
      <p>Inside, light arrived in thin bars through the gable vent, painting gold stripes across cardboard boxes and sheet-covered furniture. Her grandmother had kept everything. Maya had always known this — had grown up watching Nana refuse to throw away a single birthday card, a single theatre programme, a single ribbon from a Christmas past.</p>
      <p>The letters were in a shoebox on the third shelf. She almost missed them. They were tied with kitchen twine, the knot so old it had fused into something permanent, something that wasn't meant to be undone.</p>
      <p>She sat on the dusty floor and read the first one by the slanted light.</p>
      <p><em>Dearest Evelyn — I know you won't reply. I'm writing anyway because silence answers nothing, and I have had enough silence to last me into the next world and back.</em></p>
      <p>Maya turned the envelope over. No return address. Postmarked 1962.</p>
      <p>She read it three times before she noticed her hands were shaking.</p>
    `,
  },
  {
    id: 'ch4',
    bookId: '1',
    title: 'The Photograph',
    wordCount: 3600,
    order: 4,
    collectionId: 'col1',
    authorNotes: null,
    content: null,
  },
  {
    id: 'ch5',
    bookId: '1',
    title: 'A Name Unspoken',
    wordCount: 5200,
    order: 5,
    collectionId: 'col1',
    authorNotes: null,
    content: null,
  },
  {
    id: 'ch6',
    bookId: '1',
    title: 'Roots',
    wordCount: 2750,
    order: 6,
    collectionId: null,
    authorNotes: null,
    content: null,
  },
];

export const SAMPLE_COLLECTIONS: Collection[] = [
  { id: 'col1', bookId: '1', name: 'Part Two — Secrets', order: 2 },
];

export const SAMPLE_COMMENTS = [
  {
    id: 'c1',
    chapterId: 'ch3',
    user: {
      name: 'Riley Thompson',
      initials: 'RT',
      colorClass: 'bg-purple-500/20 text-purple-300',
    },
    text: 'The line about silence answering nothing absolutely floored me. This is beautiful writing.',
    likeCount: 14,
    likedByMe: false,
    createdAt: '2h',
    replies: [
      {
        id: 'r1',
        user: {
          name: 'Jordan Lee',
          initials: 'JL',
          colorClass: 'bg-blue-500/20 text-blue-300',
        },
        text: 'Agreed — that line is going to stay with me.',
        likeCount: 3,
        likedByMe: false,
        createdAt: '1h',
      },
    ],
  },
  {
    id: 'c2',
    chapterId: 'ch3',
    user: {
      name: 'Avery Chen',
      initials: 'AC',
      colorClass: 'bg-emerald-500/20 text-emerald-300',
    },
    text: 'I love that the knot "wasn\'t meant to be undone." The detail does so much work. Can\'t wait to read the rest.',
    likeCount: 8,
    likedByMe: true,
    createdAt: '5h',
    replies: [],
  },
];


export function getBooks(): Book[] {
  return SAMPLE_BOOKS;
}

export function getBookById(id: string): Book | undefined {
  return SAMPLE_BOOKS.find((b) => b.id === id);
}

export function getChaptersByBookId(bookId: string): Chapter[] {
  return SAMPLE_CHAPTERS.filter((c) => c.bookId === bookId).sort(
    (a, b) => a.order - b.order,
  );
}

export function getCollectionsByBookId(bookId: string): Collection[] {
  return SAMPLE_COLLECTIONS.filter((c) => c.bookId === bookId).sort(
    (a, b) => a.order - b.order,
  );
}

export function getChapterById(
  bookId: string,
  chapterId: string,
): Chapter | undefined {
  return SAMPLE_CHAPTERS.find((c) => c.bookId === bookId && c.id === chapterId);
}

export function getAdjacentChapters(
  bookId: string,
  chapterId: string,
): { prev: ChapterNav | null; next: ChapterNav | null } {
  const chapters = getChaptersByBookId(bookId);
  const idx = chapters.findIndex((c) => c.id === chapterId);
  return {
    prev: idx > 0 ? chapters[idx - 1] : null,
    next: idx < chapters.length - 1 ? chapters[idx + 1] : null,
  };
}

export function getCommentsByChapterId(chapterId: string) {
  return SAMPLE_COMMENTS.filter((c) => c.chapterId === chapterId);
}
