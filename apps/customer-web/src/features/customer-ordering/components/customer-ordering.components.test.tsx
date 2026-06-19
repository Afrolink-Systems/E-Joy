import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import type { CartItem } from '../../../store/useCartStore'
import type { MenuItem } from '../customer-ordering.types'
import { CheckoutCartDrawer } from './CheckoutCartDrawer'
import { MenuScreen } from './MenuScreen'
import { MissingQrScreen } from './MissingQrScreen'
import { ProductCard } from './ProductCard'

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

vi.mock('../../../lib/mockTelebirrRedirectUrl', () => ({
  getOrderServiceHttpOrigin: () => 'http://localhost:9602',
}))

const baseCartProps = {
  checkoutPhase: 'idle' as const,
  checkoutLoading: false,
  deleteItem: vi.fn(),
  incrementItem: vi.fn(),
  lastOrder: null,
  note: '',
  onClear: vi.fn(),
  onOpenChange: vi.fn(),
  removeItem: vi.fn(),
  setNote: vi.fn(),
  themePreset: 'ejoy-default',
  themeVars: {},
}

describe('customer ordering components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the missing QR session state', () => {
    render(<MissingQrScreen />)

    expect(screen.getByText('Scan your table QR code')).toBeInTheDocument()
    expect(screen.getByText('?shopId=test-shop-001&table=test-table-001')).toBeInTheDocument()
  })

  it('keeps product card open and add actions separate', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onOpen = vi.fn()
    const item: MenuItem = {
      id: 'p1',
      name: 'Chicken tibs',
      categoryId: 'cat_main',
      categoryMeta: {
        id: 'cat_main',
        name: 'Main',
        iconKey: 'soup',
        color: '#B85C38',
        sortOrder: 10,
      },
      unitPrice: 1250,
      imageUrl: 'https://cdn.example.com/tibs.jpg',
    }

    render(<ProductCard item={item} onAdd={onAdd} onOpen={onOpen} />)

    await user.click(screen.getByRole('button', { name: 'View Chicken tibs' }))
    await user.click(screen.getByRole('button', { name: 'Add Chicken tibs' }))

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(screen.getByText('12.50 ETB')).toBeInTheDocument()
  })

  it('disables checkout when the cart is empty', () => {
    render(
      <CheckoutCartDrawer
        {...baseCartProps}
        cart={[]}
        onPay={vi.fn()}
        open
        totalPrice={0}
        totalQuantity={0}
      />,
    )

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay with Telebirr' })).toBeDisabled()
  })

  it('renders the menu as compact list-only rows', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    const onOpenDetail = vi.fn()
    const setSelectedCategory = vi.fn()
    const rows: MenuItem[] = [
      {
        id: 'p1',
        name: 'Awaze Tibs',
        categoryId: 'cat-main',
        categoryMeta: {
          id: 'cat-main',
          name: 'Main',
          iconKey: 'soup',
          color: '#B85C38',
          sortOrder: 1,
        },
        unitPrice: 39000,
        imageUrl: 'https://cdn.example.com/tibs.jpg',
      },
    ]

    render(
      <MenuScreen
        cart={[]}
        categories={[{ name: 'Main' }]}
        loading={false}
        menuRows={rows}
        onAdd={onAdd}
        onRemove={vi.fn()}
        onCheckout={vi.fn()}
        onOpenAccount={vi.fn()}
        onOpenCart={vi.fn()}
        onOpenDetail={onOpenDetail}
        onOpenHome={vi.fn()}
        onOpenInfo={vi.fn()}
        onRefetch={vi.fn()}
        search=""
        selectedCategory=""
        setSearch={vi.fn()}
        setSelectedCategory={setSelectedCategory}
        showFloatingCartBar
        shopName="E-Joy"
        tableRef="A1"
        totalPrice={0}
        totalQuantity={0}
        visibleRows={rows}
      />,
    )

    expect(screen.queryByText('CARD')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Awaze Tibs' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Main' }))
    await user.click(screen.getByRole('button', { name: 'Add Awaze Tibs' }))

    expect(setSelectedCategory).toHaveBeenCalledWith('Main')
    expect(onAdd).toHaveBeenCalledWith(rows[0])
  })

  it('shows the sticky cart bar when menu has cart items', async () => {
    const user = userEvent.setup()
    const onOpenCart = vi.fn()
    const onCheckout = vi.fn().mockResolvedValue(undefined)

    render(
      <MenuScreen
        cart={[{ id: 'p1', name: 'Awaze Tibs', price: 39000, quantity: 2 }]}
        categories={[{ name: 'Main' }]}
        loading={false}
        menuRows={[]}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
        onCheckout={onCheckout}
        onOpenAccount={vi.fn()}
        onOpenCart={onOpenCart}
        onOpenDetail={vi.fn()}
        onOpenHome={vi.fn()}
        onOpenInfo={vi.fn()}
        onRefetch={vi.fn()}
        search=""
        selectedCategory=""
        setSearch={vi.fn()}
        setSelectedCategory={vi.fn()}
        showFloatingCartBar
        shopName="E-Joy"
        tableRef="A1"
        totalPrice={78000}
        totalQuantity={2}
        visibleRows={[]}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Review cart' }))

    expect(screen.getByText('780 ETB')).toBeInTheDocument()
    expect(onOpenCart).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Checkout' }))
    expect(onCheckout).toHaveBeenCalledTimes(1)
  })

  it('shows checkout errors with toast without clearing the cart', async () => {
    const cart: CartItem[] = [{ id: 'p1', name: 'Chicken tibs', price: 1250, quantity: 1 }]
    const onPay = vi.fn().mockRejectedValue(new Error('Order service unavailable'))

    render(
      <CheckoutCartDrawer
        {...baseCartProps}
        cart={cart}
        onPay={onPay}
        open
        totalPrice={1250}
        totalQuantity={1}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pay with Telebirr' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Order service unavailable')
    })
    expect(screen.queryByText('Checkout needs attention')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Chicken tibs' })).toBeInTheDocument()
  })
})
