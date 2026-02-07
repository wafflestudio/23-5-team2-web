import type { Board } from '@/types/board';
import { api } from './instance';

interface GetBoardsResponse {
  boards: Board[];
}

export const getBoards = async (): Promise<Board[]> => {
  const response = await api.get<GetBoardsResponse>('/v1/boards');
  return response.data.boards;
};

export interface Subscription {
  id: number;
  boardId: number;
}

interface GetSubscriptionsResponse {
  subscriptions: Subscription[];
}

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const response = await api.get<GetSubscriptionsResponse>('/v1/subscriptions');
  return response.data.subscriptions;
};

export const subscribeBoard = async (
  boardId: number
): Promise<Subscription> => {
  const response = await api.post('/v1/subscriptions', { boardId });
  return response.data;
};

export const unsubscribeBoard = async (
  subscriptionId: number
): Promise<void> => {
  await api.delete(`/v1/subscriptions/${subscriptionId}`);
};
