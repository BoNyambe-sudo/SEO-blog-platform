# SEO Blog Platform

Production-ready, content-first SEO blog platform built with Astro 7.x and Sanity Studio v3. Optimized for search visibility, Core Web Vitals, and fast first loads.

## Tech Stack

- **Frontend**: Astro 7.x (server output + Vercel on-demand ISR)
- **CMS**: Sanity Studio v3 (standalone)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Rich content**: `astro-portabletext` with custom blocks (code, callout, YouTube, image)
- **Search**: Fuse.js (client-side fuzzy search, lazy-loaded)
- **Images**: `@sanity/image-url` CDN transforms
- **Deployment**: Vercel with on-demand ISR + Sanity webhook revalidation

## Prerequisites

- Node.js >= 22.12.0
- pnpm >= 9 (`corepack enable` if needed)
- A Sanity account and project

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Fill in your Sanity project ID and dataset in `.env`:

   ```
   SANITY_PROJECT_ID=your_project_id
   SANITY_DATASET=production
   SANITY_STUDIO_PROJECT_ID=your_project_id
   SANITY_STUDIO_DATASET=production
   SITE_URL=https://your-domain.com
   ```

4. Start the development servers:

   ```bash
   pnpm dev          # both web + studio
   pnpm dev:web      # Astro only (http://localhost:4321)
   pnpm dev:studio   # Sanity Studio only (http://localhost:3333)
   ```

5. Seed the dataset with sample content (requires a Sanity write token):

   ```bash
   pnpm seed
   ```

   This creates 1 author, 5 categories, and 5 fully-written articles with code blocks, callouts, and structured SEO fields.

## Project Structure

```
seo-blog-platform/
├── web/                      # Astro frontend
│   ├── src/
│   │   ├── pages/            # Routes (index, blog, category, author, api, sitemap, rss, robots)
│   │   ├── components/       # Reusable components
│   │   ├── layouts/          # Layout template
│   │   ├── lib/              # Sanity client, GROQ queries, SEO/utils helpers
│   │   └── styles/           # Tailwind v4 + prose styles
│   ├── scripts/              # Asset generation (favicons, OG image)
│   └── static/               # favicon.ico/svg, apple-touch-icon.png, og-default.png/svg
├── studio/                   # Sanity Studio
│   ├── schemas/              # post, author, category + block types (code, youtube, callout)
│   └── lib/                  # Seed script
├── package.json              # Root workspace config
├── pnpm-workspace.yaml
└── .env.example
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run all dev servers |
| `pnpm dev:web` | Run Astro dev server |
| `pnpm dev:studio` | Run Sanity Studio |
| `pnpm build` | Build the web app |
| `pnpm preview` | Preview the production build |
| `pnpm seed` | Seed Sanity with sample data |
| `pnpm studio:deploy` | Deploy Sanity Studio to sanity.io |

## SEO Features

- Per-page `<title>`, meta description, canonical URL, Open Graph, and Twitter Card tags
- JSON-LD `BlogPosting` structured data on every article
- Sanity-driven `sitemap.xml` (always current, includes posts/topics/authors with `lastmod`)
- Dynamic `robots.txt` with the correct sitemap URL
- RSS feed at `/rss.xml`
- Explicit image `width`/`height` and descriptive `alt` text (enforced in the Studio schema)
- SEO title/description overrides editable per post in the Studio
- Heading anchors synchronized with the table of contents

## Performance

- Server-rendered HTML with zero client JavaScript for content
- Prerendered homepage; ISR-cached dynamic pages (7-day edge cache)
- Lazy-loaded Fuse.js search bundle, fetched on first interaction
- Google Fonts (Inter) with preconnect and `display=swap`
- Sanity CDN image transforms (AVIF/WebP, responsive widths)
- Dark/light theme with `localStorage` persistence and system preference

## Deployment

### Web (Vercel)

1. Connect the repository to Vercel (root directory: `web/`, or configure the monorepo root).
2. Build command: `pnpm --filter web build`
3. Output directory: `web/dist`
4. Set environment variables in the Vercel dashboard (from `.env.example`):
   - `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_VERSION`
   - `SITE_URL` (production domain)
   - `VERCEL_REVALIDATE_TOKEN` (generate with `openssl rand -hex 32`)
   - `SANITY_WEBHOOK_SECRET` (generate with `openssl rand -hex 16`)

### Sanity Studio

```bash
pnpm studio:deploy
```

### ISR webhook

In Sanity dashboard → Project Settings → API → Webhooks:

- **Name**: `Vercel ISR Revalidation`
- **URL**: `https://your-domain.com/api/revalidate`
- **Trigger on**: Create, Update, Delete, Publish, Unpublish
- **HTTP method**: POST
- **Headers**: `x-sanity-webhook-secret: <SANITY_WEBHOOK_SECRET>`
- **Filter**: `_type == "post" || _type == "category" || _type == "author"`

The endpoint verifies the secret, maps the changed document to affected routes (article, topic, author, home, listing), and purges them through Vercel's on-demand revalidation API.

## Regenerating static assets

The favicons and OG image are generated by a dependency-free Node script:

```bash
cd web && node scripts/generate-assets.mjs
```

## License

MIT
