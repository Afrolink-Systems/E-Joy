import { CheckCircle2, Loader2, ShoppingBag, XCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/button'
import type { CartItem } from '../../../store/useCartStore'
import type { CheckoutPhase } from '../hooks/useTelebirrCheckout'
import type { CreatedOrderModel, CustomerThemeStyle } from '../customer-ordering.types'
import { buildCartKey, formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'

type PaymentStatusScreenProps = {
  error: string | null
  items: CartItem[]
  lastOrder: CreatedOrderModel | null
  onBackToCart: () => void
  onContinueOrdering: () => void
  onRetry: () => void
  onViewOrder: (orderId: string) => void
  phase: CheckoutPhase
  themePreset: string
  themeVars: CustomerThemeStyle
}

export function PaymentStatusScreen({
  error,
  items,
  lastOrder,
  onBackToCart,
  onContinueOrdering,
  onRetry,
  onViewOrder,
  phase,
  themePreset,
  themeVars,
}: PaymentStatusScreenProps) {
  if (phase === 'success') {
    return (
      <PaymentShell
        icon={<CheckCircle2 className="size-7" />}
        status="Order sent"
        subtitle="Kitchen received your order. Please wait while it is prepared."
        themePreset={themePreset}
        themeVars={themeVars}
      >
        <SubmittedItems items={items} />
        <FooterActions>
          <Button type="button" variant="outline" className="h-12 rounded-full bg-card font-semibold" onClick={onContinueOrdering}>
            Continue ordering
          </Button>
          <Button
            type="button"
            className="h-12 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
            disabled={!lastOrder?.id}
            onClick={() => {
              if (lastOrder?.id) onViewOrder(lastOrder.id)
            }}
          >
            View order
          </Button>
        </FooterActions>
      </PaymentShell>
    )
  }

  if (phase === 'failed') {
    return (
      <PaymentShell
        icon={<XCircle className="size-7" />}
        status="Payment did not finish"
        subtitle={error ?? 'We could not complete checkout. Your cart is still saved.'}
        themePreset={themePreset}
        themeVars={themeVars}
        tone="danger"
      >
        <SubmittedItems items={items} />
        <FooterActions>
          <Button type="button" variant="outline" className="h-12 rounded-full bg-card font-semibold" onClick={onBackToCart}>
            Back to cart
          </Button>
          <Button type="button" className="h-12 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90" onClick={onRetry}>
            Try again
          </Button>
        </FooterActions>
      </PaymentShell>
    )
  }

  const subtitle =
    phase === 'creating_order'
      ? 'Creating your order for the kitchen.'
      : 'Mocking Telebirr payment for now. Please wait a moment.'

  return (
    <PaymentShell
      icon={<Loader2 className="size-7 animate-spin" />}
      status="Processing payment"
      subtitle={subtitle}
      themePreset={themePreset}
      themeVars={themeVars}
    >
      <SubmittedItems items={items} />
    </PaymentShell>
  )
}

function PaymentShell({
  children,
  icon,
  status,
  subtitle,
  themePreset,
  themeVars,
  tone = 'primary',
}: {
  children: ReactNode
  icon: ReactNode
  status: string
  subtitle: string
  themePreset: string
  themeVars: CustomerThemeStyle
  tone?: 'primary' | 'danger'
}) {
  return (
    <section
      className="fixed inset-y-0 left-1/2 z-[70] flex w-[min(480px,100vw)] -translate-x-1/2 flex-col bg-background text-foreground"
      data-theme={themePreset}
      style={themeVars}
      aria-label={status}
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-[112px] pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="flex items-center gap-4 px-1 py-5">
          <span className={`grid size-16 shrink-0 place-items-center rounded-2xl ${tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
            {icon}
          </span>
          <div className="min-w-0">
            <h1 className="text-[24px] font-bold leading-tight text-foreground">{status}</h1>
            <p className="mt-1.5 text-[14px] leading-5 text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

function SubmittedItems({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <section className="mt-4 rounded-2xl bg-card p-4 text-card-foreground">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShoppingBag className="size-5 text-primary" />
          <h2 className="truncate text-[17px] font-semibold">Order items</h2>
        </div>
        <span className="shrink-0 text-[13px] font-medium text-muted-foreground">
          {formatBirr(total)}
        </span>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <article key={buildCartKey(item.id, item.remark)} className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 py-3.5">
            <img
              src={resolveProductImageUrl(item.imageUrl)}
              alt=""
              className="size-[54px] rounded-xl bg-muted object-cover"
            />
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-medium">{item.name}</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">{formatBirr(item.price)}</p>
            </div>
            <span className="text-[15px] font-medium tabular-nums">x{item.quantity}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

function FooterActions({ children }: { children: ReactNode }) {
  return (
    <footer className="fixed bottom-0 left-1/2 z-10 grid w-[min(480px,100vw)] -translate-x-1/2 grid-cols-2 gap-3 border-t border-border bg-background/96 px-4 py-3 pb-[calc(14px+env(safe-area-inset-bottom))] backdrop-blur">
      {children}
    </footer>
  )
}
