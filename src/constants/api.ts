// 1. 서버 도메인 (기본)
const BACKEND_URL = 'https://waffle.tteokgook1.net';

// 2. 비즈니스 로직 API용 베이스 (버전 포함)
export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${BACKEND_URL}/oauth2/authorization/google`,
    REGISTER: `${API_BASE_URL}/auth/register/local`,
    LOGIN: `${API_BASE_URL}/auth/login/local`,
    ME: `${API_BASE_URL}/users/me`,
  },
  SYSTEM: {
    // API_BASE_URL(/api)을 붙이지 않고, 전체 주소에서 바로 actuator로 들어갑니다.
    HEALTH: `${BACKEND_URL}/actuator/health`,
  },
} as const;
