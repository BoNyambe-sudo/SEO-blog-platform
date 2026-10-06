import { client } from './sanity'
import { POSTS_SEARCH_QUERY, safeFetch, type PostSearchData } from './queries'

export interface SearchIndexItem {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  categories: string[]
}

export async function generateSearchIndex(): Promise<SearchIndexItem[]> {
  const posts = await safeFetch<PostSearchData[]>(client, POSTS_SEARCH_QUERY)
  return posts.map((post) => ({
    id: post._id,
    title: post.title,
    slug: `/blog/${post.slug.current}`,
    excerpt: post.excerpt || '',
    publishedAt: post.publishedAt,
    categories: post.categories || [],
  }))
}
