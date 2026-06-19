import { ArrowRight, ShoppingCart } from 'lucide-react'

type FloatingCartBarProps = {
  actionLabel: string
  count?: number
  disabled?: boolean
  onAction: () => void
  onCart: () => void
  totalPrice: number
}

export function FloatingCartBar({
  actionLabel,
  count = 0,
  disabled = false,
  onAction,
  onCart,
  totalPrice,
}: FloatingCartBarProps) {
  const amount = totalPrice / 100
  const price = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)

  return (
    <div className="fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-[55] flex h-[74px] w-[min(430px,calc(100vw-20px))] -translate-x-1/2 items-center rounded-full bg-primary/90 px-5 text-primary-foreground shadow-[0_-10px_28px_rgba(150,92,8,0.22)] backdrop-blur-[2px] max-[370px]:h-[66px] max-[370px]:px-4">
      <button
        type="button"
        onClick={onCart}
        className="relative grid h-full w-[66px] shrink-0 place-items-center rounded-full transition active:scale-[0.97] max-[370px]:w-[58px]"
        aria-label="Review cart"
      >
        <ShoppingCart className="size-8 max-[370px]:size-7" strokeWidth={2.15} />
        <span className="absolute right-2 top-[17px] grid size-5 place-items-center rounded-full bg-card text-[11px] font-semibold text-card-foreground shadow-sm max-[370px]:right-1.5 max-[370px]:top-3.5 max-[370px]:size-[18px] max-[370px]:text-[10px]">
          {count}
        </span>
      </button>
      <span className="mx-4 h-11 w-px shrink-0 bg-primary-foreground/45 max-[370px]:mx-3 max-[370px]:h-9" />
      <div className="min-w-0 flex-1">
        <strong className="block truncate leading-none tracking-normal">
          <span className="text-[22px] font-semibold max-[370px]:text-[18px]">
            {price}
          </span>
          <span className="ml-1 text-[13px] font-normal max-[370px]:text-[11px]">
            ETB
          </span>
        </strong>
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className="flex h-full shrink-0 items-center gap-2 rounded-full px-2 text-[20px] font-semibold tracking-normal transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55 max-[370px]:gap-1.5 max-[370px]:text-[17px]"
      >
        <span>{actionLabel}</span>
        <ArrowRight className="size-6 max-[370px]:size-5" strokeWidth={2.25} />
      </button>
    </div>
  )
}
