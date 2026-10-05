import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@sanity/client'

const envFile = resolve(process.cwd(), '..', '.env')
if (existsSync(envFile)) process.loadEnvFile(envFile)

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !dataset || !token) {
  throw new Error(
    'Seeding requires SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, and SANITY_WRITE_TOKEN in the root .env file or process environment.',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION || '2026-03-01',
  token,
  useCdn: false,
})

type LinkPart = { text: string; href: string }
type TextPart = string | LinkPart

let keyCounter = 0

function key() {
  keyCounter += 1
  return `seed-${keyCounter}`
}

function paragraph(...parts: TextPart[]) {
  const markDefs: { _key: string; _type: 'link'; href: string }[] = []
  const children = parts.map((part) => {
    const markKey = typeof part === 'string' ? undefined : key()
    if (typeof part !== 'string' && markKey) {
      markDefs.push({ _key: markKey, _type: 'link', href: part.href })
    }

    return {
      _key: key(),
      _type: 'span',
      text: typeof part === 'string' ? part : part.text,
      marks: markKey ? [markKey] : [],
    }
  })

  return {
    _key: key(),
    _type: 'block',
    style: 'normal',
    markDefs,
    children,
  }
}

function heading(text: string, level: 2 | 3 = 2) {
  return {
    _key: key(),
    _type: 'block',
    style: `h${level}`,
    markDefs: [],
    children: [{ _key: key(), _type: 'span', text, marks: [] }],
  }
}

function bulletList(items: string[]) {
  return items.map((text) => ({
    _key: key(),
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _key: key(), _type: 'span', text, marks: [] }],
  }))
}

function callout(type: 'info' | 'warning' | 'success', title: string, text: string) {
  return {
    _key: key(),
    _type: 'callout',
    type,
    title,
    content: [paragraph(text)],
  }
}

function code(language: string, filename: string, source: string) {
  return {
    _key: key(),
    _type: 'code',
    language,
    filename,
    code: source,
  }
}

const author = {
  _id: 'author-search-and-signal-editorial',
  _type: 'author',
  name: 'Search & Signal Editorial Team',
  slug: { _type: 'slug', current: 'search-and-signal-editorial' },
  bio: 'Independent research and practical guidance for people who build, maintain, and grow websites. Our articles favor clear evidence, useful examples, and respect for the people on the other side of the screen.',
}

const categories = [
  {
    _id: 'category-search-seo',
    _type: 'category',
    title: 'Search & SEO',
    slug: { _type: 'slug', current: 'search-seo' },
    description:
      'Technical SEO and search strategy grounded in discoverability, useful content, and a better experience for readers.',
  },
  {
    _id: 'category-performance',
    _type: 'category',
    title: 'Web Performance',
    slug: { _type: 'slug', current: 'performance' },
    description:
      'Measure what people experience, understand what slows them down, and make the web feel fast.',
  },
  {
    _id: 'category-engineering',
    _type: 'category',
    title: 'Web Engineering',
    slug: { _type: 'slug', current: 'engineering' },
    description:
      'Thoughtful architecture and practical implementation notes for resilient, content-first websites.',
  },
  {
    _id: 'category-content',
    _type: 'category',
    title: 'Content Strategy',
    slug: { _type: 'slug', current: 'content' },
    description:
      'Build useful editorial systems around real questions, clear structure, and information worth maintaining.',
  },
  {
    _id: 'category-accessibility',
    _type: 'category',
    title: 'Accessibility',
    slug: { _type: 'slug', current: 'accessibility' },
    description:
      'Make content easier to perceive, navigate, and understand across devices and assistive technologies.',
  },
]

const categoryRef = (slug: string) => ({
  _key: key(),
  _type: 'reference',
  _ref: `category-${slug}`,
})

