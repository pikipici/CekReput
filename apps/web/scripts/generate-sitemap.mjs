import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Base URL - Update this to your actual domain or use environment variable
const BASE_URL = process.env.VITE_SITE_URL || 'https://cekreput.com'

// Static routes that should always be in sitemap
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/results', priority: '0.8', changefreq: 'daily' },
  { path: '/report', priority: '0.7', changefreq: 'monthly' },
  { path: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
]

// Generate sitemap XML
function generateSitemap(routes) {
  const today = new Date().toISOString().split('T')[0]
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`

  routes.forEach((route) => {
    xml += `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`
  })

  xml += `</urlset>`
  return xml
}

// Main execution
const sitemap = generateSitemap(staticRoutes)
const outputPath = join(__dirname, '..', 'public', 'sitemap.xml')

writeFileSync(outputPath, sitemap, 'utf-8')
console.log(`✓ Sitemap generated at: ${outputPath}`)
console.log(`✓ Total URLs: ${staticRoutes.length}`)
