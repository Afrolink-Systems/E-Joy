import { useMutation } from '@apollo/client/react'
import {
  CONFIRM_MOCK_TELEBIRR_PAYMENT,
  type ConfirmMockTelebirrPaymentData,
} from '../../../graphql/confirmMockTelebirrPayment'
import { CREATE_ORDER_MUTATION } from '../../../graphql/createOrder'
import { useState } from 'react'
import type { CartItem } from '../../../store/useCartStore'
import type { CreatedOrderModel, CreateOrderData } from '../customer-ordering.types'

const MOCK_TELEBIRR_DELAY_MS = 3000

type UseTelebirrCheckoutParams = {
  cart: CartItem[]
  hasTableSession: boolean
  note: string
  onCheckoutCreated: (order: CreatedOrderModel) => Promise<void>
  onMockPaymentSuccess: (order: CreatedOrderModel) => Promise<void> | void
  shopId: string
  tableRef: string
}

export type CheckoutPhase =
  | 'idle'
  | 'creating_order'
  | 'mock_payment'
  | 'success'
  | 'failed'

export function useTelebirrCheckout({
  cart,
  hasTableSession,
  note,
  onCheckoutCreated,
  onMockPaymentSuccess,
  shopId,
  tableRef,
}: UseTelebirrCheckoutParams) {
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('idle')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartItem[]>([])
  const [createOrder, { loading: checkoutLoading }] =
    useMutation<CreateOrderData>(CREATE_ORDER_MUTATION)
  const [confirmMockPayment] = useMutation<ConfirmMockTelebirrPaymentData>(
    CONFIRM_MOCK_TELEBIRR_PAYMENT,
  )

  async function payWithTelebirr() {
    if (!cart.length || !hasTableSession) return
    const snapshot = cart.map((item) => ({ ...item }))
    setCheckoutSnapshot(snapshot)
    setCheckoutError(null)
    setCheckoutPhase('creating_order')
    const idempotencyKey =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `idem_${Date.now()}_${Math.random().toString(36).slice(2)}`
    try {
      const result = await createOrder({
        variables: {
          input: {
            shopId,
            tableId: tableRef,
            tableNumber: tableRef,
            idempotencyKey,
            paymentMethod: 'TELEBIRR',
            deliveryType: 'DINE_IN',
            note: note.trim() || undefined,
            items: cart.map((item) => ({
              productId: item.id,
              amount: item.quantity,
              remark: item.remark?.trim() || undefined,
            })),
          },
        },
      })
      const payload = result.data?.createOrder
      if (!payload?.ok || !payload.order?.id) {
        const message =
          payload?.error?.message ?? payload?.error?.code ?? 'Could not create order.'
        throw new Error(message)
      }
      await onCheckoutCreated(payload.order)
      setCheckoutPhase('mock_payment')
      await waitForMockPayment()
      const confirmed = await confirmMockPayment({
        variables: { orderId: payload.order.id },
      })
      if (!confirmed.data?.confirmMockTelebirrPayment) {
        throw new Error('Payment confirmation failed')
      }
      await onMockPaymentSuccess(payload.order)
      setCheckoutPhase('success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment failed'
      setCheckoutError(message)
      setCheckoutPhase('failed')
    }
  }

  function resetCheckout() {
    setCheckoutPhase('idle')
    setCheckoutError(null)
    setCheckoutSnapshot([])
  }

  return {
    checkoutError,
    checkoutPhase,
    checkoutLoading,
    checkoutSnapshot,
    payWithTelebirr,
    resetCheckout,
  }
}

function waitForMockPayment() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_TELEBIRR_DELAY_MS)
  })
}
