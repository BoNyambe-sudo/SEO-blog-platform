import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get('x-sanity-webhook-secret')

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()

  function extractPathsFromPayload(payload: any): string[] {
    const { _type, slug } = payload
    if (!slug?.current) return ['/']

    switch (_type) {
      case 'post':
        return [`/blog/${slug.current}`, '/blog/1/', '/']
      case 'category':
        return [`/category/${slug.current}`, '/']
      case 'author':
        return [`/author/${slug.current}`]
      default:
        return ['/']
    }
  }

  const pathsToRevalidate = extractPathsFromPayload(body)

  for (const path of pathsToRevalidate) {
    const res = await fetch(`${process.env.SITE_URL}${path}`, {
      method: 'GET',
      headers: {
        'x-prerender-revalidate': process.env.VERCEL_REVALIDATE_TOKEN!,
      },
    })
    if (!res.ok) {
      console.error(`Failed to revalidate ${path}: ${res.status}`)
    }
  }

  return new Response(JSON.stringify({ revalidated: true, paths: pathsToRevalidate }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
