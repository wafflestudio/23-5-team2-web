// apis/system.ts
import axios from 'axios';

// 응답 타입 정의 (groups 정보 포함)
interface HealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';
  groups?: string[];
}

export const systemApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await axios.get<HealthResponse>('/actuator/health', {
      timeout: 2000, // 헬스 체크는 2초 안에 안 오면 문제가 있는 것
    });
    return response.data;
  },
};
