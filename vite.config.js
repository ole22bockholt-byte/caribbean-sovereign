import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
// base: Auf GitHub Pages (Projekt-Seiten) läuft die App unter einem Unterpfad
// (z. B. /caribbean-sovereign/). Der Deploy-Workflow setzt dafür VITE_BASE_PATH.
// Lokal und bei eigener Domain bleibt es "/".
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
  ],
  resolve: {
    // "@" -> "src" (früher vom @base44/vite-plugin bereitgestellt).
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
