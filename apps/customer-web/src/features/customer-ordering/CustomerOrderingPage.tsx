import { CheckoutCartDrawer } from './components/CheckoutCartDrawer'
import { CustomerAccountDialog } from './components/CustomerAccountDialog'
import { HomeScreen } from './components/HomeScreen'
import { ItemDetailDrawer } from './components/ItemDetailDrawer'
import { MenuScreen } from './components/MenuScreen'
import { PaymentStatusScreen } from './components/PaymentStatusScreen'
import { ShopInfoDrawer } from './components/ShopInfoDrawer'
import { useCustomerOrderingApp } from './hooks/useCustomerOrderingApp'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'

export function CustomerOrderingPage() {
  const state = useCustomerOrderingApp()
  const navigate = useNavigate()
  const showPaymentState =
    state.checkoutPhase === 'creating_order' ||
    state.checkoutPhase === 'mock_payment' ||
    state.checkoutPhase === 'success' ||
    state.checkoutPhase === 'failed'
  const showMenuFloatingCart =
    !state.cartOpen &&
    !state.detailItem &&
    !state.accountDialogOpen &&
    !state.shopInfoOpen &&
    !showPaymentState

  return (
    <main
      className="min-h-svh bg-background text-foreground"
      data-theme={state.customerThemePreset}
      style={state.customerThemeVars}
    >
      <div className="relative mx-auto min-h-svh w-full max-w-[480px] overflow-hidden bg-background shadow-[0_0_80px_rgba(0,0,0,0.08)]">
        {state.activeTab === 'home' ? (
          <HomeScreen
            hasTableSession={state.hasTableSession}
            shopName={state.shopName}
            tableRef={state.tableRef}
            onContinue={() => state.setActiveTab('menu')}
            onStartNewSession={state.startNewTableSession}
          />
        ) : null}

        {state.activeTab === 'menu' ? (
          <MenuScreen
            cart={state.cart}
            categories={state.categories}
            error={state.error?.message}
            loading={state.loading}
            menuRows={state.menuRows}
            onAdd={(item) => {
              state.addItem({ id: item.id, imageUrl: item.imageUrl, name: item.name, price: item.unitPrice })
            }}
            onRemove={(item) => state.removeItem(item.id)}
            onCheckout={state.payWithTelebirr}
            onOpenAccount={() => state.setAccountDialogOpen(true)}
            onOpenCart={() => state.setCartOpen(true)}
            onOpenDetail={state.setDetailItem}
            onOpenHome={state.requestEndSession}
            onOpenInfo={() => state.setShopInfoOpen(true)}
            onRefetch={() => void state.refetch()}
            search={state.search}
            selectedCategory={state.selectedCategory}
            setSearch={state.setSearch}
            setSelectedCategory={state.setSelectedCategory}
            showFloatingCartBar={showMenuFloatingCart}
            shopName={state.shopName}
            tableRef={state.tableRef}
            totalPrice={state.totalPrice}
            totalQuantity={state.totalQuantity}
            visibleRows={state.visibleRows}
          />
        ) : null}

      </div>

      <AlertDialog
        open={state.endSessionConfirmOpen}
        onOpenChange={state.setEndSessionConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this table session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your cart and current order history on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep ordering</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={state.confirmEndSession}>
              End session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={state.saveHistoryPromptOpen}
        onOpenChange={state.setSaveHistoryPromptOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Create a customer account to keep receipts, history, and spending across restaurants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                state.setSaveHistoryPromptOpen(false)
                state.setAccountDialogOpen(true)
              }}
            >
              Save history
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CustomerAccountDialog
        account={state.account}
        rememberedOrderIds={state.customerOrderIds}
        open={state.accountDialogOpen}
        onOpenChange={state.setAccountDialogOpen}
        themePreset={state.customerThemePreset}
        themeVars={state.customerThemeVars}
      />

      <ItemDetailDrawer
        cartQuantity={state.detailItem ? itemQuantityInCart(state.cart, state.detailItem.id) : 0}
        cartTotalPrice={state.totalPrice}
        cartTotalQuantity={state.totalQuantity}
        item={state.detailItem}
        onCheckout={state.payWithTelebirr}
        onOpenCart={() => state.setCartOpen(true)}
        onRemove={() => {
          if (!state.detailItem) return
          state.removeItem(state.detailItem.id)
        }}
        themePreset={state.customerThemePreset}
        themeVars={state.customerThemeVars}
        onOpenChange={(open) => {
          if (!open) state.setDetailItem(null)
        }}
        onAdd={() => {
          if (!state.detailItem) return
          state.addItem({
            id: state.detailItem.id,
            imageUrl: state.detailItem.imageUrl,
            name: state.detailItem.name,
            price: state.detailItem.unitPrice,
          })
        }}
      />

      <CheckoutCartDrawer
        cart={state.cart}
        checkoutLoading={state.checkoutLoading}
        deleteItem={state.deleteItem}
        incrementItem={state.incrementItem}
        note={state.orderNote}
        onClear={state.clearCart}
        open={state.cartOpen}
        onOpenChange={state.setCartOpen}
        onPay={state.payWithTelebirr}
        removeItem={state.removeItem}
        setNote={state.setOrderNote}
        themePreset={state.customerThemePreset}
        themeVars={state.customerThemeVars}
        totalPrice={state.totalPrice}
        totalQuantity={state.totalQuantity}
      />

      {showPaymentState ? (
        <PaymentStatusScreen
          error={state.checkoutError}
          items={state.checkoutSnapshot}
          lastOrder={state.lastOrder}
          onBackToCart={() => {
            state.resetCheckout()
            state.setCartOpen(true)
          }}
          onContinueOrdering={() => {
            state.resetCheckout()
            state.setActiveTab('menu')
          }}
          onRetry={() => {
            void state.payWithTelebirr()
          }}
          onViewOrder={(orderId) => {
            state.resetCheckout()
            navigate(`/orders/${orderId}`)
          }}
          phase={state.checkoutPhase}
          themePreset={state.customerThemePreset}
          themeVars={state.customerThemeVars}
        />
      ) : null}

      <ShopInfoDrawer
        open={state.shopInfoOpen}
        shopName={state.shopName}
        tableRef={state.tableRef}
        onOpenChange={state.setShopInfoOpen}
        themePreset={state.customerThemePreset}
        themeVars={state.customerThemeVars}
      />
    </main>
  )
}

function itemQuantityInCart(
  cart: Array<{ id: string; quantity: number }>,
  itemId: string,
): number {
  return cart
    .filter((line) => line.id === itemId)
    .reduce((sum, line) => sum + line.quantity, 0)
}
