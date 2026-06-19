import { Minus, Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'

type QuantityStepperProps = {
  disabled?: boolean
  onDecrement: () => void
  onIncrement: () => void
  quantity: number
}

export function QuantityStepper({
  disabled = false,
  onDecrement,
  onIncrement,
  quantity,
}: QuantityStepperProps) {
  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-full bg-muted px-1.5 text-foreground">
      <Button type="button" variant="ghost" size="icon-sm" className="size-8 rounded-full text-foreground" disabled={disabled} onClick={onDecrement} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </Button>
      <span className="min-w-6 text-center text-[17px] font-bold tabular-nums">{quantity}</span>
      <Button type="button" variant="ghost" size="icon-sm" className="size-8 rounded-full text-foreground" disabled={disabled} onClick={onIncrement} aria-label="Increase quantity">
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
