import { useQuery } from '@apollo/client/react'
import { ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../components/ui/empty'
import { GET_ORDERS_QUERY, type CustomerOrdersData } from '../../graphql/getOrders'
import { CustomerAccountDialog } from '../customer-ordering/components/CustomerAccountDialog'
import { formatBirr } from '../customer-ordering/customer-ordering.utils'
import { useCustomerAccount } from '../customer-ordering/hooks/useCustomerAccount'

export function OrderHistoryPage() {
  const navigate = useNavigate()
  const account = useCustomerAccount()
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const { data, error, loading, refetch } = useQuery<CustomerOrdersData>(
    GET_ORDERS_QUERY,
    {
      skip: !account.isSignedIn,
      fetchPolicy: 'cache-and-network',
    },
  )
  const orders = data?.customerOrders ?? []
  const rememberedOrderIds = useMemo(() => orders.map((order) => order.id), [orders])

  useEffect(() => {
    if (account.meLoading) return
    setAccountDialogOpen(!account.isSignedIn)
  }, [account.isSignedIn, account.meLoading])

  function requestRefresh() {
    if (!account.isSignedIn) {
      setAccountDialogOpen(true)
      return
    }
    void refetch()
  }

  function openOrder(orderId: string) {
    if (!account.isSignedIn) {
      setAccountDialogOpen(true)
      return
    }
    navigate(`/orders/${orderId}`)
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-background shadow-[0_0_80px_rgba(0,0,0,0.08)]">
        <header className="grid grid-cols-[40px_1fr_40px] items-center gap-2 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+10px)]">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-card text-card-foreground ring-1 ring-border transition active:scale-95"
            onClick={() => navigate('/', { replace: true })}
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-[20px] font-extrabold leading-tight">
              Orders
            </h1>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
              Recent orders for your account
            </p>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-card text-card-foreground ring-1 ring-border transition active:scale-95 disabled:opacity-50"
            disabled={loading || account.meLoading}
            onClick={requestRefresh}
            aria-label="Refresh orders"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
          {error ? (
            <section className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
              Orders could not load. Pull to retry or tap refresh.
            </section>
          ) : null}

          {!account.isSignedIn ? (
            <Empty className="mt-10 min-h-[360px] rounded-2xl border-0 bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList />
                </EmptyMedia>
                <EmptyTitle>Sign in to view orders</EmptyTitle>
                <EmptyDescription>
                  Your order history is linked to your customer account.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                type="button"
                className="rounded-full"
                onClick={() => setAccountDialogOpen(true)}
              >
                Sign in
              </Button>
            </Empty>
          ) : loading && orders.length === 0 ? (
            <div className="mt-10 space-y-3">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-28 animate-pulse rounded-2xl bg-card"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Empty className="mt-10 min-h-[360px] rounded-2xl border-0 bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardList />
                </EmptyMedia>
                <EmptyTitle>No orders yet</EmptyTitle>
                <EmptyDescription>
                  Place an order while signed in and it will appear here.
                </EmptyDescription>
              </EmptyHeader>
              <Button
                type="button"
                className="rounded-full"
                onClick={() => navigate('/', { replace: true })}
              >
                Browse menu
              </Button>
            </Empty>
          ) : (
            <div className="space-y-3 pt-2">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="w-full rounded-2xl bg-card p-4 text-left text-card-foreground shadow-[0_8px_22px_rgba(20,20,20,0.04)] transition active:scale-[0.99]"
                  onClick={() => openOrder(order.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">
                        {formatOrderDate(order.createdAt)}
                      </p>
                      <h2 className="mt-1 truncate text-[16px] font-extrabold">
                        {summarizeItems(order.items)}
                      </h2>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                    <strong className="text-[18px] font-extrabold">
                      {formatBirr(order.totalAmount)}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      <CustomerAccountDialog
        account={account}
        rememberedOrderIds={rememberedOrderIds}
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        themePreset="ejoy-default"
        themeVars={{}}
      />
    </main>
  )
}

function summarizeItems(orderItems: CustomerOrdersData['customerOrders'][number]['items']) {
  const names = orderItems.map((item) => item.product.name).filter(Boolean)
  if (names.length === 0) return 'Order'
  if (names.length === 1) return names[0]
  return `${names[0]} + ${names.length - 1} more`
}

function formatOrderDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  })
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
