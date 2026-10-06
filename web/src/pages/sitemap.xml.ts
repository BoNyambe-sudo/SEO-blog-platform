import type { APIRoute } from 'astro'
import { client } from '../lib/sanity'
import { safeFetch, ALL_POST_URLS_QUERY, ALL_CATEGORIES_QUERY, ALL_AUTHORS_QUERY } from '../lib/queries'

interface SitemapEntry {
  slug: string
  _updatedAt?: string
}

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

export const prerender = false

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = (site || new URL(import.meta.env.SITE_URL || 'http://localhost:4321')).toString().replace(/\/$/, '')

  let posts: SitemapEntry[] = []
  let categories: SitemapEntry[] = []
  let authors: SitemapEntry[] = []

  try {
    ;[posts, categories, authors] = await Promise.all([
      safeFetch<SitemapEntry[]>(client, ALL_POST_URLS_QUERY),
      safeFetch<SitemapEntry[]>(client, ALL_CATEGORIES_QUERY),
      safeFetch<SitemapEntry[]>(client, ALL_AUTHORS_QUERY),
    ])
  } catch (error) {
    console.error('Sitemap generation failed:', error)
    return new Response('Sitemap unavailable', { status: 500 })
  }

  const urls: SitemapUrl[] = [
    { loc: `${siteUrl}/`, changefreq: 'daily', priority: 1.0 },
    { loc: `${siteUrl}/blog/1`, changefreq: 'daily', priority: 0.8 },
    ...posts.map((post) => ({
      loc: `${siteUrl}/blog/${post.slug}`,
      lastmod: post._updatedAt,
      changefreq: 'weekly',
      priority: 0.9,
    })),
    ...categories.map((category) => ({
      loc: `${siteUrl}/category/${category.slug}`,
      lastmod: category._updatedAt,
      changefreq: 'weekly',
      priority: 0.7,
    })),
    ...authors.map((author) => ({
      loc: `${siteUrl}/author/${author.slug}`,
      lastmod: author._updatedAt,
      changefreq: 'weekly',
      priority: 0.6,
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls
  .map((url) => {
    const lines = [`  <url>`, `    <loc>${url.loc}</loc>`]
    if (url.lastmod) lines.push(`    <lastmod>${url.lastmod}</lastmod>`)
    if (url.changefreq) lines.push(`    <changefreq>${url.changefreq}</changefreq>`)
    if (url.priority !== undefined) lines.push(`    <priority>${url.priority.toFixed(1)}</priority>`)
    lines.push('  </url>')
    return lines.join('\n')
  })
  .join('\n')}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
