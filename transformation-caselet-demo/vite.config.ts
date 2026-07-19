import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal Vite config. No backend, no external services.
export default defineConfig({
  plugins: [react()],
  // Pin an inline (empty) PostCSS config so Vite does NOT walk up to a
  // parent directory's postcss config. This keeps the project fully
  // self-contained inside its own folder.
  css: {
    postcss: {},
  },
  server: {
    port: 5173,
    open: false,
  },
})
