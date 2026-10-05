# SEO Blog Platform

Production-ready, content-first SEO blog platform built with Astro 7.x and Sanity Studio v3.

## Tech Stack

- **Frontend**: Astro 7.x (SSG + ISR)
- **CMS**: Sanity Studio v3
- **Styling**: Tailwind CSS v4
- **Search**: Fuse.js (client-side fuzzy search)
- **Deployment**: Vercel with on-demand ISR

## Prerequisites

- Node.js >= 22.12.0
- pnpm >= 9
- Sanity account

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Configure Sanity project IDs in `.env`

4. Start development servers:
   ```bash
   pnpm dev
   ```

   Or run separately:
   ```bash
   pnpm dev:web
   pnpm dev:studio
   ```

5. Seed initial data (requires Sanity write token):
   ```bash
   pnpm seed
   ```

## Project Structure

```
seo-blog-platform/
├── web/                      # Astro frontend
│   ├── src/
│   │   ├── pages/           # Routes
│   │   ├── components/      # Reusable components
│   │   ├── layouts/         # Layout templates
│   │   └── lib/             # Utilities, queries, config
│   └── static/              # Static assets
├── studio/                   # Sanity Studio
│   ├── schemas/             # Content schemas
│   ├── lib/                 # Seed script
│   └── sanity.config.ts     # Studio config
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace packages
└── .env.example             # Environment variables
```

## Scripts

- `pnpm dev` - Run all dev servers
- `pnpm dev:web` - Run Astro dev server
- `pnpm dev:studio` - Run Sanity Studio
- `pnpm build` - Build web app
- `pnpm seed` - Seed Sanity with sample data
- `pnpm studio:deploy` - Deploy Sanity Studio

## Deployment

### Vercel (Web)

1. Connect repository to Vercel
2. Set root directory to `web/` (or use monorepo settings)
3. Build command: `pnpm --filter web build`
4. Output directory: `web/dist`
5. Add environment variables from `.env.example`

### Sanity Studio

```bash
pnpm studio:deploy
```

## License

MIT
