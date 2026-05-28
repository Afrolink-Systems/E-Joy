import { Home, ReceiptText, UtensilsCrossed } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import type { CustomerTab } from '../customer-ordering.types'

type BottomTabsProps = {
  activeTab: CustomerTab
  onSelect: (tab: CustomerTab) => void
  totalQuantity: number
}

export function BottomTabs({
  activeTab,
  onSelect,
  totalQuantity,
}: BottomTabsProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-[35] w-[min(480px,100vw)] -translate-x-1/2 px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] max-[370px]:px-2">
      <div className="mx-auto grid h-[60px] max-w-[320px] grid-cols-3 items-center rounded-[1.45rem] border border-black/5 bg-white/94 px-2.5 shadow-[0_-10px_28px_rgba(0,0,0,0.08)] backdrop-blur min-[431px]:h-[64px] min-[431px]:max-w-[340px] min-[431px]:rounded-[1.6rem] max-[370px]:h-[58px] max-[370px]:max-w-[292px]">
        <Tab active={activeTab === 'home'} icon={Home} label="Home" onClick={() => onSelect('home')} />
        <button
          type="button"
          onClick={() => onSelect('menu')}
          className={`relative mx-auto grid size-[48px] place-items-center rounded-full transition min-[431px]:size-[52px] max-[370px]:size-11 ${activeTab === 'menu' ? 'bg-red-50 text-red-500 shadow-[0_8px_18px_rgba(239,68,68,0.13)]' : 'text-[#151515]'}`}
          aria-label="Order"
        >
          <UtensilsCrossed className="size-[23px] max-[370px]:size-[21px]" />
          {activeTab === 'menu' ? <span className="absolute bottom-1 size-1 rounded-full bg-red-500" /> : null}
          {totalQuantity > 0 ? (
            <Badge variant="destructive" className="absolute -right-1 -top-1 min-w-5 justify-center rounded-full px-1 text-[10px]">
              {totalQuantity}
            </Badge>
          ) : null}
        </button>
        <Tab active={activeTab === 'orders'} icon={ReceiptText} label="Orders" onClick={() => onSelect('orders')} />
      </div>
    </nav>
  )
}

function Tab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: typeof Home
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative mx-auto grid size-11 place-items-center rounded-full transition min-[431px]:size-12 max-[370px]:size-10 ${active ? 'bg-red-50 text-red-500 shadow-[0_8px_18px_rgba(239,68,68,0.12)]' : 'text-[#151515]'}`}
      aria-label={label}
    >
      <Icon className="size-[22px] max-[370px]:size-5" />
      {active ? <span className="absolute bottom-1 size-1 rounded-full bg-red-500" /> : null}
    </button>
  )
}
