export type NotificationType = {
  id: string;
  type: string;
  message: string;
  date: string;
  read: boolean;
  sender?: string;
  chapterTitle?: string;
};
