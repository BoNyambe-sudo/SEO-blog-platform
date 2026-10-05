import { client } from '../../lib/sanity'
import { POSTS_SEARCH_QUERY, safeFetch } from '../../lib/queries'

export async function GET() {
  const posts = await safeFetch(client, POSTS_SEARCH_QUERY)
  const index = posts.map((p: any) => ({
    id: p._id,
    title: p.title,
    slug: `/blog/${p.slug.current}`,
    excerpt: p.excerpt || '',
    publishedAt: p.publishedAt,
    categories: p.categories || [],
  }))

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  })
}
