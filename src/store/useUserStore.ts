import { create } from 'zustand';
import { authApi } from '../apis/auth';
import type { User } from '../types/auth';

interface UserState {
  user: User | null;
  isLoading: boolean;
  // 유저 정보 가져오기 (getMe 활용)
  fetchUser: () => Promise<void>;
  // 로그아웃
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const { data } = await authApi.getMe();
      set({ user: data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  clearUser: () => set({ user: null }),
}));
