import react from '@vitejs/plugin-react-swc';
import { type UserConfig, defineConfig, loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), mkcert()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
