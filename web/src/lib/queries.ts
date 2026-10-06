import type { SanityClient } from '@sanity/client'

export interface CategorySummary {
  title: string
  slug: { current: string }
}

export interface AuthorSummary {
  name: string
  slug: { current: string }
  bio?: string
  website?: string
  twitter?: string
  image?: {
    asset: {
      url: string
      metadata?: { dimensions?: { w: number; h: number } }
    }
  }
}

export interface PostCardData {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  coverImage?: {
    alt?: string
    asset: {
      _id?: string
      url: string
      metadata?: { dimensions?: { w: number; h: number } }
    }
  }
  author?: Pick<AuthorSummary, 'name' | 'slug'>
  categories?: CategorySummary[]
}

export interface PortableContentBlock {
  _type: string
  _key?: string
  style?: string
  children?: { text?: string }[]
  [key: string]: unknown
}

export interface PostSearchData {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  categories: string[]
}

export interface PostDetail extends PostCardData {
  _updatedAt?: string
  content: PortableContentBlock[]
  seoTitle?: string
  seoDescription?: string
  author?: AuthorSummary
}

export interface CategoryWithPosts {
  title: string
  description?: string
  posts: PostCardData[]
}

export interface AuthorWithPosts extends AuthorSummary {
  posts: PostCardData[]
}

const publishedPostFilter =
  '_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()'

const coverImageProjection = `coverImage {
  alt,
  asset -> { _id, url, metadata { dimensions { w, h } } }
}`

export const FEATURED_POSTS_QUERY = `*[${publishedPostFilter}]
  | order(publishedAt desc)[0...3] {
  _id, title, slug, excerpt, publishedAt,
  ${coverImageProjection},
  author -> { name, slug },
  categories[] -> { title, slug },
}`

export const POSTS_LIST_QUERY = `*[${publishedPostFilter}]
  | order(publishedAt desc)[$skip...$skip+$limit] {
  _id, title, slug, excerpt, publishedAt,
  ${coverImageProjection},
  author -> { name, slug },
  categories[] -> { title, slug },
}`

export const POST_COUNT_QUERY = `count(*[${publishedPostFilter}])`

export const POST_BY_SLUG_QUERY = `*[${publishedPostFilter} && slug.current == $slug][0] {
  ...,
  content,
  author -> {
    name, slug, bio, website, twitter,
    image { asset -> { url, metadata { dimensions { w, h } } } }
  },
  categories[] -> { title, slug },
  ${coverImageProjection},
}`

export const CATEGORY_WITH_POSTS_QUERY = `*[_type == "category" && slug.current == $slug][0] {
  title, description,
  "posts": *[_type == "post" && references(^._id) && defined(slug.current) && defined(publishedAt) && publishedAt <= now()]
    | order(publishedAt desc)[0...12] {
    _id, title, slug, excerpt, publishedAt,
    ${coverImageProjection},
    author -> { name, slug },
    categories[] -> { title, slug },
  }
}`

export const AUTHOR_WITH_POSTS_QUERY = `*[_type == "author" && slug.current == $slug][0] {
  name, slug, bio, website, twitter,
  image { asset -> { url, metadata { dimensions { w, h } } } },
  "posts": *[_type == "post" && author._ref == ^._id && defined(slug.current) && defined(publishedAt) && publishedAt <= now()]
    | order(publishedAt desc)[0...12] {
    _id, title, slug, excerpt, publishedAt,
    ${coverImageProjection},
    author -> { name, slug },
    categories[] -> { title, slug },
  }
}`

export const ALL_POST_URLS_QUERY = `*[${publishedPostFilter}] | order(publishedAt desc) {
  "slug": slug.current,
  publishedAt
}`

export const ALL_CATEGORIES_QUERY = `*[_type == "category" && defined(slug.current)] {
  "slug": slug.current,
  _updatedAt
}`

export const ALL_AUTHORS_QUERY = `*[_type == "author" && defined(slug.current)] {
  "slug": slug.current,
  _updatedAt
}`

export const POSTS_SEARCH_QUERY = `*[${publishedPostFilter}] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt,
  "categories": categories[] -> title,
}`

export async function safeFetch<T>(
  client: SanityClient | null,
  query: string,
  params?: Record<string, string | number>,
): Promise<T> {
  if (!client) {
    throw new Error(
      'Sanity is not configured. Set SANITY_PROJECT_ID and SANITY_DATASET in the workspace environment.',
    )
  }

  try {
    return params
      ? await client.fetch<T>(query, params)
      : await client.fetch<T>(query)
  } catch (error) {
    console.error('Sanity query failed:', error)
    throw error
  }
}
