import { format } from 'date-fns'
import {
  CalendarDays,
  CheckCircle2,
  Copy,
  ReceiptText,
  WalletCards,
  BadgeDollarSign,
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
import { PaymentActions } from './components/PaymentActions'
import { useOrderDetail } from './hooks/useOrderDetail'
import type { OrderDetailPageProps } from './order-detail.types'
import { copyOrderNumber, formatOrderBirr, statusLabel } from './order-detail.utils'

export function OrderDetailPage({ orderId, onBack }: OrderDetailPageProps) {
  const {
    error,
    loading,
    needsPayment,
    order,
    payWithTelebirr,
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
        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
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
          <Empty className="min-h-[70svh] rounded-[1.6rem] border-0 bg-card/80 text-card-foreground shadow-[0_14px_36px_rgba(20,20,20,0.05)]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ReceiptText />
              </EmptyMedia>
              <EmptyTitle className="text-lg">Order not found</EmptyTitle>
              <EmptyDescription>{error?.message ?? 'This order could not be loaded.'}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" className="h-11 rounded-full bg-primary font-black text-primary-foreground hover:bg-primary/90" onClick={() => void refetch()}>
                Retry
              </Button>
            </EmptyContent>
          </Empty>
        </section>
      </main>
    )
  }

  const status = statusTone(order.status)

  return (
    <main className="mx-auto min-h-svh max-w-[480px] bg-background pb-[calc(28px+env(safe-area-inset-bottom))] text-foreground" {...themeProps}>
      <DetailTopbar title="Order Status" onBack={onBack} />
      <div className="flex flex-col gap-4 px-4 pb-5 pt-3 max-[370px]:px-3">
        <section className="rounded-[1.45rem] border border-border bg-card/90 p-5 text-card-foreground shadow-[0_16px_42px_rgba(20,20,20,0.07)] max-[370px]:p-4">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[15px] font-black ${status.badgeClassName}`}>
            <CheckCircle2 className="size-5 fill-current" />
            {status.label}
          </span>
          <h2 className="mt-5 truncate text-[29px] font-black leading-tight max-[370px]:text-[24px]">{order.shopName}</h2>
          <p className="mt-2 truncate text-[19px] font-semibold text-muted-foreground max-[370px]:text-[16px]">
            {order.tableName ? `Table ${order.tableName}` : 'Dine-in order'}
          </p>
          <div className="mt-6 flex min-w-0 items-center justify-between gap-3 rounded-[1.1rem] bg-muted px-4 py-4 max-[370px]:px-3">
            <span className="min-w-0 truncate font-mono text-[16px] text-muted-foreground max-[370px]:text-[13px]">{order.orderNo}</span>
            <Button type="button" variant="ghost" size="sm" className="h-10 rounded-full px-2.5 text-[16px] font-semibold text-foreground" onClick={() => copyOrderNumber(order.orderNo)}>
              <Copy className="size-5 text-primary" data-icon="inline-start" />
              Copy
            </Button>
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-border bg-card/90 p-5 text-card-foreground shadow-[0_16px_42px_rgba(20,20,20,0.07)] max-[370px]:p-4">
          <h2 className="text-[25px] font-black max-[370px]:text-[22px]">Items</h2>
          <div className="mt-4">
            <OrderItemList orderId={order.id} items={order.items} />
          </div>
        </section>

        <section className="rounded-[1.45rem] border border-border bg-card/90 p-5 text-card-foreground shadow-[0_16px_42px_rgba(20,20,20,0.07)] max-[370px]:p-4">
          <h2 className="text-[25px] font-black max-[370px]:text-[22px]">Details</h2>
          <dl className="mt-5 grid gap-0">
            <DetailRow icon={CalendarDays} label="Placed" value={format(new Date(order.createdAt), 'MMM d, HH:mm')} />
            <DetailRow icon={WalletCards} label="Payment" value="Telebirr" />
            <DetailRow icon={BadgeDollarSign} label="Total" value={formatOrderBirr(order.totalAmount)} strong />
          </dl>
        </section>
      </div>

      <PaymentActions
        needsPayment={needsPayment}
        onPay={payWithTelebirr}
        totalAmount={order.totalAmount}
      />
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
    <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-4 border-b border-border py-4 last:border-b-0 max-[370px]:grid-cols-[46px_minmax(0,1fr)_auto] max-[370px]:gap-3">
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary max-[370px]:size-10">
        <Icon className="size-6 max-[370px]:size-5" />
      </span>
      <dt className="text-[17px] font-medium text-muted-foreground max-[370px]:text-[15px]">{label}</dt>
      <dd className={`m-0 text-right text-[17px] font-black max-[370px]:text-[15px] ${strong ? 'text-primary' : 'text-card-foreground'}`}>
        {value}
      </dd>
    </div>
  )
}

function statusTone(status: string): { badgeClassName: string; label: string } {
  const normalized = status.toUpperCase()
  if (normalized.includes('COMPLETE') || normalized.includes('PAID')) {
    return { badgeClassName: 'bg-primary/10 text-primary', label: 'Completed' }
  }
  if (normalized.includes('FAIL') || normalized.includes('CANCEL')) {
    return { badgeClassName: 'bg-red-50 text-red-600', label: 'Failed' }
  }
  return { badgeClassName: 'bg-primary/10 text-primary', label: statusLabel(status) }
}
