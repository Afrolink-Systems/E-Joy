import { describe, expect, it } from 'vitest'
import {
  formatOrderBirr,
  orderNeedsPayment,
  statusLabel,
  statusVariant,
} from './order-detail.utils'

describe('order detail utilities', () => {
  it('formats order money with two decimals', () => {
    expect(formatOrderBirr(1200)).toBe('12 ETB')
    expect(formatOrderBirr(1250)).toBe('12.50 ETB')
  })

  it('detects statuses that need payment', () => {
    expect(orderNeedsPayment('PENDING_PAYMENT')).toBe(true)
    expect(orderNeedsPayment('draft')).toBe(true)
    expect(orderNeedsPayment('PENDING')).toBe(false)
    expect(orderNeedsPayment('PAID')).toBe(false)
  })

  it('maps order statuses to labels and badge variants', () => {
    expect(statusLabel('PREPARING')).toBe('Preparing')
    expect(statusLabel('PENDING')).toBe('Order sent')
    expect(statusLabel('PENDING_PAYMENT')).toBe('Payment pending')
    expect(statusVariant('CANCELLED')).toBe('destructive')
    expect(statusVariant('COMPLETED')).toBe('default')
    expect(statusVariant('READY')).toBe('outline')
  })
})
