import { useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { CUSTOMER_ORDERS, type CustomerOrdersData } from '../../../graphql/customerAuth'
import { GET_ORDERS_QUERY, type GetOrdersData } from '../../../graphql/getOrders'
import {
  clearCustomerOrderIds,
  persistCustomerOrderIds,
  readCustomerOrderIds,
} from '../customer-ordering.utils'

type UseCustomerOrdersParams = {
  hasTableSession: boolean
  signedIn: boolean
}

export function useCustomerOrders({ hasTableSession, signedIn }: UseCustomerOrdersParams) {
  const [customerOrderIds, setCustomerOrderIds] = useState<string[]>(() =>
    readCustomerOrderIds(),
  )

  const guestQuery = useQuery<GetOrdersData>(GET_ORDERS_QUERY, {
    skip: !hasTableSession || signedIn,
    variables: { ids: customerOrderIds },
    fetchPolicy: 'cache-and-network',
  })
  const accountQuery = useQuery<CustomerOrdersData>(CUSTOMER_ORDERS, {
    skip: !signedIn,
    fetchPolicy: 'cache-and-network',
  })

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

  function refetchOrders(variables?: { ids: string[] }) {
    return signedIn
      ? accountQuery.refetch()
      : guestQuery.refetch(variables)
  }

  return {
    clearRememberedOrders,
    customerOrderIds,
    orders: signedIn ? (accountQuery.data?.customerOrders ?? []) : (guestQuery.data?.getOrders ?? []),
    ordersLoading: signedIn ? accountQuery.loading : guestQuery.loading,
    refetchOrders,
    rememberOrderId,
  }
}
