import { Minus, Plus } from 'lucide-react'

type CartQuantityControlProps = {
  addLabel?: string
  incrementLabel?: string
  onAdd: () => void
  onRemove: () => void
  quantity: number
  removeLabel?: string
  size?: 'sm' | 'md'
}

export function CartQuantityControl({
  addLabel = 'Add item',
  incrementLabel = 'Increase quantity',
  onAdd,
  onRemove,
  quantity,
  removeLabel = 'Decrease quantity',
  size = 'sm',
}: CartQuantityControlProps) {
  const buttonSize = size === 'md' ? 'size-9' : 'size-7'
  const iconSize = size === 'md' ? 'size-5' : 'size-3.5'
  const textSize = size === 'md' ? 'text-[17px]' : 'text-[15px]'
  const gap = size === 'md' ? 'gap-2' : 'gap-1.5'

  if (quantity <= 0) {
    return (
      <button
        type="button"
        className={`${buttonSize} grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-none transition hover:bg-primary/90 active:scale-95`}
        onClick={onAdd}
        aria-label={addLabel}
      >
        <Plus className={iconSize} strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <div className={`inline-flex shrink-0 items-center ${gap} text-foreground`}>
      <button
        type="button"
        className={`${buttonSize} grid place-items-center rounded-full border border-primary/65 bg-card text-primary transition active:scale-95`}
        onClick={onRemove}
        aria-label={removeLabel}
      >
        <Minus className={iconSize} strokeWidth={2.5} />
      </button>
      <span className={`min-w-5 text-center ${textSize} font-semibold tabular-nums`}>
        {quantity}
      </span>
      <button
        type="button"
        className={`${buttonSize} grid place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 active:scale-95`}
        onClick={onAdd}
        aria-label={incrementLabel}
      >
        <Plus className={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  )
}
