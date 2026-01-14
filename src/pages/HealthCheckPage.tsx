// pages/HealthCheckPage.tsx
import { useCallback, useEffect, useState } from 'react';
import { systemApi } from '../apis/system'; // 파일명 오타 주의 (system vs systems)
import styles from './HealthCheckPage.module.css';

const HealthCheckPage = () => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [healthData, setHealthData] = useState<{ status: string } | null>(null);

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
    <div className={styles.container}>
      <h1>시스템 모니터링</h1>
      <hr />

      <div className={styles.statusCard}>
        {status === 'loading' && <p>⏳ 서버 상태 확인 중...</p>}

        {status === 'ok' && (
          <div>
            <p className={styles.statusTitleOk}>● 서버 정상 작동 중</p>
            <small>상태 코드: {healthData?.status}</small>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className={styles.statusTitleError}>
              ● 서버 연결 불가 또는 지연
            </p>
            <p className={styles.errorText}>
              현재 API 서버에 접근할 수 없습니다.
            </p>
          </div>
        )}
      </div>

      <button onClick={getHealth} className={styles.refreshButton}>
        새로고침
      </button>
    </div>
  );
};

export default HealthCheckPage;
