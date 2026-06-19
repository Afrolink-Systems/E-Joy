import { ArrowLeft, ChevronDown, ClipboardList, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { CustomerThemeStyle, MenuItem } from '../customer-ordering.types'
import { resolveProductImageUrl } from '../customer-ordering.utils'
import { CartQuantityControl } from './CartQuantityControl'
import { FloatingCartBar } from './FloatingCartBar'

type ItemDetailDrawerProps = {
  cartQuantity: number
  cartTotalPrice: number
  cartTotalQuantity: number
  item: MenuItem | null
  onAdd: () => void
  onCheckout: () => Promise<void>
  onOpenCart: () => void
  onOpenChange: (open: boolean) => void
  onRemove: () => void
  themePreset: string
  themeVars: CustomerThemeStyle
}

export function ItemDetailDrawer({
  cartQuantity,
  cartTotalPrice,
  cartTotalQuantity,
  item,
  onAdd,
  onCheckout,
  onOpenCart,
  onOpenChange,
  onRemove,
  themePreset,
  themeVars,
}: ItemDetailDrawerProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(false)

  useEffect(() => {
    if (!item) return
    setDetailsOpen(false)
    setReviewsOpen(false)
  }, [item])

  if (!item) return null

  const description = itemDescription(item)

  function checkout() {
    onCheckout().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      toast.error(message)
    })
  }

  return (
    <section
      className="fixed inset-y-0 left-1/2 z-50 flex w-[min(480px,100vw)] -translate-x-1/2 flex-col overflow-hidden bg-background text-foreground"
      data-theme={themePreset}
      style={themeVars}
      aria-label={`${item.name} details`}
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-[calc(104px+env(safe-area-inset-bottom))]">
        <div className="relative">
          <button
            type="button"
            className="absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] z-10 grid size-8 place-items-center rounded-full bg-card/95 text-primary ring-1 ring-border transition active:scale-95"
            onClick={() => onOpenChange(false)}
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-4" strokeWidth={2.2} />
          </button>
          <img
            className="h-[42svh] max-h-[330px] min-h-[245px] w-full object-cover max-[370px]:h-[38svh] max-[370px]:min-h-[215px]"
            src={resolveProductImageUrl(item.imageUrl)}
            alt=""
          />
        </div>

        <section className="px-5 pb-1 pt-4 max-[370px]:px-4">
          <h1 className="text-[21px] font-bold leading-tight text-foreground max-[370px]:text-[19px]">
            {item.name}
          </h1>
          <p className="mt-1.5 max-w-[330px] text-[12px] font-normal leading-5 text-muted-foreground max-[370px]:text-[11px] max-[370px]:leading-4">
            {description}
          </p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <strong className="leading-none text-primary">
              <span className="text-[22px] font-semibold max-[370px]:text-[19px]">
                {formatDetailPrice(item.unitPrice)}
              </span>
              <span className="ml-1 text-[13px] font-normal max-[370px]:text-[11px]">
                ETB
              </span>
            </strong>
            <CartQuantityControl
              addLabel={`Add ${item.name}`}
              incrementLabel={`Add ${item.name}`}
              onAdd={onAdd}
              onRemove={onRemove}
              quantity={cartQuantity}
              removeLabel={`Remove ${item.name}`}
              size="detail"
            />
          </div>
        </section>

        <InfoCard
          body={`${description} Prepared for your table and served warm.`}
          icon={ClipboardList}
          open={detailsOpen}
          onToggle={() => setDetailsOpen((value) => !value)}
          tone="strong"
          title="Item details"
        />
        <InfoCard
          body="No reviews yet. Be the first to share your experience!"
          icon={MessageSquareText}
          open={reviewsOpen}
          onToggle={() => setReviewsOpen((value) => !value)}
          title="Notes / Reviews"
        />
      </div>

      <FloatingCartBar
        actionLabel="Checkout"
        count={cartTotalQuantity}
        disabled={cartTotalQuantity === 0}
        onAction={checkout}
        onCart={onOpenCart}
        totalPrice={cartTotalPrice}
      />
    </section>
  )
}

function InfoCard({
  body,
  icon: Icon,
  onToggle,
  open,
  title,
  tone = 'soft',
}: {
  body: string
  icon: typeof ClipboardList
  onToggle: () => void
  open: boolean
  title: string
  tone?: 'soft' | 'strong'
}) {
  return (
    <section className="mx-5 mt-2.5 rounded-xl bg-card text-card-foreground shadow-[0_6px_16px_rgba(20,20,20,0.035)] max-[370px]:mx-4">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[30px_minmax(0,1fr)_18px] items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span className={`grid size-7 place-items-center rounded-full ${tone === 'strong' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h2 className="truncate text-[14px] font-semibold leading-tight">{title}</h2>
        <ChevronDown className={`size-3.5 text-primary transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.3} />
      </button>
      {open ? (
        <p className="px-3.5 pb-3 pl-[54px] text-[12px] font-normal leading-5 text-muted-foreground">
          {body}
        </p>
      ) : null}
    </section>
  )
}

function formatDetailPrice(cents: number): string {
  const amount = cents / 100
  return Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)
}

function itemDescription(item: MenuItem): string {
  const category = item.categoryMeta?.name?.trim()
  if (category && category !== 'All') {
    return `Traditional ${category.toLowerCase()} favorite prepared with warm seasoning.`
  }
  return 'Traditional Ethiopian favorite prepared with warm seasoning.'
}
