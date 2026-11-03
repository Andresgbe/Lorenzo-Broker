interface ForumMessage {
  id: string;
  /** null si la cuenta del autor ya no existe. */
  authorId: string | null;
  authorName: string;
  authorIsAdmin: boolean;
  body: string;
  /** ISO en UTC. */
  createdAt: string;
  editedAt: string | null;
}

export interface ForumThread extends ForumMessage {
  courseId: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  replyCount: number;
  lastPostAt: string;
}

export type ForumPost = ForumMessage;

export interface ThreadPatch {
  title?: string;
  body?: string;
  isPinned?: boolean;
  isLocked?: boolean;
}
