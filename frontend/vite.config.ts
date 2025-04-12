import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Load environment variables from .env file (optional)
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '3000'), // Use environment variable for port or default to 3000
  },
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use '@styles/global/variables' as *;
          @use '@styles/global/mixins' as *;
        `,
      },
    },
  },
});
