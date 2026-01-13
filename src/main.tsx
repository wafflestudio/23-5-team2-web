import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 1. staleTime을 0으로 설정하거나 제거하여 주기적인 자동 갱신을 방지합니다.
      staleTime: 0,

      // 2. API 실패 시 재시도 횟수
      retry: 1,

      // 3. 브라우저 창에 다시 포커스되었을 때 자동으로 다시 불러오기 방지 (매우 중요)
      // 다른 탭을 갔다 돌아와도 다시 불러오지 않습니다.
      refetchOnWindowFocus: false,

      // 4. 컴포넌트가 처음 나타날(Mount) 때만 데이터를 가져옵니다.
      refetchOnMount: true,

      // 5. 네트워크가 재연결되었을 때 자동 업데이트 방지
      refetchOnReconnect: false,
    },
  },
});

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
