import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 현재 실행 모드(dev 또는 prod)에 맞는 환경 변수를 불러옵니다.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          // .env 파일에 정의한 VITE_PROXY_TARGET 주소를 사용합니다.
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
