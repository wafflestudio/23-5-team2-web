// src/apis/auth.ts
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

  // 내 정보 확인 (getMe)
  getMe: () => api.get<User>(API_ENDPOINTS.AUTH.ME),

  /**
   * 마이페이지 기능을 위한 추가 API
   * 아래 경로는 백엔드 API 명세서에 따라 수정이 필요할 수 있습니다.
   */

  // 유저 아이디 변경
  updateUserId: (data: { userId: string }) => api.patch('/auth/user/id', data),

  // 비밀번호 변경
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/user/password', data),

  /**
   * 회원 탈퇴 API
   * 보통 본인 계정 삭제는 별도의 인자 없이
   * 서버가 쿠키/토큰을 통해 누구인지 식별하여 처리합니다.
   */
  deleteAccount: () => api.delete('/auth/user'), // 백엔드 명세에 따라 '/auth/me' 등으로 바뀔 수 있습니다.
};
