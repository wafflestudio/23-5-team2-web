import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 1. 필수 모듈 임포트
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// 2. QueryClient 인스턴스 생성
// 애플리케이션 전체의 쿼리 상태와 캐시를 관리하는 역할을 합니다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터가 stale(오래된) 상태가 되는 시간을 30초로 설정 (예시)
      staleTime: 30000,
      // API 실패 시 재시도 횟수
      retry: 1,
    },
  },
});

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    {/* 3. App을 Provider로 감싸서 하위 컴포넌트들이 React Query 기능을 쓸 수 있게 합니다. */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
