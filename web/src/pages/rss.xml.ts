import type { APIRoute } from 'astro'
import { client } from '../lib/sanity'
import { POSTS_LIST_QUERY, safeFetch, type PostCardData } from '../lib/queries'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const GET: APIRoute = async ({ site }) => {
  const posts = await safeFetch<PostCardData[]>(client, POSTS_LIST_QUERY, { skip: 0, limit: 100 })

  const siteUrl = (site || new URL(import.meta.env.SITE_URL || 'http://localhost:4321')).toString().replace(/\/$/, '')
  const siteTitle = 'Search & Signal'
  const siteDescription =
    'Clear, practical field notes on technical SEO, web performance, and building for the modern web.'

  const items = posts
    .map((post) => {
      const title = escapeXml(post.title)
      const description = escapeXml(post.excerpt || '')
      const author = escapeXml(post.author?.name || '')
      const link = `${siteUrl}/blog/${post.slug.current}/`
      const pubDate = new Date(post.publishedAt).toUTCString()
      const enclosure = post.coverImage?.asset?.url
        ? `      <enclosure url="${post.coverImage.asset.url}?auto=format&fit=max&w=1200&q=80" type="image/jpeg" />\n`
        : ''
      return `    <item>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${author}</author>
${enclosure}    </item>`
    })
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <description>${escapeXml(siteDescription)}</description>
    <link>${siteUrl}/</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <image>
      <url>${siteUrl}/og-default.png</url>
      <title>${escapeXml(siteTitle)}</title>
      <link>${siteUrl}/</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  })
}
