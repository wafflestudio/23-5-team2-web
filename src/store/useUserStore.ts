// store/useUserStore.ts
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
  isLoading: true, // 초기값은 true

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      // 토큰이 쿠키에 있으므로, 그냥 getMe()를 호출하면 브라우저가 쿠키를 실어 보냅니다.
      const { data } = await authApi.getMe();
      set({ user: data, isLoading: false });
    } catch (error) {
      console.error('유저 정보 가져오기 실패:', error);
      set({ user: null, isLoading: false });
    }
  },

  clearUser: () => set({ user: null, isLoading: false }),
}));
