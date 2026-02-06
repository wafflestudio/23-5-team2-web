import { type Article } from './article';

export interface InboxItem {
  id: number;
  userId: number;
  article: Article;
  isRead: boolean;
  createdAt: string;
}

export interface InboxResponse {
  inboxes: InboxItem[];
  paging: {
    hasNext: boolean;
  };
}
