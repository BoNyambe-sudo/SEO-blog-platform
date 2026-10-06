import type { APIRoute } from 'astro'
import { client } from '../../lib/sanity'
import { POSTS_SEARCH_QUERY, safeFetch, type PostSearchData } from '../../lib/queries'

export const GET: APIRoute = async () => {
  const posts = await safeFetch<PostSearchData[]>(client, POSTS_SEARCH_QUERY)
  const index = posts.map((post) => ({
    id: post._id,
    title: post.title,
    slug: `/blog/${post.slug.current}`,
    excerpt: post.excerpt || '',
    publishedAt: post.publishedAt,
    categories: post.categories || [],
  }))

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  })
}
