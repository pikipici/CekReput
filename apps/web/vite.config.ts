import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    allowedHosts: ['cekreput.com', 'www.cekreput.com'],
    host: '0.0.0.0',
  },
  plugins: [react(), tailwindcss()],
})
