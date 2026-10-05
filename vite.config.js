import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/quanly707/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    host: true,
  },
});
