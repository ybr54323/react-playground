import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.glsl'],
  plugins: [react()],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
