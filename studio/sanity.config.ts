import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

const envFile = resolve(process.cwd(), '..', '.env')
if (existsSync(envFile)) {
  loadEnvFile(envFile)
}

export default defineConfig({
  name: 'default',
  title: 'SEO Blog Platform',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  schema: { types: schemaTypes },
  plugins: [structureTool()],
  tools: (prev) => prev,
})
