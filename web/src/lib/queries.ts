export const FEATURED_POSTS_QUERY = `*[_type == "post" && defined(slug.current) && publishedAt <= now()]
  | order(publishedAt desc)[0...3] {
  _id, title, slug, excerpt, publishedAt,
  coverImage { asset -> { url, metadata { dimensions { w, h } } } },
  author -> { name, slug, image { asset -> { url } } },
  categories[] ->,
}`

export const POSTS_LIST_QUERY = `*[_type == "post" && defined(slug.current) && publishedAt <= now()]
  | order(publishedAt desc)[$skip...$skip+$limit] {
  _id, title, slug, excerpt, publishedAt,
  coverImage { asset -> { url, metadata { dimensions { w, h } } } },
  author -> { name, slug },
  categories[] -> { title, slug },
}`

export const POST_COUNT_QUERY = `count(*[_type == "post" && defined(slug.current) && publishedAt <= now()])`

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  ...,
  content,
  author -> {
    name, slug, bio,
    image { asset -> { url, metadata { dimensions { w, h } } } }
  },
  categories[] -> { title, slug },
  coverImage { asset -> { url, metadata { dimensions { w, h } } } },
}`

export const CATEGORY_WITH_POSTS_QUERY = `*[_type == "category" && slug.current == $slug][0] {
  title, description,
  "posts": *[_type == "post" && references(^._id) && defined(slug.current) && publishedAt <= now()]
    | order(publishedAt desc)[0...6] {
    _id, title, slug, excerpt, publishedAt,
    coverImage { asset -> { url } }
  }
}`

export const AUTHOR_WITH_POSTS_QUERY = `*[_type == "author" && slug.current == $slug][0] {
  name, slug, bio,
  image { asset -> { url, metadata { dimensions { w, h } } } },
  "posts": *[_type == "post" && author._ref == ^._id && defined(slug.current)]
    | order(publishedAt desc)[0...6] {
    _id, title, slug, excerpt, publishedAt,
    coverImage { asset -> { url } }
  }
}`

export const ALL_SLUGS_QUERY = `*[_type == "post" && defined(slug.current) && publishedAt <= now()].slug.current`

export const POSTS_SEARCH_QUERY = `*[_type == "post" && defined(slug.current) && publishedAt <= now()] |
  order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt,
  "categories": categories[]->title,
}`
