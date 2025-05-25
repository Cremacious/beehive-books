export const APP_NAME = process.env.APP_NAME || 'Beehive Books';
export const bookSelect = {
  id: true,
  title: true,
  author: true,
  description: true,
  genre: true,
  category: true,
  userId: true,
  chapters: {
    select: {
      id: true,
      title: true,
      content: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};
