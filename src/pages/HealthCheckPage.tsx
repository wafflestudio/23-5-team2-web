// pages/HealthCheckPage.tsx
import { useCallback, useEffect, useState } from 'react';
import { systemApi } from '../apis/system'; // 파일명 오타 주의 (system vs systems)

const HealthCheckPage = () => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [healthData, setHealthData] = useState<{status: string} | null>(null);

  const getHealth = useCallback(async () => {
    try {
      setStatus('loading');
      // 1. 서버에 요청
      const data = await systemApi.checkHealth();

      // 2. Spring Actuator는 정상일 때 'UP'을 반환함
      if (data.status === 'UP') {
        setHealthData(data);
        setStatus('ok');
      } else {
        // 'DOWN' 등의 상태일 때
        setStatus('error');
      }
    } catch (error) {
      // 3. 서버가 완전히 꺼져있거나 503(Service Unavailable)일 때 catch로 들어옴
      console.error('Health check failed:', error);
      setHealthData(null);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    getHealth();
  }, [getHealth]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>시스템 모니터링</h1>
      <hr />
      
      <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        {status === 'loading' && <p>⏳ 서버 상태 확인 중...</p>}
        
        {status === 'ok' && (
          <div>
            <p style={{ color: 'green', fontWeight: 'bold' }}>● 서버 정상 작동 중</p>
            <small>상태 코드: {healthData?.status}</small>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <p style={{ color: 'red', fontWeight: 'bold' }}>● 서버 연결 불가 또는 지연</p>
            <p style={{ fontSize: '0.9rem' }}>현재 API 서버에 접근할 수 없습니다.</p>
          </div>
        )}
      </div>

      <button 
        onClick={getHealth}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        새로고침
      </button>
    </div>
  );
};

export default HealthCheckPage;
