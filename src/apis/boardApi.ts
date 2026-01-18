import type { Board } from '../types/board';
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

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const response = await api.get<any>('/v1/subscriptions');
  console.log('API Response for subscriptions:', response.data);
  
  if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.subscriptions)) {
    return response.data.subscriptions;
  }
  
  return [];
};

export const subscribeBoard = async (boardId: number): Promise<Subscription> => {
  const response = await api.post('/v1/subscriptions', { boardId });
  return response.data;
};

export const unsubscribeBoard = async (SubscriptionId: number): Promise<void> => {
  await api.delete(`/v1/subscriptions/${SubscriptionId}`);
};
