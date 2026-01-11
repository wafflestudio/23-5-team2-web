// constants/api.ts
const BACKEND_URL = 'https://waffle.tteokgook1.net';

export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${BACKEND_URL}/oauth2/authorization/google`,
    REGISTER: '/api/v1/auth/register/local',
    LOGIN: '/api/v1/auth/login/local',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/users/me',
  },
} as const;

export const SYSTEM_ENDPOINTS = {
  HEALTH: '/actuator/health', // 상대 경로로 작성하여 프록시 유도
} as const;
