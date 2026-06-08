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
    <div className="inline-flex h-11 items-center gap-3 rounded-2xl bg-background px-2 text-foreground shadow-[0_8px_20px_rgba(0,0,0,0.07)]">
      <Button type="button" variant="ghost" size="icon-sm" className="size-8 rounded-full text-foreground" disabled={disabled} onClick={onDecrement} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </Button>
      <span className="min-w-6 text-center text-[19px] font-black tabular-nums">{quantity}</span>
      <Button type="button" variant="ghost" size="icon-sm" className="size-8 rounded-full text-foreground" disabled={disabled} onClick={onIncrement} aria-label="Increase quantity">
        <Plus className="size-4" />
      </Button>
    </div>
  )
}
