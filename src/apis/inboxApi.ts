import type { ArticleListResponse } from '../types/article';
import { api } from './instance';

// Adapted to handle potential backend variations (inboxes vs data)
export const getInboxes = async (params?: {
  limit?: number;
  nextPublishedAt?: number;
  nextId?: number;
}): Promise<ArticleListResponse> => {
  const response = await api.get<any>('/v1/inboxes', {
    params,
  });
  
  // Fallback if backend hasn't updated to match ArticleListResponse
  const data = response.data.data || response.data.inboxes || [];
  const paging = response.data.paging || {
    hasNext: false,
    nextPublishedAt: 0,
    nextId: 0,
  };

  return { data, paging };
};

export const deleteInbox = async (id: number): Promise<void> => {
  await api.delete(`/v1/inboxes/${id}`);
};

export const readInbox = async (id: number): Promise<void> => {
  await api.patch(`/v1/inboxes/${id}`);
};
