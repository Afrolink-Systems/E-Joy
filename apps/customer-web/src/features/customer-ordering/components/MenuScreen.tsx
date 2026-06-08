import {
  CakeSlice,
  Coffee,
  CupSoda,
  Grid2X2,
  IceCreamBowl,
  Leaf,
  Plus,
  ShoppingBasket,
  ShoppingCart,
  Soup,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  AnimatedCollectionView,
  CollectionViewTabs,
  type AnimatedCollectionItem,
  type CollectionViewMode,
} from '../../../components/animated-collection'
import DiscoverButton from '../../../components/discover-button'
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../../../components/ui/empty'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../../../components/ui/resizable'
import type { CartItem } from '../../../store/useCartStore'
import type { MenuCategory, MenuItem } from '../customer-ordering.types'
import { categoryCartCount, formatBirr, resolveProductImageUrl } from '../customer-ordering.utils'
import { MenuSkeleton } from './MenuSkeleton'

type MenuScreenProps = {
  cart: CartItem[]
  categories: MenuCategory[]
  error?: string
  loading: boolean
  menuRows: MenuItem[]
  onAdd: (item: MenuItem) => void
  onOpenCart: () => void
  onOpenDetail: (item: MenuItem) => void
  onOpenInfo: () => void
  onRefetch: () => void
  search: string
  selectedCategory: string
  setSearch: (value: string) => void
  setSelectedCategory: (value: string) => void
  shopName: string
  tableRef: string
  totalPrice: number
  totalQuantity: number
  visibleRows: MenuItem[]
}

export function MenuScreen(props: MenuScreenProps) {
  const [view, setView] = useState<CollectionViewMode>('list')
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const line of props.cart) {
      const item = props.menuRows.find((row) => row.id === line.id)
      if (item) {
        const categoryName = item.categoryMeta.name
        counts.set(categoryName, (counts.get(categoryName) ?? 0) + line.quantity)
      }
    }
    return counts
  }, [props.cart, props.menuRows])

  const collectionItems = useMemo<AnimatedCollectionItem[]>(
    () =>
      props.visibleRows.map((item) => ({
        id: item.id,
        title: item.name,
        subtitle: item.categoryMeta.name,
        image: resolveProductImageUrl(item.imageUrl),
        onOpen: () => props.onOpenDetail(item),
        meta: (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="truncate text-xs font-semibold text-muted-foreground max-[370px]:text-[11px]">
              {item.categoryMeta.name}
            </span>
            <strong className="text-[17px] font-black text-card-foreground max-[370px]:text-[16px]">{formatBirr(item.unitPrice)}</strong>
          </div>
        ),
        action: (
          <Button
            type="button"
            size="icon"
            className="absolute bottom-2.5 right-2.5 size-9 rounded-full bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(0,0,0,0.18)] hover:bg-primary/90 max-[370px]:size-8"
            onClick={() => props.onAdd(item)}
            aria-label={`Add ${item.name}`}
          >
            <Plus className="size-5 max-[370px]:size-4" />
          </Button>
        ),
      })),
    [props],
  )

  return (
    <section className="relative flex h-svh min-h-svh flex-col overflow-hidden bg-background">
      <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top)+14px)] max-[370px]:px-3 max-[370px]:pt-[calc(env(safe-area-inset-top)+10px)]">
        <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-2 max-[370px]:grid-cols-[44px_minmax(0,1fr)_44px]">
          <button
            type="button"
            className="grid size-11 place-items-center overflow-hidden rounded-full bg-secondary text-secondary-foreground max-[370px]:size-10"
            onClick={props.onOpenInfo}
            aria-label="Open shop information"
          >
            <UserRound className="size-6 max-[370px]:size-5" />
          </button>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-[22px] font-black leading-none text-foreground max-[370px]:text-[20px]">Menu</h1>
            <p className="mx-auto mt-1 max-w-[220px] truncate text-xs font-semibold text-muted-foreground max-[370px]:max-w-[180px] max-[370px]:text-[11px]">
              {props.shopName} - Table {props.tableRef}
            </p>
          </div>
          <button
            type="button"
            onClick={props.onOpenCart}
            className="relative grid size-11 place-items-center rounded-[1rem] bg-card text-card-foreground shadow-[0_10px_22px_rgba(0,0,0,0.08)] max-[370px]:size-10"
            aria-label="Open cart"
          >
            <ShoppingCart className="size-6 max-[370px]:size-5" />
            {props.totalQuantity > 0 ? (
              <Badge className="absolute -right-1 -top-1 min-w-5 justify-center rounded-full px-1 text-[10px] shadow-sm ring-2 ring-background">
                {props.totalQuantity}
              </Badge>
            ) : null}
          </button>
        </div>

        <div className="mt-5 max-[370px]:mt-4">
          <DiscoverButton
            search={props.search}
            onSearchChange={props.setSearch}
            placeholder="Search menu"
          />
        </div>

        <CollectionViewTabs className="mt-4 max-[370px]:mt-3" value={view} onChange={setView} />

        {view === 'card' ? (
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 max-[370px]:-mx-3 max-[370px]:px-3">
            {props.categories.map((category) => (
              <CategoryPill
                key={category.name}
                active={props.selectedCategory === category.name}
                category={category}
                count={categoryCartCount(category.name, categoryCounts, props.totalQuantity)}
                onClick={() => props.setSelectedCategory(category.name)}
              />
            ))}
          </div>
        ) : null}
      </header>

      {props.error ? (
        <Alert variant="destructive" className="mx-4 mt-3 w-auto rounded-3xl max-[370px]:mx-3">
          <AlertTitle>Menu could not load</AlertTitle>
          <AlertDescription>{props.error}</AlertDescription>
          <Button type="button" variant="ghost" size="sm" onClick={props.onRefetch}>
            Retry
          </Button>
        </Alert>
      ) : null}

      {view !== 'card' ? (
        <ResizablePanelGroup
          className="mt-3 min-h-0 flex-1 overflow-hidden px-4 max-[370px]:px-3"
          id="customer-menu-category-rail"
          orientation="horizontal"
        >
          <ResizablePanel
            className="min-w-[50px] overflow-hidden"
            defaultSize="56px"
            maxSize="88px"
            minSize="50px"
          >
            <aside className="no-scrollbar h-full overflow-y-auto pb-[132px]">
              <div className="grid">
                {props.categories.map((category) => (
                  <CategoryTile
                    key={category.name}
                    active={props.selectedCategory === category.name}
                    category={category}
                    count={categoryCartCount(category.name, categoryCounts, props.totalQuantity)}
                    onClick={() => props.setSelectedCategory(category.name)}
                  />
                ))}
              </div>
            </aside>
          </ResizablePanel>

          <ResizableHandle
            className="mx-1 w-px bg-border after:w-3 hover:bg-border/80 focus-visible:bg-ring"
            withHandle
          />

          <ResizablePanel
            className="min-w-0 overflow-hidden"
            defaultSize="100%"
            minSize="220px"
          >
            <div className="no-scrollbar h-full min-w-0 overflow-y-auto pb-[132px] pl-2" data-mode={view}>
              {props.loading ? (
                <MenuSkeleton />
              ) : props.visibleRows.length === 0 ? (
                <Empty className="min-h-[320px] rounded-[1.6rem] border-0 bg-card/70">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <ShoppingBasket />
                    </EmptyMedia>
                    <EmptyTitle>No menu items found</EmptyTitle>
                    <EmptyDescription>Try another search or category.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <AnimatedCollectionView items={collectionItems} view={view} />
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <div className="mt-3 min-h-0 flex-1 overflow-hidden px-4 max-[370px]:px-3">
          <div className="no-scrollbar h-full min-w-0 overflow-y-auto pb-[132px]">
            {props.loading ? (
              <MenuSkeleton />
            ) : props.visibleRows.length === 0 ? (
              <Empty className="min-h-[320px] rounded-[1.6rem] border-0 bg-card/70">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingBasket />
                  </EmptyMedia>
                  <EmptyTitle>No menu items found</EmptyTitle>
                  <EmptyDescription>Try another search or category.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <AnimatedCollectionView items={collectionItems} view={view} />
            )}
          </div>
        </div>
      )}
    </section>
  )
}

