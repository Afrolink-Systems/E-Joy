import { getSuperAdminAccessToken } from './apollo'

export const ORDER_SERVICE_ORIGIN =
  import.meta.env.VITE_ORDER_SERVICE_ORIGIN ??
  resolveOriginFromGraphqlUrl(import.meta.env.VITE_GRAPHQL_URL) ??
  'http://localhost:9602'

export async function uploadPlatformBannerImage(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  body.append('purpose', 'platform-banner')
  const token = getSuperAdminAccessToken()
  const res = await fetch(`${ORDER_SERVICE_ORIGIN}/upload/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
    body,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const data = (await res.json()) as { url?: string }
  if (!data?.url) throw new Error('Response missing url field')
  return data.url
}

function resolveOriginFromGraphqlUrl(value?: string): string | undefined {
  if (!value) return undefined
  try {
    return new URL(value).origin
  } catch {
    return undefined
  }
}
