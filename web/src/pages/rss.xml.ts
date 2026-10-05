---
import { getCollection } from 'astro:content'
import { client } from '../lib/sanity'
import { POSTS_LIST_QUERY } from '../lib/queries'

export async function GET(context: { site: string }) {
  const posts = await client.fetch(POSTS_LIST_QUERY, { skip: 0, limit: 100 })

  const rssItems = posts.map((post: any) => ({
    title: post.title,
    description: post.excerpt,
    pubDate: post.publishedAt,
    link: `/blog/${post.slug.current}/`,
    author: post.author?.name,
    image: post.coverImage?.asset?.url,
  }))

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SEO Blog Platform</title>
    <description>Content-first blog about web development.</description>
    <link>${context.site}</link>
    <image>
      <url>${context.site}/og-default.png</url>
      <title>SEO Blog Platform</title>
      <link>${context.site}</link>
    </image>
    ${rssItems.map(item => `
    <item>
      <title>${item.title}</title>
      <description>${item.description}</description>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <link>${context.site}${item.link}</link>
      <author>${item.author}</author>
      ${item.image ? `<enclosure url="${item.image}" type="image/jpeg" />` : ''}
    </item>`).join('')}
  </channel>
</rss>`

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
