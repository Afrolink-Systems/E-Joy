import { ArrowLeft, CheckCircle2, CreditCard, ShoppingCart, Trash2, UtensilsCrossed, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { StatusButton, type StatusButtonStatus } from '../../../components/status-button'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/drawer'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../../components/ui/empty'
import { InputGroup, InputGroupTextarea } from '../../../components/ui/input-group'
import type { CartItem } from '../../../store/useCartStore'
import type { CheckoutPhase } from '../hooks/useTelebirrCheckout'
import type { CreatedOrderModel } from '../customer-ordering.types'
import { buildCartKey, formatBirr } from '../customer-ordering.utils'
import { QuantityStepper } from './QuantityStepper'

type CheckoutCartDrawerProps = {
  cart: CartItem[]
  checkoutLoading: boolean
  checkoutPhase: CheckoutPhase
  deleteItem: (id: string, remark?: string) => void
  incrementItem: (id: string, remark?: string) => void
  lastOrder: CreatedOrderModel | null
  note: string
  onClear: () => void
  onOpenChange: (open: boolean) => void
  onPay: () => Promise<void>
  open: boolean
  removeItem: (id: string, remark?: string) => void
  setNote: (value: string) => void
  totalPrice: number
  totalQuantity: number
}

export function CheckoutCartDrawer(props: CheckoutCartDrawerProps) {
  const [error, setError] = useState<string | null>(null)
  const isWorking = props.checkoutLoading || ['creating_order', 'contacting_telebirr', 'opening_checkout'].includes(props.checkoutPhase)
  const locked = isWorking

  async function submit() {
    setError(null)
    try {
      await props.onPay()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Drawer
      open={props.open}
      onOpenChange={(open) => {
        if (locked && !open) return
        props.onOpenChange(open)
      }}
      direction="bottom"
    >
      <DrawerContent className="mx-auto max-h-[91svh] w-full max-w-[480px] overflow-hidden rounded-t-[2rem] border-0 bg-[#f7f7f5] p-0 shadow-[0_-24px_70px_rgba(0,0,0,0.22)]">
        <DrawerHeader className="grid grid-cols-[44px_1fr_44px] items-center px-5 pb-3 pt-4 text-center">
          <Button type="button" variant="ghost" size="icon" className="size-11 rounded-full" aria-label="Back" disabled={locked} onClick={() => props.onOpenChange(false)}>
            <ArrowLeft />
          </Button>
          <div>
            <DrawerTitle className="text-[22px] font-black text-[#151515]">Cart</DrawerTitle>
            <DrawerDescription>{props.totalQuantity} items selected</DrawerDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" className="size-11 rounded-full" disabled={!props.cart.length || locked} onClick={props.onClear} aria-label="Clear cart">
            <Trash2 />
          </Button>
        </DrawerHeader>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3">
            <span className="grid size-9 place-items-center rounded-full bg-neutral-100">
              <UtensilsCrossed className="size-5" />
            </span>
            <div>
              <p className="text-[14px] font-black text-[#151515]">Dine-in order</p>
              <p className="text-xs font-medium text-neutral-500">Your order is linked to this table.</p>
            </div>
          </div>

          {props.cart.length === 0 ? (
            <Empty className="min-h-[260px] rounded-[1.6rem] border-0 bg-white/80">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingCart />
                </EmptyMedia>
                <EmptyTitle>Your cart is empty</EmptyTitle>
                <EmptyDescription>Add items from the menu to continue.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-[1.35rem] border border-black/5 bg-white">
              {props.cart.map((line, index) => (
                <article key={buildCartKey(line.id, line.remark)} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 ${index > 0 ? 'border-t border-black/5' : ''}`}>
                  <div className="min-w-0">
                    <h3 className="truncate text-[16px] font-black text-[#151515]">{line.name}</h3>
                    {line.remark ? <p className="mt-1 line-clamp-2 text-xs font-semibold text-neutral-500">{line.remark}</p> : null}
                    <strong className="mt-2 block text-[18px] font-black text-[#151515]">{formatBirr(line.price)}</strong>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={locked}
                      onClick={() => props.deleteItem(line.id, line.remark)}
                      aria-label={`Remove ${line.name}`}
                    >
                      <X className="size-4" />
                    </Button>
                    <QuantityStepper
                      disabled={locked}
                      onDecrement={() => props.removeItem(line.id, line.remark)}
                      onIncrement={() => props.incrementItem(line.id, line.remark)}
                      quantity={line.quantity}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-baseline justify-between rounded-[1.15rem] border border-black/5 bg-white px-4 py-5">
            <span className="text-[16px] font-medium text-neutral-500">Total</span>
            <strong className="text-[26px] font-black text-[#151515]">{formatBirr(props.totalPrice)}</strong>
          </div>

          <label className="mt-3 block">
            <span className="mb-2 block text-[13px] font-black text-[#151515]">Order note</span>
            <InputGroup className="min-h-[88px] rounded-[1.15rem] border-black/5 bg-white">
              <InputGroupTextarea
                maxLength={120}
                value={props.note}
                disabled={locked}
                onChange={(e) => props.setNote(e.target.value)}
                placeholder="Write taste or serving requests"
              />
            </InputGroup>
          </label>

          {isWorking ? <PaymentProgress phase={props.checkoutPhase} /> : null}
          {props.lastOrder ? (
            <Alert className="mt-3 rounded-2xl border-green-100 bg-green-50 text-green-700">
              <CheckCircle2 />
              <AlertTitle>Last order: {props.lastOrder.orderNo}</AlertTitle>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive" className="mt-3 rounded-2xl">
              <AlertTitle>Checkout needs attention</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="grid grid-cols-[0.74fr_1.5fr] gap-3 px-5 pb-[calc(18px+env(safe-area-inset-bottom))] pt-4">
          <Button type="button" variant="outline" className="h-[54px] rounded-[1.05rem] border-black/5 bg-white font-black" disabled={locked} onClick={() => props.onOpenChange(false)}>
            Continue
          </Button>
          <StatusButton
            status={buttonStatus(props.checkoutPhase, props.checkoutLoading, Boolean(error))}
            idleText="Pay with Telebirr"
            loadingText={buttonText(props.checkoutPhase)}
            successText="Opening"
            errorText="Try again"
            disabled={!props.cart.length}
            onClick={() => void submit()}
            trailing={null}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function buttonStatus(phase: CheckoutPhase, loading: boolean, hasError: boolean): StatusButtonStatus {
  if (hasError || phase === 'failed') return 'error'
  if (phase === 'opening_checkout') return 'success'
  if (loading || phase === 'creating_order' || phase === 'contacting_telebirr') return 'loading'
  return 'idle'
}

function buttonText(phase: CheckoutPhase): string {
  if (phase === 'creating_order') return 'Creating order'
  if (phase === 'contacting_telebirr') return 'Preparing Telebirr'
  if (phase === 'opening_checkout') return 'Opening checkout'
  return 'Processing'
}

function PaymentProgress({ phase }: { phase: CheckoutPhase }) {
  const steps = [
    ['creating_order', 'Creating your order'],
    ['contacting_telebirr', 'Preparing Telebirr'],
    ['opening_checkout', 'Opening checkout'],
  ] as const
  const activeIndex = Math.max(0, steps.findIndex(([id]) => id === phase))

  return (
    <div className="mt-3 rounded-[1.15rem] border border-black/5 bg-white px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-red-50 text-red-500">
          <CreditCard className="size-5" />
        </span>
        <div>
          <p className="text-[14px] font-black text-[#151515]">Payment in progress</p>
          <p className="text-xs font-medium text-neutral-500">Keep this sheet open while Telebirr starts.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {steps.map(([id, label], index) => (
          <div key={id} className="flex items-center gap-3 text-sm font-semibold">
            <span className={`size-2.5 rounded-full ${index <= activeIndex ? 'bg-red-500' : 'bg-neutral-200'}`} />
            <span className={index <= activeIndex ? 'text-[#151515]' : 'text-neutral-400'}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
