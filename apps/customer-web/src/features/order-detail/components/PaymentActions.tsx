import { CheckCircle2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { formatOrderBirr } from '../order-detail.utils'

type PaymentActionsProps = {
  needsPayment: boolean
  onPay: () => void
  totalAmount: number
}

export function PaymentActions({ needsPayment, onPay, totalAmount }: PaymentActionsProps) {
  if (!needsPayment) {
    return (
      <div className="px-4 pb-5 max-[370px]:px-3">
        <div className="flex items-center gap-4 rounded-[1.1rem] border border-primary/20 bg-primary/10 p-4 text-foreground">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <CheckCircle2 className="size-7 fill-current" />
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-black">Payment status</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              This order does not need payment action right now.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <footer className="fixed bottom-0 left-1/2 z-20 grid w-[min(480px,100vw)] -translate-x-1/2 grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] items-center gap-3 border-t border-border bg-card/95 p-3 pb-[calc(12px+env(safe-area-inset-bottom))] text-card-foreground shadow-[0_-14px_30px_rgba(20,20,20,0.08)] backdrop-blur">
      <div className="min-w-0">
        <span className="block text-xs text-muted-foreground">Total</span>
        <strong className="mt-0.5 block text-[17px] font-black">{formatOrderBirr(totalAmount)}</strong>
      </div>
      <Button type="button" className="min-h-12 rounded-full bg-primary font-black text-primary-foreground hover:bg-primary/90" onClick={onPay}>
        Pay with Telebirr
      </Button>
    </footer>
  )
}
