import type { ArticleListResponse } from '../types/article';
import { api } from './instance';

export const getInboxes = async (params?: {
  limit?: number;
  nextPublishedAt?: number;
  nextId?: number;
}): Promise<ArticleListResponse> => {
  const response = await api.get<ArticleListResponse>('/v1/inboxes', {
    params,
  });

  return response.data;
};

export const deleteInbox = async (id: number): Promise<void> => {
  await api.delete(`/v1/inboxes/${id}`);
};

export const readInbox = async (id: number): Promise<void> => {
  await api.patch(`/v1/inboxes/${id}`);
};
