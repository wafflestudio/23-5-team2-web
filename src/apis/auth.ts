// apis/auth.ts
import { API_ENDPOINTS } from '../constants/api';
import type { AuthRequest, User } from '../types/auth';
import { api } from './instance';

export const authApi = {
  // 로컬 회원가입
  registerLocal: (data: AuthRequest) =>
    api.post<User>(API_ENDPOINTS.AUTH.REGISTER, data),

  // 로컬 로그인
  // 백엔드가 성공 시 브라우저 쿠키(Set-Cookie)에 토큰을 직접 심어주므로,
  // 프론트엔드에서는 응답 바디에서 토큰을 꺼내 저장할 필요가 없습니다.
  loginLocal: (data: AuthRequest) => api.post(API_ENDPOINTS.AUTH.LOGIN, data),

  // 로그아웃
  // 서버에 로그아웃 요청을 보내면, 서버가 쿠키를 만료(expire)시켜 브라우저에서 제거합니다.
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  // 내 정보 확인
  // instance.ts에 withCredentials: true 설정이 되어있다면,
  // 브라우저가 자동으로 쿠키를 헤더에 실어 보냅니다.
  getMe: () => api.get<User>(API_ENDPOINTS.AUTH.ME),
};
