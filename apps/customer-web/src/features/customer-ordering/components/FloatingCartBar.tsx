import { ArrowRight, ShoppingCart } from 'lucide-react'
import { formatBirr } from '../customer-ordering.utils'

type FloatingCartBarProps = {
  actionLabel: string
  count?: number
  onAction: () => void
  onCart: () => void
  totalPrice: number
}

export function FloatingCartBar({
  actionLabel,
  count = 0,
  onAction,
  onCart,
  totalPrice,
}: FloatingCartBarProps) {
  return (
    <div className="fixed bottom-[calc(18px+env(safe-area-inset-bottom))] left-1/2 z-[55] flex h-[74px] w-[min(430px,calc(100vw-20px))] -translate-x-1/2 items-center rounded-full bg-primary px-5 text-primary-foreground shadow-[0_-10px_28px_rgba(150,92,8,0.24)] max-[370px]:h-[66px] max-[370px]:px-4">
      <button
        type="button"
        onClick={onCart}
        className="relative grid h-full w-[66px] shrink-0 place-items-center rounded-full transition active:scale-[0.97] max-[370px]:w-[58px]"
        aria-label="Review cart"
      >
        <ShoppingCart className="size-8 max-[370px]:size-7" strokeWidth={2.15} />
        {count > 0 ? (
          <span className="absolute right-1.5 top-3 grid size-7 place-items-center rounded-full bg-card text-[14px] font-bold text-card-foreground shadow-sm max-[370px]:top-2.5 max-[370px]:size-6 max-[370px]:text-[12px]">
            {count}
          </span>
        ) : null}
      </button>
      <span className="mx-4 h-11 w-px shrink-0 bg-primary-foreground/45 max-[370px]:mx-3 max-[370px]:h-9" />
      <div className="min-w-0 flex-1">
        <strong className="block truncate text-[27px] font-bold leading-none tracking-normal max-[370px]:text-[22px]">
          {formatBirr(totalPrice)}
        </strong>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="flex h-full shrink-0 items-center gap-2 rounded-full px-2 text-[23px] font-bold tracking-normal transition active:scale-[0.98] max-[370px]:gap-1.5 max-[370px]:text-[18px]"
      >
        <span>{actionLabel}</span>
        <ArrowRight className="size-8 max-[370px]:size-6" strokeWidth={2.3} />
      </button>
    </div>
  )
}
