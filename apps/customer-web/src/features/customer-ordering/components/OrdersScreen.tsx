import { ArrowLeft, ChevronRight, ClipboardList, Clock3, ReceiptText, RefreshCw, Tag, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../../components/ui/empty'
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import type { GetOrdersData, OrderHistoryRow } from '../../../graphql/getOrders'
import {
  formatBirr,
  resolveProductImageUrl,
} from '../customer-ordering.utils'
import { LoadingState } from './LoadingState'

type OrdersScreenProps = {
  loading: boolean
  onGoOrder: () => void
  onOpenOrder: (id: string) => void
  onRefresh: () => void
  orders: GetOrdersData['getOrders']
}

export function OrdersScreen({
  loading,
  onGoOrder,
  onOpenOrder,
  onRefresh,
  orders,
}: OrdersScreenProps) {
  const [orderMode, setOrderMode] = useState<'dine' | 'stored'>('dine')
  const visibleOrders = orderMode === 'dine' ? orders : []

  return (
    <section className="min-h-svh bg-background px-4 pb-24 pt-[calc(env(safe-area-inset-top)+14px)] text-foreground max-[370px]:px-3">
      <header className="grid min-h-11 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-foreground transition active:scale-95"
          onClick={onGoOrder}
          aria-label="Back"
        >
          <ArrowLeft className="size-6" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[22px] font-black leading-none">Orders</h1>
          <p className="mt-1 text-xs font-semibold text-muted-foreground">Your table order history</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="size-11 rounded-full bg-card text-card-foreground shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
          onClick={onRefresh}
          aria-label="Refresh orders"
        >
          <RefreshCw className="size-5" />
        </Button>
      </header>

      <Tabs value={orderMode} onValueChange={(value) => setOrderMode(value as 'dine' | 'stored')} className="mt-5">
        <TabsList className="grid h-11 w-full grid-cols-2 rounded-[1.4rem] border border-border bg-card/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <TabsTrigger value="dine" className="rounded-full text-[13px] font-black data-active:bg-primary data-active:text-primary-foreground">
            Dine-in
          </TabsTrigger>
          <TabsTrigger value="stored" className="rounded-full text-[13px] font-black data-active:bg-primary data-active:text-primary-foreground">
            Stored value
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <LoadingState label="Loading orders" />
      ) : visibleOrders.length === 0 ? (
        <Empty className="mt-4 min-h-[62svh] rounded-[1.6rem] border-0 bg-card/72 shadow-[0_14px_36px_rgba(20,20,20,0.05)]">
          <EmptyHeader>
            <EmptyMedia>
              <ClipboardList className="size-16 text-neutral-400" />
            </EmptyMedia>
            <EmptyTitle className="text-[18px]">No orders yet</EmptyTitle>
            <EmptyDescription>Placed orders will show up here.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" className="h-12 w-[200px] rounded-full bg-primary font-black text-primary-foreground hover:bg-primary/90" onClick={onGoOrder}>
              Go order
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="mt-4 flex flex-col gap-3 pb-6">
          {visibleOrders.map((order) => (
            <OrderCard key={order.id} order={order} onOpen={() => onOpenOrder(order.id)} />
          ))}
        </div>
      )}
    </section>
  )
}

function OrderCard({ order, onOpen }: { order: OrderHistoryRow; onOpen: () => void }) {
  const firstItem = order.items[0]
  const imageUrl = resolveProductImageUrl(firstItem?.product.imageUrl)
  const status = statusMeta(order.status)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="grid w-full grid-cols-[108px_minmax(0,1fr)_34px] items-center gap-4 rounded-[1.65rem] border border-border bg-card/90 p-4 text-left text-card-foreground shadow-[0_18px_46px_rgba(20,20,20,0.075)] transition active:scale-[0.985] max-[370px]:grid-cols-[88px_minmax(0,1fr)_28px] max-[370px]:gap-3 max-[370px]:p-3"
    >
      <img
        src={imageUrl}
        alt=""
        className="size-[108px] rounded-full object-cover shadow-[0_12px_28px_rgba(20,20,20,0.1)] max-[370px]:size-[88px]"
      />
      <div className="min-w-0">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-black uppercase max-[370px]:px-2 max-[370px]:text-[11px] ${status.className}`}>
          <span className={`size-2.5 rounded-full ${status.dotClassName}`} />
          {status.label}
        </span>
        <h2 className="mt-3 truncate text-[25px] font-black leading-tight max-[370px]:text-[20px]">
          {firstItem?.product.name ?? 'Order'}
        </h2>
        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-bold text-muted-foreground max-[370px]:text-[12px]">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4 text-primary" />
            {formatOrderDate(order.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Tag className="size-4 text-primary" />
            {formatBirr(order.totalAmount)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Utensils className="size-4 text-primary" />
            {order.items.length > 1 ? `+${order.items.length - 1} other items` : '1 item'}
          </span>
        </div>
      </div>
      <span className="flex items-center justify-end gap-1">
        <span className="hidden size-10 place-items-center rounded-full bg-background text-foreground shadow-[0_8px_22px_rgba(20,20,20,0.08)] min-[431px]:grid">
          <ReceiptText className="size-5" />
        </span>
        <ChevronRight className="size-5 text-card-foreground max-[370px]:size-4" />
      </span>
    </button>
  )
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function statusMeta(status: string): {
  className: string
  dotClassName: string
  label: string
} {
  const value = status.toUpperCase()
  if (value.includes('COMPLETE') || value.includes('PAID')) {
    return {
      className: 'bg-green-100 text-green-700',
      dotClassName: 'bg-green-500',
      label: 'Completed',
    }
  }
  if (value.includes('FAIL') || value.includes('CANCEL')) {
    return {
      className: 'bg-red-50 text-red-600',
      dotClassName: 'bg-red-500',
      label: 'Failed',
    }
  }
  return {
    className: 'bg-primary/10 text-primary',
    dotClassName: 'bg-primary',
    label: 'Pending',
  }
}
