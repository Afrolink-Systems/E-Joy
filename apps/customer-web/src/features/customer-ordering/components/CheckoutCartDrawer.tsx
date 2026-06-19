import { ArrowLeft, ClipboardCheck, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '../../../components/ui/empty'
import { InputGroup, InputGroupTextarea } from '../../../components/ui/input-group'
import type { CartItem } from '../../../store/useCartStore'
import type { CustomerThemeStyle } from '../customer-ordering.types'
import { buildCartKey, formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'
import { QuantityStepper } from './QuantityStepper'

type CheckoutCartDrawerProps = {
  cart: CartItem[]
  checkoutLoading: boolean
  deleteItem: (id: string, remark?: string) => void
  incrementItem: (id: string, remark?: string) => void
  note: string
  onClear: () => void
  onOpenChange: (open: boolean) => void
  onPay: () => Promise<void>
  open: boolean
  removeItem: (id: string, remark?: string) => void
  setNote: (value: string) => void
  themePreset: string
  themeVars: CustomerThemeStyle
  totalPrice: number
  totalQuantity: number
}

export function CheckoutCartDrawer(props: CheckoutCartDrawerProps) {
  const locked = props.checkoutLoading

  if (!props.open) return null

  async function submit() {
    await props.onPay()
  }

  return (
    <section
      className="fixed inset-y-0 left-1/2 z-50 flex w-[min(480px,100vw)] -translate-x-1/2 flex-col bg-background text-foreground"
      data-theme={props.themePreset}
      style={props.themeVars}
      aria-label="Order cart"
    >
      <header className="grid grid-cols-[40px_1fr_40px] items-center gap-2 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+10px)]">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full text-foreground transition active:scale-95"
          aria-label="Back to menu"
          disabled={locked}
          onClick={() => props.onOpenChange(false)}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[20px] font-extrabold leading-tight">Order cart</h1>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">{props.totalQuantity} items selected</p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-10 rounded-full" disabled={!props.cart.length || locked} onClick={props.onClear} aria-label="Clear cart">
          <Trash2 className="size-5" />
        </Button>
      </header>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(128px+env(safe-area-inset-bottom))]">
        <section className="rounded-[28px] bg-foreground px-3 pb-3 pt-4 text-background">
          <p className="px-3 text-[15px] font-bold">Before you order</p>
          <div className="mt-3 flex items-center gap-3 rounded-[22px] bg-card px-4 py-4 text-card-foreground">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardCheck className="size-7" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[18px] font-extrabold">Review your items</h2>
              <p className="mt-1 text-[13px] font-medium leading-5 text-muted-foreground">
                Check your cart before payment starts.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[20px] bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <ShoppingBag className="size-5 shrink-0 text-primary" />
              <h2 className="truncate text-[18px] font-extrabold">Cart</h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{props.totalQuantity} items</span>
          </div>

          {props.cart.length === 0 ? (
            <Empty className="min-h-[260px] border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>Your cart is empty</EmptyTitle>
                <EmptyDescription>Add items from the menu to continue.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="divide-y divide-border">
              {props.cart.map((line) => (
                <CartLine
                  key={buildCartKey(line.id, line.remark)}
                  disabled={locked}
                  line={line}
                  onDelete={() => props.deleteItem(line.id, line.remark)}
                  onIncrement={() => props.incrementItem(line.id, line.remark)}
                  onRemove={() => props.removeItem(line.id, line.remark)}
                />
              ))}
            </div>
          )}
        </section>

        <label className="mt-4 block">
          <span className="mb-2 block text-[13px] font-bold text-foreground">Order note</span>
          <InputGroup className="min-h-[72px] rounded-2xl border-border bg-card">
            <InputGroupTextarea
              maxLength={120}
              value={props.note}
              disabled={locked}
              onChange={(event) => props.setNote(event.target.value)}
              placeholder="Write taste or serving requests"
            />
          </InputGroup>
        </label>

      </div>

      <footer className="fixed bottom-0 left-1/2 z-10 grid w-[min(480px,100vw)] -translate-x-1/2 grid-cols-[0.78fr_1fr] gap-3 border-t border-border bg-background/96 px-4 py-3 pb-[calc(14px+env(safe-area-inset-bottom))] backdrop-blur">
        <Button type="button" variant="outline" className="h-12 rounded-full border-border bg-card font-bold" disabled={locked} onClick={() => props.onOpenChange(false)}>
          Modify items
        </Button>
        <Button
          type="button"
          className="h-12 rounded-full bg-primary text-[15px] font-bold text-primary-foreground hover:bg-primary/90"
          disabled={!props.cart.length || locked}
          onClick={() => void submit()}
        >
          Pay with Telebirr
        </Button>
      </footer>
    </section>
  )
}

function CartLine({
  disabled,
  line,
  onDelete,
  onIncrement,
  onRemove,
}: {
  disabled: boolean
  line: CartItem
  onDelete: () => void
  onIncrement: () => void
  onRemove: () => void
}) {
  return (
    <article className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 py-4">
      <img
        src={resolveProductImageUrl(line.imageUrl)}
        alt=""
        className="size-16 rounded-[14px] bg-muted object-cover"
      />
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-bold">{line.name}</h3>
        {line.remark ? <p className="mt-1 line-clamp-2 text-xs font-semibold text-muted-foreground">{line.remark}</p> : null}
        <strong className="mt-2 block text-[17px] font-extrabold">{formatBirr(line.price)}</strong>
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-muted-foreground underline-offset-4 hover:underline"
          disabled={disabled}
          onClick={onDelete}
        >
          Remove
        </button>
      </div>
      <QuantityStepper
        disabled={disabled}
        onDecrement={onRemove}
        onIncrement={onIncrement}
        quantity={line.quantity}
      />
    </article>
  )
}
