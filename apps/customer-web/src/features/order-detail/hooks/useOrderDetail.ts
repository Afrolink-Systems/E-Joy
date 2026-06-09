import { useQuery } from '@apollo/client/react'
import { toast } from 'sonner'
import { CUSTOMER_SHOP, type CustomerShopRow } from '../../../graphql/customerShop'
import { GET_ORDER_QUERY, type OrderDetailData } from '../../../graphql/getOrder'
import {
  getCustomerThemeVars,
  resolveCustomerThemePreset,
} from '../../../lib/customerTheme'
import { buildMockTelebirrRedirectUrl } from '../../../lib/mockTelebirrRedirectUrl'
import { readTableSessionFromLocalStorage } from '../../../store/useTableSessionStore'
import { orderNeedsPayment } from '../order-detail.utils'

export function useOrderDetail(orderId: string) {
  const tableSession = readTableSessionFromLocalStorage()
  const query = useQuery<OrderDetailData>(GET_ORDER_QUERY, {
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: 'network-only',
  })
  const shopQuery = useQuery<{ customerShop: CustomerShopRow | null }>(
    CUSTOMER_SHOP,
    {
      variables: { shopId: tableSession.shopId ?? '' },
      skip: !tableSession.shopId,
      fetchPolicy: 'cache-and-network',
    },
  )
  const order = query.data?.getOrder ?? null
  const shop = shopQuery.data?.customerShop ?? null

  function payWithTelebirr() {
    if (!order?.id) return
    try {
      window.location.href = buildMockTelebirrRedirectUrl(order.id, order.totalAmount)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Telebirr payment failed')
    }
  }

  return {
    error: query.error,
    loading: query.loading,
    needsPayment: order ? orderNeedsPayment(order.status) : false,
    order,
    payWithTelebirr,
    refetch: query.refetch,
    themePreset: resolveCustomerThemePreset(shop?.customerThemePreset),
    themeVars: getCustomerThemeVars(shop?.customerThemeOverrides),
  }
}
