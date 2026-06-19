import { getOrderServiceHttpOrigin } from '../../lib/mockTelebirrRedirectUrl'
import { CUSTOMER_ORDER_IDS_KEY } from '../../lib/customerLocalData'

export { CUSTOMER_ORDER_IDS_KEY }

export const PLACEHOLDER_FOOD =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=420&q=80'

export function readCustomerOrderIds(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDER_IDS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

export function persistCustomerOrderIds(ids: string[]): void {
  localStorage.setItem(CUSTOMER_ORDER_IDS_KEY, JSON.stringify(ids.slice(0, 50)))
}

export function clearCustomerOrderIds(): void {
  try {
    localStorage.removeItem(CUSTOMER_ORDER_IDS_KEY)
  } catch {
    /* ignore storage restrictions */
  }
}

export function formatBirr(cents: number): string {
  const amount = cents / 100
  return `${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)} ETB`
}

export function resolveProductImageUrl(url: string | null | undefined): string {
  if (!url?.trim()) return PLACEHOLDER_FOOD
  const value = url.trim()
  if (/^https?:\/\//i.test(value)) return value
  const path = value.startsWith('/') ? value : `/${value}`
  return `${getOrderServiceHttpOrigin()}${path}`
}

export function buildCartKey(productId: string, remark?: string): string {
  return `${productId}::${remark?.trim() ?? ''}`
}

