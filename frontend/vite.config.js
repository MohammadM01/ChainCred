import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  assetsInclude: ['**/*.splinecode'],
  preview: {
    allowedHosts: ['chaincred-frontend.onrender.com'],
    host: true,        // ensures it binds to 0.0.0.0
    port: 4173         // default vite preview port (Render replaces with $PORT)
  }
})
