import { client } from './sanity'
import { POSTS_SEARCH_QUERY } from './queries'

export interface SearchIndexItem {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  categories: string[]
}

export async function generateSearchIndex(): Promise<SearchIndexItem[]> {
  const posts = await client.fetch(POSTS_SEARCH_QUERY)
  return posts.map((p: any) => ({
    id: p._id,
    title: p.title,
    slug: `/blog/${p.slug.current}`,
    excerpt: p.excerpt || '',
    publishedAt: p.publishedAt,
    categories: p.categories || [],
  }))
}
