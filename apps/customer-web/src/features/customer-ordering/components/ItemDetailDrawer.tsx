import { ArrowLeft, ChevronDown, ClipboardList, MessageSquareText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { CustomerThemeStyle, MenuItem } from '../customer-ordering.types'
import { formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'
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
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [reviewsOpen, setReviewsOpen] = useState(false)

  useEffect(() => {
    if (!item) return
    setDetailsOpen(true)
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
            className="absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] z-10 grid size-10 place-items-center rounded-full bg-card/95 text-primary ring-1 ring-border transition active:scale-95"
            onClick={() => onOpenChange(false)}
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-5" strokeWidth={2.2} />
          </button>
          <img
            className="aspect-[1.06/1] w-full object-cover"
            src={resolveProductImageUrl(item.imageUrl)}
            alt=""
          />
        </div>

        <section className="px-5 pb-2 pt-5 max-[370px]:px-4">
          <h1 className="text-[25px] font-extrabold leading-tight text-foreground max-[370px]:text-[23px]">
            {item.name}
          </h1>
          <p className="mt-2 max-w-[330px] text-[14px] font-medium leading-6 text-muted-foreground max-[370px]:text-[13px] max-[370px]:leading-5">
            {description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-4">
            <strong className="text-[28px] font-bold leading-none text-primary max-[370px]:text-[25px]">
              {formatBirr(item.unitPrice)}
            </strong>
            <CartQuantityControl
              addLabel={`Add ${item.name}`}
              incrementLabel={`Add ${item.name}`}
              onAdd={onAdd}
              onRemove={onRemove}
              quantity={cartQuantity}
              removeLabel={`Remove ${item.name}`}
              size="md"
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

      {cartTotalPrice > 0 ? (
        <FloatingCartBar
          actionLabel="Checkout"
          count={cartTotalQuantity}
          onAction={checkout}
          onCart={onOpenCart}
          totalPrice={cartTotalPrice}
        />
      ) : null}
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
    <section className="mx-5 mt-3 rounded-2xl bg-card text-card-foreground shadow-[0_8px_22px_rgba(20,20,20,0.045)] max-[370px]:mx-4">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[38px_minmax(0,1fr)_20px] items-center gap-3 px-4 py-4 text-left"
      >
        <span className={`grid size-9 place-items-center rounded-full ${tone === 'strong' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
          <Icon className="size-5" strokeWidth={2.1} />
        </span>
        <h2 className="truncate text-[16px] font-bold leading-tight">{title}</h2>
        <ChevronDown className={`size-4 text-primary transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.4} />
      </button>
      {open ? (
        <p className="px-4 pb-4 pl-[68px] text-[13px] font-medium leading-5 text-muted-foreground">
          {body}
        </p>
      ) : null}
    </section>
  )
}

function itemDescription(item: MenuItem): string {
  const category = item.categoryMeta?.name?.trim()
  if (category && category !== 'All') {
    return `Traditional ${category.toLowerCase()} favorite prepared with warm seasoning.`
  }
  return 'Traditional Ethiopian favorite prepared with warm seasoning.'
}
