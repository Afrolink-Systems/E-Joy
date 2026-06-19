import { useState } from 'react'
import {
  clearCustomerOrderIds,
  persistCustomerOrderIds,
  readCustomerOrderIds,
} from '../customer-ordering.utils'

export function useCustomerOrders() {
  const [customerOrderIds, setCustomerOrderIds] = useState<string[]>(() =>
    readCustomerOrderIds(),
  )

  function rememberOrderId(orderId: string) {
    const nextOrderIds = [
      orderId,
      ...customerOrderIds.filter((id) => id !== orderId),
    ]
    setCustomerOrderIds(() => {
      persistCustomerOrderIds(nextOrderIds)
      return nextOrderIds
    })
    return nextOrderIds
  }

  function clearRememberedOrders() {
    clearCustomerOrderIds()
    setCustomerOrderIds([])
  }

  return {
    clearRememberedOrders,
    customerOrderIds,
    rememberOrderId,
  }
}
