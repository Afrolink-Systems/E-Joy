import { toast } from 'sonner'
import type { OrderStatusVariant } from './order-detail.types'

export const ORDER_DETAIL_PLACEHOLDER_IMG =
  'https://picsum.photos/seed/ejoy-order-item/320/320'

export function formatOrderBirr(cents: number): string {
  const value = cents / 100
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2)} ETB`
}

export function resolveOrderProductImageUrl(url: string | null | undefined): string {
  if (!url || !url.trim()) return ORDER_DETAIL_PLACEHOLDER_IMG
  const value = url.trim()
  if (/^https?:\/\//i.test(value)) return value
  const origin =
    import.meta.env.VITE_ORDER_SERVICE_ORIGIN?.replace(/\/$/, '') ?? 'http://localhost:9602'
  return `${origin}${value.startsWith('/') ? value : `/${value}`}`
}

export function orderNeedsPayment(status: string): boolean {
  const normalized = status.toUpperCase()
  return normalized === 'PENDING_PAYMENT' || normalized === 'DRAFT'
}

export function statusLabel(status: string): string {
  const normalized = status.toUpperCase()
  if (normalized === 'COMPLETED') return 'Completed'
  if (normalized === 'CANCELLED') return 'Cancelled'
  if (normalized === 'READY') return 'Ready for pickup'
  if (normalized === 'PREPARING') return 'Preparing'
  if (normalized === 'PAID') return 'Paid'
  if (normalized === 'PENDING') return 'Order sent'
  if (normalized === 'PENDING_PAYMENT') return 'Payment pending'
  if (normalized === 'DRAFT') return 'Order started'
  return 'Order received'
}

export function statusVariant(status: string): OrderStatusVariant {
  const normalized = status.toUpperCase()
  if (normalized === 'CANCELLED') return 'destructive'
  if (normalized === 'COMPLETED' || normalized === 'PAID') return 'default'
  if (orderNeedsPayment(status)) return 'secondary'
  return 'outline'
}

export function copyOrderNumber(text: string): void {
  void navigator.clipboard.writeText(text).then(
    () => toast.success('Order number copied'),
    () => {
      window.prompt('Copy order number:', text)
    },
  )
}
