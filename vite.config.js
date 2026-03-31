import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb'],
  server: {
    proxy: {
      '/models-asset': {
        target: 'https://threed-dog-model.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/models-asset/, ''),
      },
    },
  },
})
