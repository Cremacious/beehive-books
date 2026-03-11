export type PremiumResource = 'books' | 'clubs' | 'hives' | 'readingLists' | 'prompts';

export const PREMIUM_CONFIG = {
  limits: {
    free: {
      books: 1,
      clubs: 1,
      hives: 1,
      readingLists: 1,
      prompts: 1,
    },
    premium: {
      books: 8,
      clubs: 8,
      hives: 8,
      readingLists: 8,
      prompts: 8,
    },
  },
} as const satisfies {
  limits: Record<'free' | 'premium', Record<PremiumResource, number>>;
};
