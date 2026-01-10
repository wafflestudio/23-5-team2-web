export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `/oauth2/authorization/google`,
    ME: `/auth/me`,
    REGISTER: `/auth/register/local`,
    LOGIN: '/auth/login/local',
  },
  POSTS: `/posts`,
} as const; // 이 값을 읽기 전용(ReadOnly)으로 고정합니다.
