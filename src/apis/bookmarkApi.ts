import type { Article } from '../types/article';
import { api } from './instance';

// Helper type for dynamic response handling
type BookmarkItem =
  | {
      article: Article;
      id: number; // bookmarkId
      createdAt: string;
    }
  | Article;

type BookmarkResponse =
  | BookmarkItem[]
  | { bookmarks: BookmarkItem[] }
  | { data: BookmarkItem[] };

export const getBookmarks = async (): Promise<
  (Article & { bookmarkId: number })[]
> => {
  const response = await api.get<BookmarkResponse>('/v1/bookmarks');

  let rawData: BookmarkItem[] = [];

  const data = response.data;
  if (Array.isArray(data)) {
    rawData = data;
  } else if ('bookmarks' in data && Array.isArray(data.bookmarks)) {
    rawData = data.bookmarks;
  } else if ('data' in data && Array.isArray(data.data)) {
    rawData = data.data;
  }

  // Transform: if item has 'article' property, extract it and Attach bookmarkId
  return rawData.map((item) => {
    if ('article' in item && item.article && typeof item.article === 'object') {
      return {
        ...item.article,
        bookmarkId: item.id, // Capture the bookmark ID
      };
    }
    // Fallback: if it's already flat, maybe id is bookmark ID? or Article ID?
    // It's ambiguous. But based on current findings, it's nested.
    // If item is already an Article, we need to ensure it has a bookmarkId.
    // Assuming if it's flat, its 'id' property might be the bookmarkId or it's an Article ID.
    // For consistency, we'll try to assign an 'id' property as bookmarkId if it exists.
    return {
      ...(item as Article),
      bookmarkId: (item as Article).id, // Best guess for bookmarkId if not nested
    };
  }) as (Article & { bookmarkId: number })[];
};

export const addBookmark = async (articleId: number): Promise<void> => {
  // Try sending as query param if body fails? Or both?
  // Usually POST /v1/bookmarks with body { articleId }.
  await api.post('/v1/bookmarks', { articleId });
};

export const removeBookmark = async (bookmarkId: number): Promise<void> => {
  await api.delete(`/v1/bookmarks/${bookmarkId}`);
};
