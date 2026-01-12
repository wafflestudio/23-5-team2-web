// src/constants/api.ts

// 1. 비즈니스 로직은 서버와 '직통'으로 대화합니다. (구글/로컬 로그인용)
const BACKEND_URL = 'https://waffle.tteokgook1.net';
export const API_BASE_URL = `${BACKEND_URL}/api`;

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${BACKEND_URL}/oauth2/authorization/google`,
    REGISTER: `${API_BASE_URL}/v1/auth/register/local`,
    LOGIN: `${API_BASE_URL}/v1/auth/login/local`,
    LOGOUT: `${API_BASE_URL}/v1/auth/logout`,
  },
  USER: {
    ME: `${API_BASE_URL}/v1/users/me`,
  },
  CRAWLER: {
    GET_STATUS: `${API_BASE_URL}/crawlers`,
  },
} as const;

// 2. 헬스 체크만 '프록시'를 타도록 상대 경로로 둡니다. (CORS 해결용)
export const SYSTEM_ENDPOINTS = {
  HEALTH: '/actuator/health',
} as const;
