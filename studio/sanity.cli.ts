import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import { defineCliConfig } from 'sanity/cli'

const envFile = resolve(process.cwd(), '..', '.env')
if (existsSync(envFile)) {
  loadEnvFile(envFile)
}

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET!,
  },
})
