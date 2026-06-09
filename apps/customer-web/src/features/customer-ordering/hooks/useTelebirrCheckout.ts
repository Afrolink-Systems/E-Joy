import { useMutation } from '@apollo/client/react'
import { CREATE_ORDER_MUTATION } from '../../../graphql/createOrder'
import {
  INITIATE_PAYMENT_MUTATION,
  type InitiatePaymentData,
} from '../../../graphql/initiatePayment'
import { useState } from 'react'
import type { CartItem } from '../../../store/useCartStore'
import type { CreatedOrderModel, CreateOrderData } from '../customer-ordering.types'

type UseTelebirrCheckoutParams = {
  cart: CartItem[]
  hasTableSession: boolean
  note: string
  onCheckoutCreated: (order: CreatedOrderModel) => Promise<void>
  shopId: string
  tableRef: string
}

export type CheckoutPhase =
  | 'idle'
  | 'creating_order'
  | 'contacting_telebirr'
  | 'opening_checkout'
  | 'failed'

export function useTelebirrCheckout({
  cart,
  hasTableSession,
  note,
  onCheckoutCreated,
  shopId,
  tableRef,
}: UseTelebirrCheckoutParams) {
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>('idle')
  const [createOrder, { loading: checkoutLoading }] =
    useMutation<CreateOrderData>(CREATE_ORDER_MUTATION)
  const [initiatePayment, { loading: paymentLoading }] =
    useMutation<InitiatePaymentData>(INITIATE_PAYMENT_MUTATION)

  async function payWithTelebirr() {
    if (!cart.length || !hasTableSession) return
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
      setCheckoutPhase('contacting_telebirr')
      const paymentResult = await initiatePayment({
        variables: {
          input: {
            orderId: payload.order.id,
            channel: 'TELEBIRR_H5',
          },
        },
      })
      const paymentPayload = paymentResult.data?.initiatePayment
      const toPayUrl = paymentPayload?.toPayUrl ?? paymentPayload?.rawRequest
      if (!paymentPayload?.ok || !toPayUrl) {
        const message =
          paymentPayload?.error?.message ??
          paymentPayload?.error?.code ??
          'Could not start Telebirr checkout.'
        throw new Error(message)
      }
      setCheckoutPhase('opening_checkout')
      openTelebirrCheckout(toPayUrl)
      window.setTimeout(() => setCheckoutPhase('idle'), 900)
    } catch (error) {
      setCheckoutPhase('failed')
      throw error
    }
  }

  return {
    checkoutPhase,
    checkoutLoading: checkoutLoading || paymentLoading,
    payWithTelebirr,
  }
}

function openTelebirrCheckout(toPayUrl: string) {
  try {
    const anchor = document.createElement('a')
    anchor.href = toPayUrl
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer external'
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } catch {
    window.location.href = toPayUrl
  }
}
