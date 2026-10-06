import { defineConfig } from 'astro/config'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import vercel from '@astrojs/vercel'
import tailwind from '@tailwindcss/vite'

const workspaceRoot = resolve(process.cwd(), '..')
const envFile = resolve(workspaceRoot, '.env')

if (existsSync(envFile)) {
  loadEnvFile(envFile)
}

const projectId =
  process.env.PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  ''
const dataset =
  process.env.PUBLIC_SANITY_DATASET ||
  process.env.SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  ''
const apiVersion =
  process.env.PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-03-01'
const siteUrl = process.env.SITE_URL || 'http://localhost:4321'

export default defineConfig({
  site: siteUrl,
  publicDir: 'static',
  output: 'server',

  adapter: vercel({
    isr: {
      expiration: 60 * 60 * 24 * 7,
      bypassToken: process.env.VERCEL_REVALIDATE_TOKEN,
    },
  }),

  vite: {
    plugins: [tailwind()],
    define: {
      'import.meta.env.PUBLIC_SANITY_PROJECT_ID': JSON.stringify(projectId),
      'import.meta.env.PUBLIC_SANITY_DATASET': JSON.stringify(dataset),
      'import.meta.env.PUBLIC_SANITY_API_VERSION': JSON.stringify(apiVersion),
      'import.meta.env.SITE_URL': JSON.stringify(siteUrl),
    },
    optimizeDeps: {
      include: ['fuse.js', 'clsx', 'reading-time'],
    },
  },

  redirects: {
    '/web': '/',
  },
})
