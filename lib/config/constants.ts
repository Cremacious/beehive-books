export const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Poetry',
  'Memoir',
  'Biography',
  'Self-Help',
  'Academic',
  'Other',
];

export const GENRES = [
  'Mystery',
  'Romance',
  'Science Fiction',
  'Fantasy',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Contemporary',
  'Literary Fiction',
  'Young Adult',
  'Children',
  'Other',
];

export const PRIVACY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', description: 'Anyone can read' },
  { value: 'PRIVATE', label: 'Private', description: 'Only you' },
  { value: 'FRIENDS', label: 'Friends Only', description: 'You + friends' },
] as const;