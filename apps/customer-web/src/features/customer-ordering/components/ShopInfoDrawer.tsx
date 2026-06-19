import { Clock, MapPin, Navigation, Phone, Store, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../../../components/ui/button'
import type { CustomerThemeStyle } from '../customer-ordering.types'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '../../../components/ui/drawer'

type ShopInfoDrawerProps = {
  onOpenChange: (open: boolean) => void
  open: boolean
  shopName: string
  tableRef: string
  themePreset: string
  themeVars: CustomerThemeStyle
}

export function ShopInfoDrawer({
  onOpenChange,
  open,
  shopName,
  tableRef,
  themePreset,
  themeVars,
}: ShopInfoDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent
        data-theme={themePreset}
        style={themeVars}
        className="mx-auto max-h-[88svh] w-full max-w-[430px] rounded-t-[24px] border-border bg-background px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-2"
      >
        <DrawerHeader className="grid grid-cols-[48px_1fr_36px] items-center gap-3 px-0 pb-4 pt-5 text-left">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Store className="size-6" />
          </span>
          <div className="min-w-0">
            <DrawerTitle className="truncate text-[20px] font-semibold leading-tight">{shopName}</DrawerTitle>
            <DrawerDescription className="mt-0.5 text-[12px]">Table {tableRef}</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button type="button" variant="outline" size="icon-sm" className="rounded-full bg-card" aria-label="Close restaurant info">
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <section className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-[0_10px_28px_rgba(17,24,39,0.06)]">
          <h2 className="text-[15px] font-semibold">Restaurant information</h2>
          <div className="mt-1 flex gap-1">
            <span className="h-0.5 w-5 rounded-full bg-primary" />
            <span className="h-0.5 w-3 rounded-full bg-primary" />
          </div>

          <dl className="mt-4 divide-y divide-border">
            <InfoRow icon={<Clock className="size-4" />} label="Hours" value="Daily 8:00 - 22:00" />
            <InfoRow icon={<MapPin className="size-4" />} label="Address" value={`E-Joy demo restaurant, table ${tableRef}`} />
            <InfoRow icon={<Phone className="size-4" />} label="Phone" value="+251 900 000 000" />
          </dl>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="h-12 rounded-full bg-card text-[14px] font-medium">
            <Phone className="size-4 text-primary" />
            Call
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-full bg-card text-[14px] font-medium">
            <Navigation className="size-4 text-primary" />
            Navigate
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[38px_64px_1fr] items-center gap-2 py-3">
      <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <dt className="text-[12px] font-medium text-foreground">{label}</dt>
      <dd className="text-[12px] leading-4 text-muted-foreground">{value}</dd>
    </div>
  )
}
