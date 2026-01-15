import react from '@vitejs/plugin-react-swc';
import { type UserConfig, defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_PROXY_TARGET || 'https://waffle.tteokgook1.net';

  return {
    plugins: [react(), mkcert()],
    server: {
      // 1. https: true 설정을 지워도 mkcert()가 있으면 자동으로 HTTPS로 뜹니다.
      // vite.config.ts 수정 제안
      proxy: {
        // 1. 일반 비즈니스 로직 API 프록시 (필수!)
        '/api': {
          target,
          changeOrigin: true,
          // 필요하다면 rewrite 설정 (백엔드 주소에 /api가 포함되어 있지 않은 경우)
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
        // 2. 헬스체크용 프록시 (이미 잘 설정됨)
        '/actuator': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
