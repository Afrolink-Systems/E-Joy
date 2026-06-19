import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomerOrderingPage } from './CustomerOrderingPage'

const useCustomerOrderingAppMock = vi.hoisted(() => vi.fn())
const navigateMock = vi.hoisted(() => vi.fn())

vi.mock('./hooks/useCustomerOrderingApp', () => ({
  useCustomerOrderingApp: useCustomerOrderingAppMock,
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('./components/HomeScreen', () => ({
  HomeScreen: () => <div>Home screen</div>,
}))

vi.mock('./components/MenuScreen', () => ({
  MenuScreen: ({ onOpenHome }: { onOpenHome: () => void }) => (
    <div>
      Menu screen
      <button type="button" onClick={onOpenHome}>
        Go home
      </button>
    </div>
  ),
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
    account: {
      claimOrders: vi.fn(),
      expense: null,
      expenseLoading: false,
      isSignedIn: false,
      loginWithPasskey: vi.fn(),
      logout: vi.fn(),
      me: null,
      meLoading: false,
      refetchAccount: vi.fn(),
      registerPasskey: vi.fn(),
      requestOtp: vi.fn(),
      token: '',
      verifyOtp: vi.fn(),
    },
    accountDialogOpen: false,
    cart: [],
    cartOpen: false,
    categories: [],
    checkoutLoading: false,
    checkoutError: null,
    checkoutPhase: 'idle',
    checkoutSnapshot: [],
    clearCart: vi.fn(),
    clearSession: vi.fn(),
    confirmEndSession: vi.fn(),
    customerThemePreset: 'ejoy-default',
    customerThemeVars: {},
    customerOrderIds: [],
    deleteItem: vi.fn(),
    detailItem: null,
    endSessionConfirmOpen: false,
    error: undefined,
    hasTableSession: true,
    incrementItem: vi.fn(),
    lastOrder: null,
    loading: false,
    menuRows: [],
    orderNote: '',
    payWithTelebirr: vi.fn(),
    refetch: vi.fn(),
    removeItem: vi.fn(),
    requestEndSession: vi.fn(),
    resetCheckout: vi.fn(),
    saveHistoryPromptOpen: false,
    search: '',
    selectedCategory: '',
    setActiveTab: vi.fn(),
    setAccountDialogOpen: vi.fn(),
    setCartOpen: vi.fn(),
    setDetailItem: vi.fn(),
    setEndSessionConfirmOpen: vi.fn(),
    setOrderNote: vi.fn(),
    setSearch: vi.fn(),
    setSelectedCategory: vi.fn(),
    setSaveHistoryPromptOpen: vi.fn(),
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

  it('asks for confirmation when Home is selected from the menu header during a table session', async () => {
    const user = userEvent.setup()
    const state = buildState()
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    await user.click(screen.getByRole('button', { name: 'Go home' }))

    expect(state.requestEndSession).toHaveBeenCalledTimes(1)
    expect(state.setActiveTab).not.toHaveBeenCalledWith('home')
  })

  it('does not render the old bottom navigation on the menu', () => {
    const state = buildState()
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    expect(screen.getByText('Menu screen')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Orders' })).not.toBeInTheDocument()
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

  it('shows the mock payment success page with submitted items', async () => {
    const user = userEvent.setup()
    const state = buildState({
      checkoutPhase: 'success',
      checkoutSnapshot: [
        { id: 'p1', name: 'Chechebsa', price: 26000, quantity: 1 },
      ],
      lastOrder: {
        id: 'order-1',
        orderNo: 'ORD-1',
        paymentState: 'SUCCESS',
        state: 'PAID',
        totalAmount: 26000,
      },
    })
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    expect(screen.getByText('Order sent')).toBeInTheDocument()
    expect(screen.getByText('Chechebsa')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'View order' }))

    expect(state.resetCheckout).toHaveBeenCalledTimes(1)
    expect(navigateMock).toHaveBeenCalledWith('/orders/order-1')
  })

  it('shows full-page payment failure actions', async () => {
    const user = userEvent.setup()
    const state = buildState({
      checkoutError: 'Order service unavailable',
      checkoutPhase: 'failed',
      checkoutSnapshot: [
        { id: 'p1', name: 'Chechebsa', price: 26000, quantity: 1 },
      ],
    })
    useCustomerOrderingAppMock.mockReturnValue(state)

    render(<CustomerOrderingPage />)

    expect(screen.getByText('Payment did not finish')).toBeInTheDocument()
    expect(screen.getByText('Order service unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Back to cart' }))
    expect(state.resetCheckout).toHaveBeenCalledTimes(1)
    expect(state.setCartOpen).toHaveBeenCalledWith(true)

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(state.payWithTelebirr).toHaveBeenCalledTimes(1)
  })
})
