export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'CHAPTER_COMMENT'
  | 'COMMENT_REPLY'
  | 'COMMENT_LIKE'
  | 'PROMPT_INVITE'
  | 'PROMPT_ENTRY'
  | 'PROMPT_ENDED'
  | 'ENTRY_COMMENT'
  | 'ENTRY_COMMENT_LIKE'
  | 'CLUB_INVITE'
  | 'CLUB_DISCUSSION'
  | 'CLUB_REPLY'
  | 'HIVE_INVITE'
  | 'HIVE_CHAPTER_CLAIMED'
  | 'HIVE_SPRINT_STARTED'
  | 'HIVE_MILESTONE'
  | 'HIVE_COMMENT'
  | 'HIVE_POLL'
  | 'HIVE_BETA_REVIEW'
  | 'HIVE_INVITE_PENDING'
  | 'HIVE_ACTIVITY';

export type NotificationItem = {
  id:        string;
  type:      NotificationType;
  isRead:    boolean;
  link:      string;
  metadata:  Record<string, string>;
  createdAt: Date;
  actor: { username: string | null; imageUrl: string | null } | null;
};
