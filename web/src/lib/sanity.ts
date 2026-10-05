import { createClient } from '@sanity/client'

function createSanityClient() {
  const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID
  const dataset = import.meta.env.PUBLIC_SANITY_DATASET
  const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION

  if (!projectId || !dataset || !apiVersion) {
    return null
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    stega: false,
  })
}

export const client = createSanityClient()
