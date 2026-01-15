// src/apis/crawlerApi.ts
import type { CrawlerStatusResponse } from '../types/crawler';
import { api } from './instance';

export const getCrawlerStatus = async (): Promise<CrawlerStatusResponse> => {
  const response = await api.get('/crawlers');
  // console.log('--- [API Response Data] ---');
  // console.log(response.data);
  return response.data; // { status: 'running', lastRun: '...' } 같은 형태겠죠?
};
