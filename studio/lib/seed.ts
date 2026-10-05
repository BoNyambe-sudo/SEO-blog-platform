import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  apiVersion: '2026-03-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

async function seedData() {
  const author = await client.create({
    _type: 'author',
    name: 'Jane Doe',
    slug: { _type: 'slug', current: 'jane-doe' },
    bio: 'Senior software engineer specializing in web performance and SEO.',
    twitter: 'https://twitter.com/janedoe',
    website: 'https://janedoe.dev',
  })

  const seo = await client.create({
    _type: 'category',
    title: 'SEO',
    slug: { _type: 'slug', current: 'seo' },
    description: 'Search engine optimization strategies and guides.',
  })

  const webPerf = await client.create({
    _type: 'category',
    title: 'Web Performance',
    slug: { _type: 'slug', current: 'web-performance' },
    description: 'Building fast websites and optimizing Core Web Vitals.',
  })

  const posts = [
    {
      title: 'Mastering Core Web Vitals: A Complete SEO Guide',
      slug: { _type: 'slug', current: 'core-web-vitals-complete-guide' },
      excerpt: 'Learn how to optimize LCP, FID, and CLS for better search rankings.',
      content: [
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Introduction' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Core Web Vitals are Google ranking factors that measure user experience.' }] },
        { _type: 'block', style: 'h3', children: [{ _type: 'span', text: 'Largest Contentful Paint (LCP)' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'LCP measures loading performance. Aim for under 2.5 seconds.' }] },
      ],
      coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'placeholder' } },
      author: { _type: 'reference', _ref: author._id },
      categories: [
        { _type: 'reference', _ref: seo._id },
        { _type: 'reference', _ref: webPerf._id },
      ],
      seoTitle: 'Mastering Core Web Vitals: Complete SEO Guide 2026',
      seoDescription: 'Optimize LCP, FID, CLS for search rankings.',
      publishedAt: '2026-09-20T10:00:00Z',
    },
    {
      title: 'Astro vs Next.js: Which is Faster for Blogs?',
      slug: { _type: 'slug', current: 'astro-vs-nextjs-blog-performance' },
      excerpt: 'Compare Astro and Next.js for building high-performance blog platforms.',
      content: [
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Overview' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Both frameworks offer excellent performance but with different approaches.' }] },
      ],
      coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'placeholder' } },
      author: { _type: 'reference', _ref: author._id },
      categories: [{ _type: 'reference', _ref: webPerf._id }],
      seoTitle: 'Astro vs Next.js: Blog Performance Comparison 2026',
      seoDescription: 'Which framework is faster for building blogs?',
      publishedAt: '2026-09-15T10:00:00Z',
    },
    {
      title: 'Sanity CMS Deep Dive: Structured Content for Developers',
      slug: { _type: 'slug', current: 'sanity-cms-deep-dive' },
      excerpt: 'Explore how Sanity CMS enables structured content workflows for modern web projects.',
      content: [
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'What is Sanity?' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Sanity is a headless CMS that treats content as data.' }] },
      ],
      coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'placeholder' } },
      author: { _type: 'reference', _ref: author._id },
      categories: [{ _type: 'reference', _ref: seo._id }],
      seoTitle: 'Sanity CMS Deep Dive: Structured Content for Developers',
      seoDescription: 'Learn how to use Sanity CMS for structured content.',
      publishedAt: '2026-09-10T10:00:00Z',
    },
    {
      title: 'Progressive Enhancement in 2026: Still Relevant?',
      slug: { _type: 'slug', current: 'progressive-enhancement-2026' },
      excerpt: 'Why progressive enhancement remains critical for modern web development.',
      content: [
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'The Case for Progressive Enhancement' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Building resilient web experiences that work everywhere.' }] },
      ],
      coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'placeholder' } },
      author: { _type: 'reference', _ref: author._id },
      categories: [{ _type: 'reference', _ref: webPerf._id }],
      seoTitle: 'Progressive Enhancement in 2026: Still Relevant?',
      seoDescription: 'Why progressive enhancement matters in 2026.',
      publishedAt: '2026-09-05T10:00:00Z',
    },
    {
      title: 'Optimizing Images for SEO and Performance',
      slug: { _type: 'slug', current: 'optimizing-images-seo-performance' },
      excerpt: 'Best practices for image optimization to boost SEO scores and page speed.',
      content: [
        { _type: 'block', style: 'h2', children: [{ _type: 'span', text: 'Why Images Matter' }] },
        { _type: 'block', style: 'normal', children: [{ _type: 'span', text: 'Images often make up the majority of page weight.' }] },
      ],
      coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'placeholder' } },
      author: { _type: 'reference', _ref: author._id },
      categories: [
        { _type: 'reference', _ref: seo._id },
        { _type: 'reference', _ref: webPerf._id },
      ],
      seoTitle: 'Optimizing Images for SEO and Performance',
      seoDescription: 'Best practices for image optimization.',
      publishedAt: '2026-09-01T10:00:00Z',
    },
  ]

  for (const post of posts) {
    await client.create({ _type: 'post', ...post })
  }

  console.log('Seed data created successfully!')
}

seedData().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
