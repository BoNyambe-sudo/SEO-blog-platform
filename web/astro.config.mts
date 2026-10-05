import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import sitemap from '@astrojs/sitemap'
import tailwind from '@tailwindcss/vite'
import sanity from '@sanity/astro'

export default defineConfig({
  site: process.env.SITE_URL,

  output: 'hybrid',

  adapter: vercel({
    isr: {
      expiration: 60 * 60 * 24 * 7,
      bypassToken: process.env.VERCEL_REVALIDATE_TOKEN,
    },
  }),

  integrations: [
    sanity({
      projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.PUBLIC_SANITY_DATASET,
      apiVersion: process.env.PUBLIC_SANITY_API_VERSION,
      useCdn: false,
    }),
    sitemap({
      entryNames: {
        'blog/[slug]': 'blog/[slug]',
      },
      changefreq: {
        'blog/*': 'daily',
      },
    }),
    tailwind(),
  ],

  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            fuse: ['fuse.js'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['fuse.js', 'clsx', 'reading-time'],
    },
  },

  image: {
    service: {
      entrypoint: 'astro/assets/services/vercel',
    },
  },

  redirects: {
    '/web': '/',
  },
})
