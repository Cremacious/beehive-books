export const queryKeys = {
  books:    ['books'] as const,
  book:     (id: string) => ['books', id] as const,
  chapters: (bookId: string) => ['books', bookId, 'chapters'] as const,
  comments: (chapterId: string) => ['chapters', chapterId, 'comments'] as const,
};
