// apis/system.ts
import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

// 응답 타입 정의 (groups 정보 포함)
interface HealthResponse {
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE' | 'UNKNOWN';
  groups?: string[];
}

export const systemApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    // 공통 api 인스턴스 대신, 설정을 초기화한 axios를 직접 사용합니다.
    // baseURL이 /api/v1 처럼 되어있을 경우를 대비해 전체 URL을 쓰거나 설정을 비웁니다.
    const response = await axios.get<HealthResponse>(
      API_ENDPOINTS.SYSTEM.HEALTH,
      {
        timeout: 2000, // 헬스 체크는 2초 안에 안 오면 문제가 있는 것
      }
    );
    return response.data;
  },
};
