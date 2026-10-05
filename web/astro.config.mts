//@ts-ignore
import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import tailwind from '@tailwindcss/vite'
import sanity from '@sanity/astro'

export default defineConfig({
  site: process.env.SITE_URL,

  output: 'static',

  adapter: vercel({
    isr: {
      expiration: 60 * 60 * 24 * 7,
      bypassToken: process.env.VERCEL_REVALIDATE_TOKEN,
    },
  }),

  integrations: [
    sitemap({
      entryNames: {
        'blog/[slug]': 'blog/[slug]',
      },
      changefreq: {
        'blog/*': 'daily',
      } as const,
    }),
  ],

  vite: {
    plugins: [tailwind()],
    optimizeDeps: {
      include: ['fuse.js', 'clsx', 'reading-time'],
    },
  },

  redirects: {
    '/web': '/',
  },
})
