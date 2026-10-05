import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  apiVersion: '2026-03-01',
  useCdn: false,
})

async function verifySchemas() {
  const types = await client.fetch('*[_type in ["post", "author", "category"]][0...10]')
  console.log('Fetched documents:', types.length)
  console.log(JSON.stringify(types, null, 2))
}

verifySchemas().catch((err) => {
  console.error('Verification failed:', err)
  process.exit(1)
})
