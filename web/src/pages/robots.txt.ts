import type { APIRoute } from 'astro'

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site || new URL(import.meta.env.SITE_URL || 'http://localhost:4321')).toString().replace(/\/$/, '')
  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`
  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
