import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages liefert unter /<repo-name>/ aus - der Deploy-Workflow setzt das
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  server: { port: 3000, open: true },
  build: { outDir: 'dist', sourcemap: true },
})
