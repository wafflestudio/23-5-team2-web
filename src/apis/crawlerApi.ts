// src/apis/crawlerApi.ts
import { API_ENDPOINTS } from '../constants/api';
import type { CrawlerStatusResponse } from '../types/crawler';
import { api } from './instance'; // 이전에 만든 인스턴스

export const getCrawlerStatus = async (): Promise<CrawlerStatusResponse> => {
  const response = await api.get(API_ENDPOINTS.CRAWLER.GET_STATUS);
  // console.log('--- [API Response Data] ---');
  // console.log(response.data);
  return response.data; // { status: 'running', lastRun: '...' } 같은 형태겠죠?
};
