export type PremiumResource =
  | 'books'
  | 'clubs'
  | 'hives'
  | 'readingLists'
  | 'prompts';

export const PREMIUM_CONFIG = {
  limits: {
    free: {
      books: 2,
      clubs: 1,
      hives: 1,
      readingLists: 1,
      prompts: 1,
    },
    premium: {
      books: Infinity,
      clubs: Infinity,
      hives: Infinity,
      readingLists: Infinity,
      prompts: Infinity,
    },
  },
} as const satisfies {
  limits: Record<'free' | 'premium', Record<PremiumResource, number>>;
};
