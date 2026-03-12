export type PromptUser = {
  id:   string;
  username:  string | null;
  firstName: string | null;
  lastName:  string | null;
  image:  string | null;
};

export type PromptStatus = 'ACTIVE' | 'ENDED';

export type PromptCard = {
  id:             string;
  title:          string;
  description:    string;
  endDate:        Date;
  privacy:        'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  explorable:     boolean;
  status:         PromptStatus;
  entryCount:     number;
  createdAt:      Date;
  creator:        PromptUser;
  myInviteStatus: 'ACCEPTED' | 'PENDING' | null; // null = I am the creator
  myEntryId:      string | null;
};

export type PromptInvite = {
  id:     string;
  status: 'PENDING' | 'ACCEPTED';
  user:   PromptUser;
};

export type PromptDetail = PromptCard & {
  invites: PromptInvite[];
};

export type PromptEntry = {
  id:         string;
  content:    string;
  wordCount:  number;
  likeCount:  number;
  likedByMe:  boolean;
  createdAt:  Date;
  user:       PromptUser;
};

export type EntryReply = {
  id:        string;
  content:   string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: Date;
  user:      PromptUser;
};

export type EntryComment = {
  id:        string;
  content:   string;
  likeCount: number;
  likedByMe: boolean;
  createdAt: Date;
  user:      PromptUser;
  replies:   EntryReply[];
};

export type EntryDetail = PromptEntry & {
  comments: EntryComment[];
};
