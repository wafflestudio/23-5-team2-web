import type { Article } from '@/types/article';
import { api } from './instance';

// Strict type for Bookmark response
interface BookmarkItem {
  id: number; // bookmarkId
  article: Article;
  createdAt: string;
}

interface BookmarkResponse {
  bookmarks: BookmarkItem[];
}

export const getBookmarks = async (): Promise<
  (Article & { bookmarkId: number })[]
> => {
  const response = await api.get<BookmarkResponse>('/v1/bookmarks');
  const items = response.data.bookmarks;

  return items.map((item) => {
    return {
      ...item.article,
      bookmarkId: item.id,
    };
  });
};

export const addBookmark = async (articleId: number): Promise<void> => {
  // Try sending as query param if body fails? Or both?
  // Usually POST /v1/bookmarks with body { articleId }.
  await api.post('/v1/bookmarks', { articleId });
};

export const removeBookmark = async (bookmarkId: number): Promise<void> => {
  await api.delete(`/v1/bookmarks/${bookmarkId}`);
};
