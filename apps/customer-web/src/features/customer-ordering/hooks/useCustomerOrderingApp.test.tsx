import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCartStore } from '../../../store/useCartStore'
import { useCustomerOrderingApp } from './useCustomerOrderingApp'

const sessionState = vi.hoisted(() => ({
  clearSession: vi.fn(),
  hasTableSession: true,
  shopId: 'shop-1',
  tableRef: 'A1',
}))

const ordersState = vi.hoisted(() => ({
  clearRememberedOrders: vi.fn(),
  orders: [],
  ordersLoading: false,
  refetchOrders: vi.fn(),
  rememberOrderId: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('./useCustomerSessionContext', () => ({
  useCustomerSessionContext: () => sessionState,
}))

vi.mock('./useCustomerOrders', () => ({
  useCustomerOrders: () => ordersState,
}))

vi.mock('./useCustomerMenu', () => ({
  useCustomerMenu: () => ({
    categories: [],
    customerThemePreset: 'ejoy-default',
    customerThemeVars: {},
    error: undefined,
    loading: false,
    menuRows: [],
    refetch: vi.fn(),
    shopName: 'E-Joy',
    visibleRows: [],
  }),
}))

vi.mock('./useTelebirrCheckout', () => ({
  useTelebirrCheckout: () => ({
    checkoutLoading: false,
    checkoutPhase: 'idle',
    payWithTelebirr: vi.fn(),
  }),
}))

describe('useCustomerOrderingApp', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    sessionState.hasTableSession = true
    sessionState.clearSession.mockImplementation(() => {
      sessionState.hasTableSession = false
    })
    useCartStore.setState({ items: [] })
  })

  it('fully resets local visit state when confirming end session', () => {
    useCartStore.getState().addItem({
      id: 'p1',
      name: 'Chicken tibs',
      price: 1250,
      quantity: 2,
    })
    localStorage.setItem('ejoy_customer_active_tab', 'orders')
    const { result } = renderHook(() => useCustomerOrderingApp())

    act(() => {
      result.current.confirmEndSession()
    })

    expect(sessionState.clearSession).toHaveBeenCalledTimes(1)
    expect(ordersState.clearRememberedOrders).toHaveBeenCalledTimes(1)
    expect(useCartStore.getState().items).toEqual([])
    expect(localStorage.getItem('ejoy_customer_active_tab')).toBeNull()
    expect(result.current.activeTab).toBe('home')
  })
})
