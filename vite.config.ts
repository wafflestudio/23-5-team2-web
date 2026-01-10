import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://waffle.tteokgook1.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 추가: 서버가 Origin 헤더를 검사할 때 서버 주소와 일치하도록 속임
        headers: {
          Origin: 'https://waffle.tteokgook1.net',
          Referer: 'https://waffle.tteokgook1.net',
        },
      },
    },
  },
});
