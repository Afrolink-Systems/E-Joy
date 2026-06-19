import { format } from 'date-fns'
import {
  CalendarDays,
  ChevronRight,
  Copy,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../components/ui/empty'
import { Spinner } from '../../components/ui/spinner'
import { DetailTopbar } from './components/DetailTopbar'
import { OrderItemList } from './components/OrderItemList'
import { useOrderDetail } from './hooks/useOrderDetail'
import type { OrderDetailPageProps } from './order-detail.types'
import { copyOrderNumber, formatOrderBirr } from './order-detail.utils'

export function OrderDetailPage({ orderId, onBack, onContinueOrdering }: OrderDetailPageProps) {
  const {
    error,
    loading,
    order,
    refetch,
    themePreset,
    themeVars,
  } =
    useOrderDetail(orderId)
  const themeProps = {
    'data-theme': themePreset,
    style: themeVars,
  }

  if (loading) {
    return (
      <main className="mx-auto grid min-h-svh max-w-[480px] place-items-center bg-background text-foreground" {...themeProps}>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Spinner />
          Loading order
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="mx-auto min-h-svh max-w-[480px] bg-background pb-24 text-foreground" {...themeProps}>
        <DetailTopbar title="Order" onBack={onBack} />
        <section className="p-4">
          <Empty className="min-h-[70svh] rounded-2xl border-0 bg-card/80 text-card-foreground shadow-none">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText />
              </EmptyMedia>
              <EmptyTitle className="text-lg">Order not found</EmptyTitle>
              <EmptyDescription>{error?.message ?? 'This order could not be loaded.'}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" className="h-11 rounded-full bg-primary font-bold text-primary-foreground hover:bg-primary/90" onClick={() => void refetch()}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-svh max-w-[480px] bg-background pb-[calc(96px+env(safe-area-inset-bottom))] text-foreground" {...themeProps}>
      <DetailTopbar title="Order detail" onBack={onBack} />
      <div className="flex flex-col gap-3 px-4 pb-5 pt-2 max-[370px]:px-3">
        <section className="rounded-[22px] border border-border bg-card p-4 text-card-foreground">
          <p className="text-[12px] font-medium text-muted-foreground">Order number</p>
          <div className="mt-2 flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-muted/80 px-3.5 py-3">
            <span className="min-w-0 truncate font-mono text-[12px] text-muted-foreground">{order.orderNo}</span>
            <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full px-2.5 text-[13px] font-medium text-foreground" onClick={() => copyOrderNumber(order.orderNo)}>
              <Copy className="size-3.5 text-primary" data-icon="inline-start" />
              Copy
            </Button>
          </div>
        </section>

        <section className="rounded-[22px] border border-border bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <ShoppingBag className="size-4 text-primary" />
              <h2 className="truncate text-[17px] font-semibold">Order items</h2>
            </div>
            <span className="text-[12px] font-medium text-muted-foreground">{order.items.length} items</span>
          </div>
          <OrderItemList orderId={order.id} items={order.items} />
        </section>

        <section className="rounded-[22px] border border-border bg-card p-4 text-card-foreground">
          <h2 className="text-[17px] font-semibold">Details</h2>
          <dl className="mt-2 grid gap-0">
            <DetailRow icon={CalendarDays} label="Placed" value={format(new Date(order.createdAt), 'MMM d, HH:mm')} />
            <DetailRow icon={ReceiptText} label="Total" value={formatOrderBirr(order.totalAmount)} strong />
          </dl>
        </section>
      </div>

      <footer className="fixed bottom-0 left-1/2 z-20 w-[min(480px,100vw)] -translate-x-1/2 bg-background/95 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur">
        <Button
          type="button"
          className="h-14 w-full rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground hover:bg-primary/90"
          onClick={onContinueOrdering}
        >
          <ShoppingCart className="size-5" />
          <span className="min-w-0 flex-1 text-left">Continue ordering</span>
          <ChevronRight className="size-5" />
        </Button>
      </footer>
    </main>
  )
}

function DetailRow({
  icon: Icon,
  label,
  strong = false,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  strong?: boolean
  value: string
}) {
  return (
    <div className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 last:border-b-0">
      <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <dt className="text-[13px] font-medium text-muted-foreground">{label}</dt>
      <dd className={`m-0 text-right text-[13px] font-semibold ${strong ? 'text-primary' : 'text-card-foreground'}`}>
        {value}
      </dd>
    </div>
  )
}
