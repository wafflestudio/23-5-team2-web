import { API_ENDPOINTS } from '../constants/api';
import type { AuthRequest, User } from '../types/auth';
import { api } from './instance';

export const authApi = {
  // 로컬 회원가입
  registerLocal: (data: AuthRequest) =>
    api.post<User>(API_ENDPOINTS.AUTH.REGISTER, data),

  // 로컬 로그인
  loginLocal: (data: AuthRequest) =>
    api.post<User>(API_ENDPOINTS.AUTH.LOGIN, data),

  // 로그아웃
  logout: async () => {
    try {
      // 1. 서버에 로그아웃 알림 (토큰이 헤더에 실려 나감)
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // 서버에서 이미 세션이 만료되었거나 오류가 나더라도 로직은 계속 진행
      console.error('서버 로그아웃 처리 중 오류:', error);
    } finally {
      // 2. 브라우저 청소 (토큰 제거)
      localStorage.removeItem('accessToken'); // 저장된 키값에 맞게 수정
    }
  },

  // 내 정보 확인
  getMe: () => api.get<User>(API_ENDPOINTS.AUTH.ME),
};
