import { useQuery } from '@apollo/client/react'
import { useEffect, useMemo } from 'react'
import { CUSTOMER_SHOP, type CustomerShopRow } from '../../../graphql/customerShop'
import { SHOP_MENU } from '../../../graphql/shopMenu'
import {
  getCustomerThemeVars,
  resolveCustomerThemePreset,
} from '../../../lib/customerTheme'
import type { MenuCategory, MenuItem } from '../customer-ordering.types'

type UseCustomerMenuParams = {
  hasTableSession: boolean
  search: string
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  shopId: string
}

export function useCustomerMenu({
  hasTableSession,
  search,
  selectedCategory,
  setSelectedCategory,
  shopId,
}: UseCustomerMenuParams) {
  const menuQuery = useQuery<{ shopMenu: MenuItem[] }>(SHOP_MENU, {
    variables: { shopId },
    skip: !hasTableSession,
    fetchPolicy: 'cache-and-network',
  })

  const shopQuery = useQuery<{ customerShop: CustomerShopRow | null }>(
    CUSTOMER_SHOP,
    {
      variables: { shopId },
      skip: !hasTableSession,
      fetchPolicy: 'cache-and-network',
    },
  )

  const menuRows = useMemo(
    () => menuQuery.data?.shopMenu ?? [],
    [menuQuery.data?.shopMenu],
  )

  const categories = useMemo<MenuCategory[]>(() => {
    const byName = new Map<string, MenuCategory>()
    for (const row of menuRows) {
      const name = row.categoryMeta.name
      const current = byName.get(name)
      const next: MenuCategory = {
        id: row.categoryMeta.id ?? row.categoryId ?? current?.id,
        name,
        iconKey: row.categoryMeta.iconKey ?? current?.iconKey,
        color: row.categoryMeta.color ?? current?.color,
        sortOrder: row.categoryMeta.sortOrder ?? current?.sortOrder ?? 999,
      }
      byName.set(name, next)
    }
    const values = Array.from(byName.values()).sort((a, b) => {
      const order = (a.sortOrder ?? 999) - (b.sortOrder ?? 999)
      return order || a.name.localeCompare(b.name)
    })
    return [{ name: 'All', iconKey: 'grid', sortOrder: -1 }, ...values]
  }, [menuRows])

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return menuRows.filter((row) => {
      const inCategory =
        selectedCategory === 'All' || row.categoryMeta.name === selectedCategory
      const inSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.categoryMeta.name.toLowerCase().includes(query)
      return inCategory && inSearch
    })
  }, [menuRows, search, selectedCategory])

  useEffect(() => {
    if (selectedCategory === 'All') return
    if (!categories.some((category) => category.name === selectedCategory)) {
      setSelectedCategory('All')
    }
  }, [categories, selectedCategory, setSelectedCategory])

  const shop = shopQuery.data?.customerShop ?? null

  return {
    categories,
    customerThemePreset: resolveCustomerThemePreset(shop?.customerThemePreset),
    customerThemeVars: getCustomerThemeVars(shop?.customerThemeOverrides),
    error: menuQuery.error,
    loading: menuQuery.loading,
    menuRows,
    refetch: menuQuery.refetch,
    shopName: shop?.name?.trim() || 'E-Joy Restaurant',
    visibleRows,
  }
}
