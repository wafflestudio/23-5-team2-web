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
      proxy: {
        // /api 설정은 이제 안 쓰겠지만 둬도 상관없음
        '/actuator': {
          target,
          changeOrigin: true,
        },
      },
    },
  };
});
