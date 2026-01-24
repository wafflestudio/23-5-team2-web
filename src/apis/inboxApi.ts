import type { InboxResponse } from '../types/article';
import { api } from './instance';

export const getInboxes = async (params?: {
  limit?: number;
  nextPublishedAt?: number;
  nextId?: number;
}): Promise<InboxResponse> => {
  const response = await api.get<InboxResponse>('/v1/inboxes', {
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
