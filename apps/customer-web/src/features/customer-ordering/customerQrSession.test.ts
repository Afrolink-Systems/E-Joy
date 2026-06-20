import { describe, expect, it } from 'vitest'
import { parseQrSession } from './customerQrSession'

describe('parseQrSession', () => {
  it('reads the current production table QR URL', () => {
    expect(
      parseQrSession(
        'https://ejoy-customer-web.vercel.app/?shopId=test-shop-001&table=Hall+A1',
      ),
    ).toEqual({ shopId: 'test-shop-001', table: 'Hall A1' })
  })

  it('accepts JSON table payloads', () => {
    expect(
      parseQrSession(
        JSON.stringify({ shopId: 'test-shop-001', tableNumber: 'Hall A1' }),
      ),
    ).toEqual({ shopId: 'test-shop-001', table: 'Hall A1' })
  })

  it('accepts common alternate parameter names', () => {
    expect(
      parseQrSession('/?shop=test-shop-001&tableNumber=Hall%20A1'),
    ).toEqual({ shopId: 'test-shop-001', table: 'Hall A1' })
  })

  it('accepts hash-routed URLs with query params', () => {
    expect(
      parseQrSession(
        'https://ejoy-customer-web.vercel.app/#/order?shopId=test-shop-001&tableId=Hall%20A1',
      ),
    ).toEqual({ shopId: 'test-shop-001', table: 'Hall A1' })
  })
})
