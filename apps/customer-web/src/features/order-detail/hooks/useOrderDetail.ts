import { useQuery } from '@apollo/client/react'
import { CUSTOMER_SHOP, type CustomerShopRow } from '../../../graphql/customerShop'
import { GET_ORDER_QUERY, type OrderDetailData } from '../../../graphql/getOrder'
import {
  getCustomerThemeVars,
  resolveCustomerThemePreset,
} from '../../../lib/customerTheme'
import { readTableSessionFromLocalStorage } from '../../../store/useTableSessionStore'

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

  return {
    error: query.error,
    loading: query.loading,
    order,
    refetch: query.refetch,
    themePreset: resolveCustomerThemePreset(shop?.customerThemePreset),
    themeVars: getCustomerThemeVars(shop?.customerThemeOverrides),
  }
}
