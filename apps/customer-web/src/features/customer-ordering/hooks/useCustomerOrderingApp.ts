import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useCartStore,
  useCartTotalPrice,
  useCartTotalQuantity,
} from '../../../store/useCartStore'
import { useTableSessionStore } from '../../../store/useTableSessionStore'
import type { CreatedOrderModel, CustomerTab, MenuItem } from '../customer-ordering.types'
import { useCustomerAccount } from './useCustomerAccount'
import { useCustomerMenu } from './useCustomerMenu'
import { useCustomerOrders } from './useCustomerOrders'
import { useCustomerSessionContext } from './useCustomerSessionContext'
import { useTelebirrCheckout } from './useTelebirrCheckout'

const CUSTOMER_ACTIVE_TAB_KEY = 'ejoy_customer_active_tab'

function isCustomerTab(value: string | null): value is CustomerTab {
  return value === 'home' || value === 'menu' || value === 'orders'
}

function readStoredActiveTab(hasTableSession: boolean): CustomerTab {
  if (!hasTableSession || typeof window === 'undefined') {
    return 'home'
  }
  try {
    const stored = window.localStorage.getItem(CUSTOMER_ACTIVE_TAB_KEY)
    if (isCustomerTab(stored) && stored !== 'home') {
      return stored
    }
  } catch {
    /* ignore storage errors */
  }
  return 'menu'
}

function writeStoredActiveTab(tab: CustomerTab, hasTableSession: boolean) {
  if (typeof window === 'undefined') return
  try {
    if (!hasTableSession || tab === 'home') {
      window.localStorage.removeItem(CUSTOMER_ACTIVE_TAB_KEY)
      return
    }
    window.localStorage.setItem(CUSTOMER_ACTIVE_TAB_KEY, tab)
  } catch {
    /* ignore storage errors */
  }
}

export function useCustomerOrderingApp() {
  const session = useCustomerSessionContext()
  const [activeTab, setActiveTabState] = useState<CustomerTab>(() =>
    readStoredActiveTab(session.hasTableSession),
  )
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [shopInfoOpen, setShopInfoOpen] = useState(false)
  const [endSessionConfirmOpen, setEndSessionConfirmOpen] = useState(false)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [saveHistoryPromptOpen, setSaveHistoryPromptOpen] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [lastOrder, setLastOrder] = useState<CreatedOrderModel | null>(null)
  const navigate = useNavigate()

  const cart = useCartStore((s) => s.items)
  const addItem = useCartStore((s) => s.addItem)
  const incrementItem = useCartStore((s) => s.incrementItem)
  const removeItem = useCartStore((s) => s.removeItem)
  const deleteItem = useCartStore((s) => s.deleteItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const syncCatalogItems = useCartStore((s) => s.syncCatalogItems)
  const setFromQrParams = useTableSessionStore((s) => s.setFromQrParams)
  const totalPrice = useCartTotalPrice()
  const totalQuantity = useCartTotalQuantity()
  const account = useCustomerAccount()
  const orders = useCustomerOrders({
    hasTableSession: session.hasTableSession,
    signedIn: account.isSignedIn,
  })
  const menu = useCustomerMenu({
    hasTableSession: session.hasTableSession,
    search,
    selectedCategory,
    setSelectedCategory,
    shopId: session.shopId,
  })
  const checkout = useTelebirrCheckout({
    cart,
    hasTableSession: session.hasTableSession,
    note: orderNote,
    onCheckoutCreated: async (order) => {
      setLastOrder(order)
      const nextOrderIds = orders.rememberOrderId(order.id)
      if (account.isSignedIn) {
        await account.claimOrders([order.id])
      } else {
        setSaveHistoryPromptOpen(true)
      }
      await orders.refetchOrders({ ids: nextOrderIds })
    },
    shopId: session.shopId,
    tableRef: session.tableRef,
  })

  function startNewTableSession(nextSession: { shopId: string; table: string }) {
    resetVisitState()
    setEndSessionConfirmOpen(false)
    setFromQrParams(nextSession.shopId, nextSession.table)
    writeStoredActiveTab('menu', true)
  }

  function setActiveTab(tab: CustomerTab) {
    writeStoredActiveTab(tab, session.hasTableSession)
    setActiveTabState(tab)
  }

  function resetVisitState() {
    clearCart()
    orders.clearRememberedOrders()
    setCartOpen(false)
    setDetailItem(null)
    setShopInfoOpen(false)
    setOrderNote('')
    setLastOrder(null)
    setSearch('')
    setSelectedCategory('')
  }

  function requestEndSession() {
    if (!session.hasTableSession) {
      setActiveTab('home')
      return
    }
    setEndSessionConfirmOpen(true)
  }

  function clearCustomerSession() {
    resetVisitState()
    setEndSessionConfirmOpen(false)
    writeStoredActiveTab('home', false)
    session.clearSession()
    setActiveTabState('home')
  }

  function confirmEndSession() {
    clearCustomerSession()
  }

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/'
    if (path.endsWith('/order-success') || path === '/order-success') {
      toast.success('Payment received. Your order was sent to the kitchen.')
      writeStoredActiveTab('orders', true)
      setActiveTabState('orders')
      clearCart()
      window.history.replaceState({}, document.title, '/')
    }
  }, [clearCart])

  useEffect(() => {
    syncCatalogItems(menu.menuRows)
  }, [menu.menuRows, syncCatalogItems])

  useEffect(() => {
    if (session.hasTableSession) {
      if (activeTab === 'home') {
        const nextTab = readStoredActiveTab(true)
        setActiveTabState(nextTab === 'home' ? 'menu' : nextTab)
      } else {
        writeStoredActiveTab(activeTab, true)
      }
      return
    }
    if (activeTab === 'home') return
    writeStoredActiveTab('home', false)
    setActiveTabState('home')
  }, [activeTab, session.hasTableSession])

  return {
    activeTab,
    addItem,
    account,
    accountDialogOpen,
    cart,
    cartOpen,
    categories: menu.categories,
    checkoutPhase: checkout.checkoutPhase,
    checkoutLoading: checkout.checkoutLoading,
    clearCart,
    clearSession: clearCustomerSession,
    confirmEndSession,
    customerThemePreset: menu.customerThemePreset,
    customerThemeVars: menu.customerThemeVars,
    customerOrderIds: orders.customerOrderIds,
    deleteItem,
    detailItem,
    endSessionConfirmOpen,
    error: menu.error,
    hasTableSession: session.hasTableSession,
    incrementItem,
    lastOrder,
    loading: menu.loading,
    menuRows: menu.menuRows,
    navigate,
    orderNote,
    orders: orders.orders,
    ordersLoading: orders.ordersLoading,
    payWithTelebirr: checkout.payWithTelebirr,
    refetch: menu.refetch,
    refetchOrders: orders.refetchOrders,
    removeItem,
    requestEndSession,
    saveHistoryPromptOpen,
    search,
    selectedCategory,
    setActiveTab,
    setAccountDialogOpen,
    setCartOpen,
    setDetailItem,
    setEndSessionConfirmOpen,
    setOrderNote,
    setSearch,
    setSelectedCategory,
    setSaveHistoryPromptOpen,
    setShopInfoOpen,
    shopId: session.shopId,
    shopInfoOpen,
    shopName: menu.shopName,
    startNewTableSession,
    tableRef: session.tableRef,
    totalPrice,
    totalQuantity,
    visibleRows: menu.visibleRows,
  }
}

export type CustomerOrderingAppState = ReturnType<typeof useCustomerOrderingApp>
