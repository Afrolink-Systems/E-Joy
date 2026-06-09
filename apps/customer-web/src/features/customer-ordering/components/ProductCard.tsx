import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import type { MenuItem } from '../customer-ordering.types'
import { formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'

type ProductCardProps = {
  item: MenuItem
  onAdd: () => void
  onOpen: () => void
}

export function ProductCard({ item, onAdd, onOpen }: ProductCardProps) {
  const categoryName = item.categoryMeta.name
  return (
    <article className="relative grid min-h-[104px] grid-cols-[92px_minmax(0,1fr)] gap-2.5 rounded-[1.2rem] border border-border bg-card/85 p-2 text-card-foreground shadow-[0_10px_24px_rgba(20,20,20,0.055)] min-[431px]:min-h-[112px] min-[431px]:grid-cols-[100px_minmax(0,1fr)] min-[431px]:gap-3 min-[431px]:rounded-[1.35rem] min-[431px]:p-2.5 max-[370px]:min-h-[96px] max-[370px]:grid-cols-[78px_minmax(0,1fr)]">
      <button
        type="button"
        className="block size-[84px] overflow-hidden rounded-[0.95rem] bg-neutral-100 text-left min-[431px]:size-[94px] min-[431px]:rounded-[1.05rem] max-[370px]:size-[72px]"
        onClick={onOpen}
        aria-label={`View ${item.name}`}
      >
        <img src={resolveProductImageUrl(item.imageUrl)} alt="" className="size-full object-cover" />
      </button>
      <div className="flex min-w-0 flex-col py-0.5 pr-9 max-[370px]:pr-8">
        <button
          type="button"
          className="truncate border-0 bg-transparent p-0 text-left text-[16px] font-black leading-tight text-card-foreground max-[370px]:text-[15px]"
          onClick={onOpen}
        >
          {item.name}
        </button>
        <span className="mt-1.5 truncate text-xs font-semibold text-muted-foreground max-[370px]:text-[11px]">
          {categoryName}
        </span>
        <strong className="mt-auto text-[17px] font-black max-[370px]:text-[16px]">{formatBirr(item.unitPrice)}</strong>
      </div>
      <Button
        type="button"
        size="icon"
        className="absolute bottom-2.5 right-2.5 size-9 rounded-full bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(0,0,0,0.18)] hover:bg-primary/90 max-[370px]:size-8"
        onClick={onAdd}
        aria-label={`Add ${item.name}`}
      >
        <Plus className="size-5 max-[370px]:size-4" />
      </Button>
    </article>
  )
}
