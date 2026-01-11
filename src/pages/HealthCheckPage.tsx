import { useCallback, useEffect, useState } from 'react';
import { systemApi } from '../apis/system';

interface HealthResponse {
  status: string;
}

const HealthCheckPage = () => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [details, setDetails] = useState<HealthResponse | null>(null);

  const getHealth = useCallback(async () => {
    try {
      setStatus('loading');
      const data = await systemApi.checkHealth();

      // 백엔드 설계에 따라 'UP'이면 정상으로 판단합니다.
      if (data.status === 'UP') {
        setDetails(data);
        setStatus('ok');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    getHealth();
  }, [getHealth]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>서버 상태 확인</h1>
      {status === 'loading' && <p>로딩 중...</p>}
      {status === 'ok' && details && (
        <p style={{ color: 'green' }}>서버 상태: {details.status}</p> //
      )}
      {status === 'error' && <p style={{ color: 'red' }}>서버 연결 실패</p>}
      <button onClick={getHealth}>다시 시도</button>
    </div>
  );
};

export default HealthCheckPage;
