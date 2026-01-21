// types/article.ts
import type { Board } from './board';

export interface Article {
  id: number;
  board: Board;
  title: string;
  content: string;
  author: string;
  originLink: string;
  publishedAt: string; // ISO8601
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  bookmarkId?: number; // For bookmark management
  isInbox?: boolean; // For differentiating Feed vs Inbox items
}

interface ArticlePaging {
  nextPublishedAt: number;
  nextId: number;
  hasNext: boolean;
}

export interface ArticleListResponse {
  data: Article[];
  paging: ArticlePaging;
}

export interface ArticleFilterParams {
  boardids?: string; // comma-separated IDs
  keyword?: string;
  nextPublishedAt?: number;
  nextId?: number;
  limit?: number;
}
