import { API_ENDPOINTS } from '../constants/api';
import { api } from './instance';

interface HealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';
}

export const systemApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM.HEALTH);
    return response.data;
  },
};
