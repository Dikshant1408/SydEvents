import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Shimming process.env ensures that calls like process.env.API_KEY work in the browser
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY || '')
    }
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  }
});