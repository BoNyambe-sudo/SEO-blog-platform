import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  const sanityConfigured = Boolean(
    import.meta.env.PUBLIC_SANITY_PROJECT_ID && import.meta.env.PUBLIC_SANITY_DATASET,
  )

  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      sanity: sanityConfigured ? 'configured' : 'missing-credentials',
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
  )
}
