// src/apis/instance.ts
import axios from 'axios';
import { API_BASE_URL } from '../constants/api'; // 수정된 api.ts에서 가져옴

export const api = axios.create({
  // 이제 다시 https://waffle... 로 직접 쏩니다.
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
