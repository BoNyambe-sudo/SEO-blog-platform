import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './sanity'

let builder: ReturnType<typeof createImageUrlBuilder> | null = null

export function urlFor(source: any) {
  if (!client) {
    throw new Error(
      'Sanity is not configured. Set SANITY_PROJECT_ID and SANITY_DATASET in the workspace environment.',
    )
  }
  if (!builder) {
    builder = createImageUrlBuilder(client)
  }
  return builder.image(source)
}
