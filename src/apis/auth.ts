// src/apis/auth.ts
import { API_ENDPOINTS } from '../constants/api';
import type { AuthRequest, User } from '../types/auth';
import { api } from './instance';

export const authApi = {
  registerLocal: (data: AuthRequest) =>
    api.post<User>(API_ENDPOINTS.AUTH.REGISTER, data),

  loginLocal: (data: AuthRequest) => api.post(API_ENDPOINTS.AUTH.LOGIN, data),

  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),

  getMe: () => api.get<User>('/v1/users/me'),

  /**
   * Password Change API
   * Updated to match your screenshot schema:
   * oldPassword and newPassword
   */
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/v1/users/me/local', {
      oldPassword: data.currentPassword, // Corrected key from screenshot
      newPassword: data.newPassword, // Corrected key from screenshot
    }),

  deleteAccount: () => api.delete('/v1/users/me'),
};
