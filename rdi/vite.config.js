import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// قاعدة النشر النسبية حتى يعمل التطبيق من أي مسار (مثل GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
});
