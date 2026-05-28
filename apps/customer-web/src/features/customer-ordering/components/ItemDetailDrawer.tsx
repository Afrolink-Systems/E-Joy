import { ChevronDown, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/drawer'
import { Switch } from '../../../components/ui/switch'
import type { MenuItem } from '../customer-ordering.types'
import { formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'
import { QuantityStepper } from './QuantityStepper'

type ItemDetailDrawerProps = {
  item: MenuItem | null
  onAdd: (quantity: number, remark: string) => void
  onOpenChange: (open: boolean) => void
}

export function ItemDetailDrawer({
  item,
  onAdd,
  onOpenChange,
}: ItemDetailDrawerProps) {
  const [quantity, setQuantity] = useState(1)
  const [protein] = useState('Chicken')
  const [extraAvocado, setExtraAvocado] = useState(true)
  const [extraSauce, setExtraSauce] = useState(false)

  useEffect(() => {
    if (!item) return
    setQuantity(1)
    setExtraAvocado(true)
    setExtraSauce(false)
  }, [item])

  const addOnsTotal = (extraAvocado ? 1000 : 0) + (extraSauce ? 500 : 0)
  const total = item ? item.unitPrice * quantity + addOnsTotal * quantity : 0
  const remark = [
    `Protein: ${protein}`,
    extraAvocado ? 'Extra avocado' : '',
    extraSauce ? 'Extra sauce' : '',
  ].filter(Boolean).join(' - ')

  return (
    <Drawer open={Boolean(item)} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto h-[96svh] max-h-[96svh] w-full max-w-[480px] overflow-hidden rounded-t-[1.65rem] border-0 bg-[#f7f7f5] p-0 shadow-[0_-24px_70px_rgba(0,0,0,0.22)] before:hidden">
        {item ? (
          <div className="no-scrollbar h-full overflow-y-auto bg-[#f7f7f5]">
            <div className="relative min-h-[250px] overflow-hidden bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.98),rgba(242,238,232,0.97)_58%,rgba(226,219,208,0.94))] px-5 pb-7 pt-2 max-[370px]:min-h-[232px]">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-4 top-9 z-10 size-10 rounded-full bg-white/95 text-[#151515] shadow-[0_10px_24px_rgba(20,20,20,0.12)] max-[370px]:right-3 max-[370px]:top-8"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </Button>
              <img
                className="mx-auto -mt-1 h-[228px] w-[min(78vw,330px)] rounded-full object-cover shadow-[0_18px_44px_rgba(70,45,18,0.16)] max-[370px]:h-[202px] max-[370px]:w-[min(76vw,282px)]"
                src={resolveProductImageUrl(item.imageUrl)}
                alt=""
              />
            </div>

            <div className="-mt-5 rounded-t-[2rem] bg-white px-5 pb-[calc(28px+env(safe-area-inset-bottom))] pt-6 shadow-[0_-16px_36px_rgba(20,20,20,0.06)] max-[370px]:px-4">
              <DrawerHeader className="p-0 text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <DrawerTitle className="truncate text-[24px] font-black leading-tight text-[#151515] max-[370px]:text-[22px]">{item.name}</DrawerTitle>
                    <DrawerDescription className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-black text-amber-700">
                      <Sparkles className="size-3.5 fill-amber-500 text-amber-500" />
                      Chef's pick
                    </DrawerDescription>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-[12px] font-black text-red-500">
                      Popular
                    </span>
                    <strong className="mt-3 block text-[20px] font-black text-[#151515] max-[370px]:text-[18px]">{formatBirr(item.unitPrice)}</strong>
                  </div>
                </div>
                <p className="mt-5 border-b border-black/8 pb-5 text-[14px] font-medium leading-6 text-neutral-600">
                  A layered plate with fresh ingredients, warm seasoning, and our house sauce. Customize it the way you like before adding it to your cart.
                </p>
              </DrawerHeader>

              <div className="mt-5">
                <h3 className="text-[15px] font-black text-[#151515]">Customize your dish</h3>
                <div className="mt-4 grid gap-5">
                  <div className="flex min-h-11 items-center justify-between gap-4">
                    <span className="text-sm font-medium text-neutral-600">Protein</span>
                    <button type="button" className="inline-flex h-11 items-center gap-3 rounded-2xl bg-white px-4 text-sm font-semibold text-[#151515] shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                      {protein}
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                  <OptionRow label="Extra Avocado" price="+ 10 ETB" checked={extraAvocado} onCheckedChange={setExtraAvocado} />
                  <OptionRow label="Extra Sauce" price="+ 5 ETB" checked={extraSauce} onCheckedChange={setExtraSauce} />
                </div>
              </div>

              <div className="mt-7 flex items-center justify-between gap-4">
                <QuantityStepper
                  onDecrement={() => setQuantity((v) => Math.max(1, v - 1))}
                  onIncrement={() => setQuantity((v) => v + 1)}
                  quantity={quantity}
                />
                <Button
                  type="button"
                  className="h-[54px] min-w-0 flex-1 rounded-[1.05rem] bg-[#151515] px-5 text-[16px] font-black text-white hover:bg-[#252525]"
                  onClick={() => onAdd(quantity, remark)}
                >
                  <span>Add to cart</span>
                  <span className="ml-auto">{formatBirr(total)}</span>
                </Button>
              </div>

              <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-xl bg-amber-50 px-5 py-3 text-[13px] font-semibold text-amber-700">
                <Sparkles className="size-4 fill-amber-500 text-amber-500" />
                Chef recommended with extra sauce
              </div>
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

function OptionRow({
  checked,
  label,
  onCheckedChange,
  price,
}: {
  checked: boolean
  label: string
  onCheckedChange: (value: boolean) => void
  price: string
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <span className="text-sm font-medium text-neutral-600">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-red-500">{price}</span>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    </div>
  )
}
