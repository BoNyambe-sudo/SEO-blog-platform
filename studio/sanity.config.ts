import { defineConfig, type Config } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

const viteDefine: Record<string, string> = {}
for (const key of ['SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_DATASET', 'SANITY_STUDIO_PREVIEW_SECRET']) {
  viteDefine[`process.env.${key}`] = JSON.stringify(process.env[key])
}

const config: Config = {
  name: 'default',
  title: 'SEO Blog Platform',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.SANITY_PROJECT_ID || '',
  dataset: process.env.SANITY_STUDIO_DATASET || process.env.SANITY_DATASET || '',
  schema: { types: schemaTypes },
  plugins: [structureTool()],
  tools: (prev) => prev,
  vite: {
    envDir: '.',
    define: viteDefine,
  },
}

export default defineConfig(config)