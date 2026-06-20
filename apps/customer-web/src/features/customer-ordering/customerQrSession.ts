export type QrSession = {
  shopId: string
  table: string
}

type RawQrPayload = {
  shopId?: unknown
  shopID?: unknown
  shop?: unknown
  table?: unknown
  tableId?: unknown
  tableID?: unknown
  tableNumber?: unknown
  tableNo?: unknown
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ''
}

function parseJsonSession(trimmed: string): QrSession | null {
  try {
    const parsed = JSON.parse(trimmed) as RawQrPayload
    const shopId = firstString(parsed.shopId, parsed.shopID, parsed.shop)
    const table = firstString(
      parsed.table,
      parsed.tableNumber,
      parsed.tableNo,
      parsed.tableId,
      parsed.tableID,
    )
    if (shopId && table) return { shopId, table }
  } catch {
    /* QR is commonly a URL, not JSON. */
  }
  return null
}

function getParam(params: URLSearchParams, ...keys: string[]): string {
  for (const key of keys) {
    const value = params.get(key)?.trim()
    if (value) return value
  }
  return ''
}

function parseUrlSession(trimmed: string): QrSession | null {
  try {
    const url = new URL(trimmed, window.location.origin)
    const params = new URLSearchParams(url.search)

    if (url.hash.includes('?')) {
      const hashQuery = url.hash.slice(url.hash.indexOf('?') + 1)
      new URLSearchParams(hashQuery).forEach((value, key) => {
        if (!params.has(key)) params.set(key, value)
      })
    }

    const shopId = getParam(params, 'shopId', 'shopID', 'shop')
    const table = getParam(
      params,
      'table',
      'tableNumber',
      'tableNo',
      'tableId',
      'tableID',
    )
    if (shopId && table) return { shopId, table }
  } catch {
    /* invalid URL */
  }
  return null
}

export function parseQrSession(rawValue: string): QrSession | null {
  const trimmed = rawValue.trim()
  if (!trimmed) return null

  return parseJsonSession(trimmed) ?? parseUrlSession(trimmed)
}
