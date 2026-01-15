// src/apis/auth.ts
import type { AuthRequest, User } from '../types/auth';
import { api } from './instance';

export const authApi = {
  registerLocal: (data: AuthRequest) =>
    api.post<User>('/v1/auth/register/local', data),

  loginLocal: (data: AuthRequest) => api.post('/v1/auth/login/local', data),

  logout: () => api.post('/v1/auth/logout'),

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