function CategoryPill({
  active,
  category,
  count,
  onClick,
}: {
  active: boolean
  category: MenuCategory
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-9 shrink-0 rounded-full border px-4 text-sm font-semibold transition max-[370px]:h-8 max-[370px]:px-3 max-[370px]:text-xs ${
        active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-card-foreground shadow-sm'
      }`}
    >
      {category.name}
      {count > 0 ? <span className="ml-2 text-[11px]">{count}</span> : null}
    </button>
  )
}

function CategoryTile({
  active,
  category,
  count,
  onClick,
}: {
  active: boolean
  category: MenuCategory
  count: number
  onClick: () => void
}) {
  const Icon = categoryIcon(category)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[58px] w-full items-center justify-center rounded-none text-center transition max-[370px]:min-h-[54px] ${
        active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted/60'
      }`}
      aria-label={category.name}
      title={category.name}
    >
      <Icon
        className="size-[21px] max-[370px]:size-5"
        style={{ color: active ? 'var(--primary)' : 'var(--foreground)' }}
      />
      {count > 0 ? (
        <Badge className="absolute right-0.5 top-1 min-w-4 justify-center rounded-full px-1 text-[9px] shadow-sm ring-2 ring-background">
          {count}
        </Badge>
      ) : null}
    </button>
  )
}

function categoryIcon(category: MenuCategory) {
  const key = category.iconKey?.toLowerCase()
  if (key === 'soup') return Soup
  if (key === 'coffee') return Coffee
  if (key === 'drink') return CupSoda
  if (key === 'cake') return CakeSlice
  if (key === 'snack') return IceCreamBowl
  if (key === 'leaf') return Leaf
  const value = category.name.toLowerCase()
  if (value.includes('meal') || value.includes('main')) return Soup
  if (value.includes('coffee')) return Coffee
  if (value.includes('drink') || value.includes('juice')) return CupSoda
  if (value.includes('dessert') || value.includes('cake')) return CakeSlice
  if (value.includes('snack')) return IceCreamBowl
  if (value.includes('salad') || value.includes('vegetarian')) return Leaf
  return Grid2X2
}
