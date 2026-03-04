import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inject environment variables into index.html
    {
      name: 'inject-env',
      transformIndexHtml(html) {
        return html
          .replace(/G-XXXXXXXXXX/g, process.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX')
          .replace(/YOUR_GOOGLE_SITE_VERIFICATION_CODE/g, process.env.VITE_GOOGLE_SITE_VERIFICATION || 'YOUR_GOOGLE_SITE_VERIFICATION_CODE')
          .replace(/https:\/\/cekreput\.com/g, process.env.VITE_SITE_URL || 'https://cekreput.com')
          .replace(/og-image\.png/g, 'og-image.svg')
      },
    },
  ],
})
