import type { Article } from '../types/article';
import { api } from './instance';

interface GetInboxesResponse {
  inboxes: Article[];
}

export const getInboxes = async (): Promise<Article[]> => {
  const response = await api.get<GetInboxesResponse>('/v1/inboxes');
  return response.data.inboxes;
};

export const deleteInbox = async (id: number): Promise<void> => {
  await api.delete(`/v1/inboxes/${id}`);
};

export const readInbox = async (id: number): Promise<void> => {
  await api.patch(`/v1/inboxes/${id}`);
};