const posts = [
  {
    _id: 'post-core-web-vitals-field-guide',
    _type: 'post',
    title: 'The Core Web Vitals Field Guide: Measure, Diagnose, Improve',
    slug: { _type: 'slug', current: 'core-web-vitals-field-guide' },
    excerpt:
      'A practical guide to LCP, INP, and CLS: what each metric tells you, how to find the real bottleneck, and which fixes are worth shipping first.',
    seoTitle: 'Core Web Vitals: Measure, Diagnose, Improve',
    seoDescription:
      'Learn what LCP, INP, and CLS measure, how Google assesses them, and how to prioritize fixes using real-user data.',
    publishedAt: '2026-10-02T09:00:00Z',
    author: { _type: 'reference', _ref: author._id },
    categories: [categoryRef('performance'), categoryRef('search-seo')],
    content: [
      paragraph(
        'A fast page is not just a high score in a lab. It is a page that shows its main content promptly, responds when someone interacts, and stays where they expect it to be. Core Web Vitals turn those three parts of the experience into field metrics: Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).',
      ),
      paragraph(
        'The thresholds are useful guardrails, not a complete definition of quality. Google evaluates the 75th percentile of visits, segmented by mobile and desktop. A good result is LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Start by understanding which real users miss those targets; optimize the experience, not the report.',
      ),
      heading('Start with field data, then reproduce the problem'),
      paragraph(
        'Field data answers whether visitors are experiencing a problem; lab data helps you reproduce and diagnose it. PageSpeed Insights combines CrUX field data, when enough data is available, with Lighthouse diagnostics. Search Console groups URLs with similar performance. In your own analytics, segment by device, template, and traffic source so a healthy desktop landing page does not hide a slow mobile article.',
      ),
      paragraph(
        'Record a baseline before changing code. Note the failing metric, the affected templates, and the browser conditions. Re-test after each meaningful change. Otherwise, a score moving up or down tells you little about what actually improved.',
      ),
      heading('Find the cause behind each metric'),
      heading('LCP: get the main content on screen sooner', 3),
      paragraph(
        'The LCP element is often a hero image, a heading, or a large content block. Its time includes server response, resource discovery, download, and rendering. Improve the slowest part: reduce server wait with caching and efficient data access; make the hero image discoverable in the initial HTML; serve an appropriately sized modern image; and avoid loading critical fonts or styles through a long chain of third-party requests.',
      ),
      heading('INP: make interactions feel immediate', 3),
      paragraph(
        'INP reflects the latency of interactions across a visit, including the next paint after an input. Long JavaScript tasks, expensive event handlers, and large hydration workloads are common causes. Use browser performance traces to locate the blocking task, split work into smaller pieces, and defer non-essential code. A page that needs little JavaScript has fewer opportunities to block input.',
      ),
      heading('CLS: reserve space before content arrives', 3),
      paragraph(
        'Unexpected movement usually comes from media without dimensions, late-inserted embeds, or content injected above what someone is reading. Provide image width and height, set aspect ratios for responsive media, and allocate space for advertisements or embeds before they load. Do not animate layout properties when a transform will do.',
      ),
      callout(
        'info',
        'Use the current metrics',
        'First Input Delay (FID) was replaced by INP as a Core Web Vital in March 2024. Keep older FID dashboards clearly labeled as historical; they are not a substitute for measuring INP.',
      ),
      heading('Prioritize work by impact and evidence'),
      bulletList([
        'Fix issues affecting the largest number of real visitors before polishing a single low-traffic URL.',
        'Choose changes tied to a measured bottleneck, such as a late-discovered hero image or a long main-thread task.',
        'Protect accessibility and content quality; removing useful interface features for a score is rarely a durable win.',
        'Watch field trends after deployment because lab scores cannot represent every network, device, or interaction.',
      ]),
      paragraph(
        'A useful starting point is the ',
        { text: 'web.dev guide to Core Web Vitals', href: 'https://web.dev/articles/vitals' },
        '. Pair it with a repeatable test plan and real-user monitoring. The goal is not to chase a perfect lighthouse screenshot; it is to make the important path through your site reliably quick.',
      ),
    ],
  },
  {
    _id: 'post-technical-seo-checklist',
    _type: 'post',
    title: 'A Technical SEO Checklist for Pages That Deserve to Be Found',
    slug: { _type: 'slug', current: 'technical-seo-checklist' },
    excerpt:
      'A calm, repeatable audit for crawlability, indexation, canonical URLs, internal links, and the details that help search engines understand a useful page.',
    seoTitle: 'Technical SEO Checklist for Important Pages',
    seoDescription:
      'Audit crawlability, indexation, canonicals, internal links, and structured data with this practical technical SEO checklist.',
    publishedAt: '2026-09-28T09:00:00Z',
    author: { _type: 'reference', _ref: author._id },
    categories: [categoryRef('search-seo')],
    content: [
      paragraph(
        'Technical SEO is the work that makes a good page accessible and understandable to search systems. It cannot turn thin or misleading content into a useful result, but it can prevent an excellent page from being hidden behind a broken route, an accidental noindex directive, or a maze of internal links.',
      ),
      paragraph(
        'Run this checklist on important templates as well as individual URLs. A shared template issue can affect every article; a one-off problem may have a narrower fix. Keep a record of the page, evidence, owner, and verification step so an audit produces shipped improvements rather than a spreadsheet that goes stale.',
      ),
      heading('1. Confirm the page can be crawled and indexed'),
      paragraph(
        'Open the page without signing in and verify that its primary content is present in the returned HTML. Check that robots.txt does not disallow the path. Then inspect the page source for a robots meta tag or X-Robots-Tag that could block indexing. A robots.txt disallow is not a reliable way to remove a URL from search; use the appropriate noindex behavior when removal is intended, and make sure crawlers can access the page to see it.',
      ),
      paragraph(
        'Use URL Inspection in Search Console to compare the indexed version with the live page. If the page is not indexed, investigate discovery, canonical selection, quality, and server responses before requesting indexing again.',
      ),
      heading('2. Make URL and canonical behavior intentional'),
      paragraph(
        'Every important page should load successfully at one preferred URL. Redirect alternate hostname, protocol, and trailing-slash variants consistently. Add a self-referencing canonical on indexable pages and point duplicate or parameterized versions to the preferred URL only when their content is genuinely equivalent. A canonical is a hint, not a command, so consistent internal links and redirects still matter.',
      ),
      heading('3. Help crawlers discover the right pages'),
      paragraph(
        'Include canonical, indexable URLs in an XML sitemap and keep its last-modified dates honest. A sitemap supports discovery; it does not guarantee indexing. Link to important content from relevant pages using ordinary crawlable anchors. Avoid orphan articles, broken links, and navigation that depends entirely on client-side events.',
      ),
      heading('4. Give the page a clear purpose'),
      bulletList([
        'Write a descriptive title and a concise summary that accurately represent the page.',
        'Use one clear page heading and a sensible sequence of subheadings.',
        'Describe images that contribute meaning; use empty alternative text for decorative images.',
        'Add structured data only when it describes visible, accurate page content.',
        'Link to trustworthy sources and useful next steps where they genuinely help the reader.',
      ]),
      callout(
        'warning',
        'Do not confuse a checklist with a ranking formula',
        'A passing technical audit establishes access and clarity. Search visibility still depends on whether the page is useful, reliable, relevant to the query, and competitive with other answers.',
      ),
      heading('5. Check the whole experience'),
      paragraph(
        'Review a page on a narrow mobile screen, navigate with a keyboard, and test a slow connection. Confirm that images have dimensions, forms and controls have labels, and the page remains understandable if JavaScript is delayed. Technical quality is strongest when search engines and people can both use the result.',
      ),
      paragraph(
        'For the source principles, use Google Search Central’s ',
        { text: 'SEO Starter Guide', href: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide' },
        ' alongside Search Console reports. Repeat the audit after template or routing changes, and measure the effect using crawl data and real search queries rather than a single site-wide score.',
      ),
    ],
  },
  {
    _id: 'post-astro-content-site-architecture',
    _type: 'post',
    title: 'A Practical Architecture for a Fast, Content-First Astro Site',
    slug: { _type: 'slug', current: 'astro-content-site-architecture' },
    excerpt:
      'Choose rendering boundaries, keep article HTML useful without client JavaScript, and connect structured content to a predictable publishing workflow.',
    seoTitle: 'Astro Architecture for Content-First Sites',
    seoDescription:
      'Design a fast Astro publishing stack with server-rendered content, minimal client JavaScript, useful schemas, and a reliable cache strategy.',
    publishedAt: '2026-09-23T09:00:00Z',
    author: { _type: 'reference', _ref: author._id },
    categories: [categoryRef('engineering'), categoryRef('performance')],
    content: [
      paragraph(
        'A publishing site should make the article the easiest thing to deliver. Astro is a good fit when most pages are content, navigation is conventional, and only a small part of the interface needs browser-side behavior. The point is not to avoid JavaScript at any cost; it is to make each client feature earn its bytes.',
      ),
      paragraph(
        'Start with three boundaries: the content model, the rendered page, and the interactions that truly need a browser. A Sanity document can hold structured headings, links, images, and callouts. Astro can turn that document into semantic HTML on the server. A small search bundle or theme toggle can then enhance the page without becoming responsible for its core content.',
      ),
      heading('Render the content where it is needed'),
      paragraph(
        'For mostly static articles, build-time rendering keeps delivery simple and makes the page available immediately from the edge. If content changes frequently and a rebuild is too slow, an on-demand route with Incremental Static Regeneration can cache the rendered response and refresh it after a signed CMS webhook. Select that mode deliberately: it adds a server runtime, secrets, cache behavior, and operational tests.',
      ),
      paragraph(
        'Keep pages usable with JavaScript disabled. Search may need a small client script, but the article title, body, author, canonical URL, and metadata should already be in the HTML. Avoid hydrating an entire application merely to open a navigation menu or switch a color theme.',
      ),
      heading('Keep content structured, not entangled with layout'),
      paragraph(
        'Use a content model that editors can understand: required title and slug, a short excerpt, a publish date, clear categories, and a constrained body block set. Validate important SEO fields in the Studio, then still render robust fallbacks in the site. A required image alt field is useful, but writers also need guidance on when an image is informative versus decorative.',
      ),
      paragraph(
        'Share types for the shape of a post card and a full article, and keep GROQ projections explicit. Fetching only the fields a page uses makes the query easier to review. Treat a failed content request as an error worth surfacing; silently replacing a failed API response with an empty list makes a broken production deploy look like a successful empty site.',
      ),
      heading('Make caching and publishing observable'),
      paragraph(
        'If using ISR, decide which routes should be cached, how long a response is fresh, and what a publish, update, delete, or unpublish event invalidates. A webhook should authenticate its sender, validate the payload, map only known slugs to routes, and report any failed revalidation request. Keep the route invalidation list in one place so home, category, author, article, and sitemap views stay consistent.',
      ),
      code(
        'typescript',
        'astro.config.mts',
        `export default defineConfig({
  output: 'server',
  adapter: vercel({
    isr: {
      expiration: 60 * 60 * 24,
      bypassToken: process.env.VERCEL_REVALIDATE_TOKEN,
    },
  }),
})`,
      ),
      heading('Measure the result, not just the build'),
      paragraph(
        'After a deploy, inspect the generated or rendered HTML, test a post URL and a missing slug, run the search interaction, and verify the canonical, Open Graph image, structured data, sitemap, and RSS output. Track field performance after real visitors arrive. A fast build is not proof that a reader-facing page is fast.',
      ),
      paragraph(
        'Astro’s ',
        { text: 'content collections and rendering guides', href: 'https://docs.astro.build/en/guides/content/' },
        ' are good references for the framework side. Keep the architecture small enough that the next editor and maintainer can understand how an article travels from draft to page.',
      ),
    ],
  },
  {
    _id: 'post-search-intent-content-plan',
    _type: 'post',
    title: 'Search Intent to Editorial Plan: A Better Way to Choose What to Write',
    slug: { _type: 'slug', current: 'search-intent-editorial-plan' },
    excerpt:
      'Turn real search questions into a focused article plan without keyword stuffing, duplicate pages, or publishing for volume alone.',
    seoTitle: 'A Better Search-Intent Content Plan',
    seoDescription:
      'Map search intent to useful articles, organize related topics, and build an editorial plan that avoids thin or duplicate content.',
    publishedAt: '2026-09-18T09:00:00Z',
    author: { _type: 'reference', _ref: author._id },
    categories: [categoryRef('content'), categoryRef('search-seo')],
    content: [
      paragraph(
        'A keyword list tells you what people type; it does not tell you what they need next. Before commissioning an article, look at the actual question behind the query, the current results, and the information your team can add that is accurate and useful. Search intent is a research prompt, not a label to paste into a spreadsheet.',
      ),
      paragraph(
        'Begin with a narrow audience and a real problem. A small, well-supported guide for a specific task is often more valuable than a broad overview that repeats what every other page already says. The goal is to help someone make progress, not to manufacture a URL for every phrasing variation.',
      ),
      heading('Study the question before choosing the format'),
      paragraph(
        'Search a representative query and inspect the result types: tutorials, comparisons, product pages, definitions, or local results. Note the shared subtopics, but also look for missing context, stale advice, and unanswered follow-up questions. Search results are evidence about what is being surfaced today, not instructions to copy the top pages.',
      ),
      paragraph(
        'Talk to customer support, sales, and product teams. Their recurring questions often reveal the detail that generic keyword tools miss: constraints, confusing terms, and the decision a reader must make. Add that evidence to the brief, and ask a subject-matter reviewer to confirm technical claims before publication.',
      ),
      heading('Group topics by reader need'),
      paragraph(
        'Group queries when the same page can satisfy the underlying need. Give each planned page one clear primary job, then use supporting sections for close subtopics. If two pages would answer the same question with nearly identical content, combine them or make their audiences and outcomes genuinely distinct. More URLs are not automatically more coverage.',
      ),
      heading('Write a brief that improves the final page'),
      bulletList([
        'Reader and situation: who is asking, and what are they trying to decide or do?',
        'Promise: what will they understand or be able to complete after reading?',
        'Evidence: which first-hand examples, data, or expert review support the answer?',
        'Structure: what order makes the explanation easiest to follow?',
        'Next step: which related resource is useful after this one, if any?',
      ]),
      callout(
        'success',
        'A useful quality test',
        'If removing the target keyword leaves no meaningful difference between this draft and an existing page on your site, the brief probably needs a clearer reader, question, or original contribution.',
      ),
      heading('Publish, connect, and maintain'),
      paragraph(
        'Use a descriptive title and a short summary that match the actual page. Link from related guides using language that makes sense to readers. Add a category only when it helps people explore a coherent group of articles. Avoid decorative tag clouds and repeated exact-match anchors.',
      ),
      paragraph(
        'After publishing, measure whether the page is discovered, whether the intended queries lead to it, and whether visitors continue to a useful next step. Refresh material when the underlying guidance changes, not just to move the date forward. Keep a named reviewer and a review trigger for topics that change quickly.',
      ),
      paragraph(
        'For a grounded starting point, Google’s ',
        { text: 'Search Essentials and SEO guidance', href: 'https://developers.google.com/search/docs/essentials' },
        ' emphasizes useful content and clear site organization. Use those principles with your own reader research; a durable editorial plan is built around a real need, not a target word count.',
      ),
    ],
  },
  {
    _id: 'post-image-seo-accessibility-performance',
    _type: 'post',
    title: 'Image SEO, Accessibility, and Performance: One Practical Workflow',
    slug: { _type: 'slug', current: 'image-seo-accessibility-performance' },
    excerpt:
      'Choose the right image, write contextual alternative text, deliver responsive files, and prevent media from slowing or shifting the page.',
    seoTitle: 'Image SEO, Accessibility & Performance',
    seoDescription:
      'A practical image workflow for meaningful alt text, responsive formats, stable layouts, and faster pages that remain accessible.',
    publishedAt: '2026-09-11T09:00:00Z',
    author: { _type: 'reference', _ref: author._id },
    categories: [categoryRef('accessibility'), categoryRef('performance')],
    content: [
      paragraph(
        'An image can explain a process, establish a product detail, or simply decorate a page. Those are different jobs, and treating them the same leads to verbose alternative text, oversized downloads, and layout shifts. Start by deciding what the image contributes to this specific page.',
      ),
      heading('Write alternative text for the context'),
      paragraph(
        'If an image communicates information that is not already present nearby, describe that useful information concisely. If it is decorative or repeats the adjacent text, use empty alternative text so assistive technology can skip it. Do not begin every description with “image of,” stuff it with search terms, or describe details that do not help someone understand the content.',
      ),
      paragraph(
        'For a linked image, describe the destination or action when the image is the only content inside the link. For a chart, provide the key finding in text as well as a concise image description. A longer explanation can live in the surrounding article or a linked data table.',
      ),
      heading('Deliver the right file for the display size'),
      paragraph(
        'Resize source images close to their largest rendered dimensions before upload. Use a content delivery network or image service to generate modern formats and responsive widths. Let the browser choose a suitable candidate with srcset and sizes rather than downloading a desktop-sized asset on a narrow phone. Keep the original quality high enough for the intended display without treating maximum quality as the default.',
      ),
      code(
        'html',
        'Responsive image markup',
        `<img
  src="/images/diagram-960.webp"
  srcset="/images/diagram-480.webp 480w, /images/diagram-960.webp 960w"
  sizes="(max-width: 48rem) 100vw, 48rem"
  width="960"
  height="600"
  alt="Three steps showing how a browser selects a responsive image"
  loading="lazy"
  decoding="async"
/>`,
      ),
      heading('Protect layout and prioritize the first viewport'),
      paragraph(
        'Always provide intrinsic width and height, or an explicit aspect ratio, so the browser can reserve space before the file arrives. Lazy-load images below the fold; do not lazy-load the primary hero image that is likely to become LCP. Use fetch priority sparingly for that one critical asset and verify the result in a waterfall.',
      ),
      callout(
        'info',
        'Editorial rule of thumb',
        'Decorative image: empty alt. Informative image: a concise description of the information it adds. Linked image: describe the destination or action. Avoid writing the same caption twice in alt text.',
      ),
      heading('Make images discoverable without over-optimizing'),
      paragraph(
        'Use descriptive filenames before upload and provide captions when they add context. Ensure image URLs are crawlable and that the image sits near relevant text. Add image sitemap data when it helps a large media library, but do not expect metadata to compensate for a page with little value. Search engines and readers both benefit from clear, accessible context.',
      ),
      paragraph(
        'For deeper guidance, review the W3C’s ',
        { text: 'images tutorial', href: 'https://www.w3.org/WAI/tutorials/images/' },
        ' and web.dev’s ',
        { text: 'responsive image guidance', href: 'https://web.dev/learn/images/descriptive' },
        '. Test with a screen reader, a slow connection, and a narrow viewport. The best image workflow improves understanding and loading together.',
      ),
    ],
  },
]

async function seedData() {
  const transaction = client
    .transaction()
    .createOrReplace(author)

  for (const category of categories) {
    transaction.createOrReplace(category)
  }
  for (const post of posts) {
    transaction.createOrReplace(post)
  }

  await transaction.commit()
  console.log(
    `Seeded ${posts.length} articles, ${categories.length} topics, and 1 editorial author in dataset "${dataset}".`,
  )
  console.log(`Article slugs: ${posts.map((post) => post.slug.current).join(', ')}`)
}

seedData().catch((error: unknown) => {
  console.error('Sanity seed failed:', error)
  process.exitCode = 1
})
