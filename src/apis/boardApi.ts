import type { Board } from '../types/board';
import { api } from './instance';

interface GetBoardsResponse {
  boards: Board[];
}

export const getBoards = async (): Promise<Board[]> => {
  const response = await api.get<GetBoardsResponse>('/v1/boards');
  return response.data.boards;
};
