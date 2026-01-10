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

  // 내 정보 확인
  getMe: () => api.get<User>(API_ENDPOINTS.AUTH.ME),
};
