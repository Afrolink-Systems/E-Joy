import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomerOrderingPage } from './CustomerOrderingPage'

const useCustomerOrderingAppMock = vi.hoisted(() => vi.fn())

vi.mock('./hooks/useCustomerOrderingApp', () => ({
  useCustomerOrderingApp: useCustomerOrderingAppMock,
}))

vi.mock('./components/HomeScreen', () => ({
  HomeScreen: () => <div>Home screen</div>,
}))

vi.mock('./components/MenuScreen', () => ({
  MenuScreen: () => <div>Menu screen</div>,
}))

vi.mock('./components/OrdersScreen', () => ({
  OrdersScreen: () => <div>Orders screen</div>,
}))

vi.mock('./components/CheckoutCartDrawer', () => ({
  CheckoutCartDrawer: () => null,
}))

vi.mock('./components/ItemDetailDrawer', () => ({
  ItemDetailDrawer: () => null,
}))

vi.mock('./components/ShopInfoDrawer', () => ({
  ShopInfoDrawer: () => null,
}))

function buildState(overrides: Record<string, unknown> = {}) {
  return {
    activeTab: 'menu',
    addItem: vi.fn(),
    cart: [],
    cartOpen: false,
    categories: [],
    checkoutLoading: false,
    checkoutPhase: 'idle',
    clearCart: vi.fn(),
    clearSession: vi.fn(),
    confirmEndSession: vi.fn(),
    customerThemePreset: 'ejoy-default',
    customerThemeVars: {},
    deleteItem: vi.fn(),
    detailItem: null,
    endSessionConfirmOpen: false,
    error: undefined,
    hasTableSession: true,
    incrementItem: vi.fn(),
    lastOrder: null,
    loading: false,
    menuRows: [],
    navigate: vi.fn(),
    orderNote: '',
    orders: [],
    ordersLoading: false,
    payWithTelebirr: vi.fn(),
    refetch: vi.fn(),
    refetchOrders: vi.fn(),
    removeItem: vi.fn(),
    requestEndSession: vi.fn(),
    search: '',
    selectedCategory: 'All',
    setActiveTab: vi.fn(),
    setCartOpen: vi.fn(),
    setDetailItem: vi.fn(),
    setEndSessionConfirmOpen: vi.fn(),
    setOrderNote: vi.fn(),
    setSearch: vi.fn(),
    setSelectedCategory: vi.fn(),
    setShopInfoOpen: vi.fn(),
    shopId: 'shop-1',
    shopInfoOpen: false,
    shopName: 'E-Joy',
    startNewTableSession: vi.fn(),
    tableRef: 'A1',
    totalPrice: 0,
    totalQuantity: 0,
    visibleRows: [],
    ...overrides,
  }
}

describe('CustomerOrderingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('asks for confirmation when Home is selected during a table session', async () => {
    const user = userEvent.setup()
    const state = buildState()
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    await user.click(screen.getByRole('button', { name: 'Home' }))

    expect(state.requestEndSession).toHaveBeenCalledTimes(1)
    expect(state.setActiveTab).not.toHaveBeenCalledWith('home')
  })

  it('keeps Menu and Orders as direct tab switches', async () => {
    const user = userEvent.setup()
    const state = buildState()
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    await user.click(screen.getByRole('button', { name: 'Orders' }))
    await user.click(screen.getByRole('button', { name: 'Order' }))

    expect(state.setActiveTab).toHaveBeenCalledWith('orders')
    expect(state.setActiveTab).toHaveBeenCalledWith('menu')
    expect(state.requestEndSession).not.toHaveBeenCalled()
  })

  it('can cancel or confirm the end-session dialog', async () => {
    const user = userEvent.setup()
    const state = buildState({ endSessionConfirmOpen: true })
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    expect(screen.getByText('End this table session?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Keep ordering' }))
    expect(state.setEndSessionConfirmOpen).toHaveBeenCalledWith(
      false,
      expect.anything(),
    )
    expect(state.confirmEndSession).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'End session' }))
    expect(state.confirmEndSession).toHaveBeenCalledTimes(1)
  })
})
