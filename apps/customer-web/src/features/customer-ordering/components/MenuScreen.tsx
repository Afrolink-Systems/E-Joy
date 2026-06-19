import { Home, Info, Search, ShoppingBasket, UserRound, X } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../../components/ui/empty'
import type { CartItem } from '../../../store/useCartStore'
import type { MenuCategory, MenuItem } from '../customer-ordering.types'
import { formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'
import { CartQuantityControl } from './CartQuantityControl'
import { FloatingCartBar } from './FloatingCartBar'
import { MenuSkeleton } from './MenuSkeleton'

type MenuScreenProps = {
  cart: CartItem[]
  categories: MenuCategory[]
  error?: string
  loading: boolean
  menuRows: MenuItem[]
  onAdd: (item: MenuItem) => void
  onRemove: (item: MenuItem) => void
  onCheckout: () => Promise<void>
  onOpenAccount: () => void
  onOpenCart: () => void
  onOpenDetail: (item: MenuItem) => void
  onOpenHome: () => void
  onOpenInfo: () => void
  onRefetch: () => void
  search: string
  selectedCategory: string
  setSearch: (value: string) => void
  setSelectedCategory: (value: string) => void
  showFloatingCartBar: boolean
  shopName: string
  tableRef: string
  totalPrice: number
  totalQuantity: number
  visibleRows: MenuItem[]
}

export function MenuScreen(props: MenuScreenProps) {
  const hasCartItems = props.totalQuantity > 0

  function checkout() {
    props.onCheckout().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Checkout failed'
      toast.error(message)
    })
  }

  return (
    <section className="relative flex h-svh min-h-svh flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+10px)] max-[370px]:px-3">
        <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-card text-card-foreground ring-1 ring-border transition active:scale-95"
            onClick={props.onOpenHome}
            aria-label="Go home"
          >
            <Home className="size-5" />
          </button>

          <div className="min-w-0 text-center">
            <button
              type="button"
              className="mx-auto flex max-w-[260px] items-center justify-center gap-1 truncate text-[13px] font-semibold text-foreground transition hover:text-foreground max-[370px]:max-w-[220px] max-[370px]:text-[12px]"
              onClick={props.onOpenInfo}
            >
              <span className="truncate">{props.shopName}</span>
              <span className="text-muted-foreground" aria-hidden="true">
                &middot;
              </span>
              <span className="shrink-0 text-primary">Table {props.tableRef}</span>
              <Info className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </div>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-card text-card-foreground ring-1 ring-border transition active:scale-95"
            onClick={props.onOpenAccount}
            aria-label="Open account"
          >
            <UserRound className="size-5" />
          </button>
        </div>

        <label className="mt-4 flex h-11 min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-card-foreground">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            type="search"
            value={props.search}
            onChange={(event) => props.setSearch(event.target.value)}
            placeholder="Search menu"
            className="min-w-0 flex-1 border-0 bg-transparent text-[15px] font-medium text-card-foreground outline-none placeholder:text-muted-foreground"
          />
          {props.search ? (
            <button
              type="button"
              onClick={() => props.setSearch('')}
              className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition active:scale-95"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </label>
      </header>

      {props.error ? (
        <Alert variant="destructive" className="mx-4 mt-3 w-auto rounded-2xl max-[370px]:mx-3">
          <AlertTitle>Menu could not load</AlertTitle>
          <AlertDescription>{props.error}</AlertDescription>
          <Button type="button" variant="ghost" size="sm" onClick={props.onRefetch}>
            Retry
          </Button>
        </Alert>
      ) : null}

      <div className="no-scrollbar mt-4 flex shrink-0 gap-2 overflow-x-auto px-4 pb-1 max-[370px]:px-3">
        {props.categories.map((category, index) => (
          <CategoryButton
            key={category.name}
            active={
              props.selectedCategory === category.name ||
              (!props.selectedCategory && index === 0)
            }
            category={category}
            onClick={() => props.setSelectedCategory(category.name)}
          />
        ))}
      </div>

      <div className="mt-3 min-h-0 flex-1 overflow-hidden px-4 max-[370px]:px-3">
        <div className="no-scrollbar h-full min-w-0 overflow-y-auto pb-[132px]">
          {props.loading ? (
            <MenuSkeleton />
          ) : props.visibleRows.length === 0 ? (
            <Empty className="min-h-[320px] rounded-2xl border-0 bg-card/70">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBasket />
                </EmptyMedia>
                <EmptyTitle>No menu items found</EmptyTitle>
                <EmptyDescription>Try another search or category.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {props.visibleRows.map((item) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  onAdd={() => props.onAdd(item)}
                  onRemove={() => props.onRemove(item)}
                  onOpen={() => props.onOpenDetail(item)}
                  quantity={cartQuantityForItem(props.cart, item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {hasCartItems && props.showFloatingCartBar ? (
        <FloatingCartBar
          actionLabel="Checkout"
          count={props.totalQuantity}
          onAction={checkout}
          onCart={props.onOpenCart}
          totalPrice={props.totalPrice}
        />
      ) : null}
    </section>
  )
}

function CategoryButton({
  active,
  category,
  onClick,
}: {
  active: boolean
  category: MenuCategory
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full border px-4 text-[12px] font-semibold transition max-[370px]:h-8 max-[370px]:px-3 max-[370px]:text-[11px] ${
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'
      }`}
      title={category.name}
    >
      {category.name}
    </button>
  )
}

function ProductRow({
  item,
  onAdd,
  onRemove,
  onOpen,
  quantity,
}: {
  item: MenuItem
  onAdd: () => void
  onRemove: () => void
  onOpen: () => void
  quantity: number
}) {
  return (
    <article className="grid min-h-[102px] grid-cols-[86px_minmax(0,1fr)_92px] items-center gap-3 border-b border-border/70 pb-3 last:border-b-0 max-[370px]:grid-cols-[76px_minmax(0,1fr)_84px] max-[370px]:gap-2.5">
      <button
        type="button"
        onClick={onOpen}
        className="overflow-hidden rounded-[14px] bg-muted transition active:scale-[0.98]"
        aria-label={`View ${item.name}`}
      >
        <img
          src={resolveProductImageUrl(item.imageUrl)}
          alt=""
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 text-left transition active:scale-[0.99]"
        aria-label={`View ${item.name}`}
      >
        <h2 className="line-clamp-2 text-[16px] font-bold leading-snug text-foreground max-[370px]:text-[15px]">{item.name}</h2>
        <strong className="mt-2 block text-[18px] font-extrabold leading-none text-foreground max-[370px]:text-[17px]">
          {formatBirr(item.unitPrice)}
        </strong>
      </button>
      <div className="justify-self-end">
        <CartQuantityControl
          addLabel={`Add ${item.name}`}
          incrementLabel={`Add ${item.name}`}
          onAdd={onAdd}
          onRemove={onRemove}
          quantity={quantity}
          removeLabel={`Remove ${item.name}`}
        />
      </div>
    </article>
  )
}

function cartQuantityForItem(cart: CartItem[], itemId: string): number {
  return cart
    .filter((line) => line.id === itemId)
    .reduce((sum, line) => sum + line.quantity, 0)
}
