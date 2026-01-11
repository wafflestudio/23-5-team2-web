export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const ACTUAL_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: `${ACTUAL_BACKEND_URL}/oauth2/authorization/google`,
    ME: `${API_BASE_URL}/users/me`,
    REGISTER: `${API_BASE_URL}/auth/register/local`,
    LOGIN: `${API_BASE_URL}/auth/login/local`,
  },
  SYSTEM: {
    HEALTH: `${API_BASE_URL}/actuator/health`,
  },
} as const;
