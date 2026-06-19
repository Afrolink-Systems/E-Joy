import type { OrderDetailData } from '../../../graphql/getOrder'
import {
  formatOrderBirr,
  resolveOrderProductImageUrl,
} from '../order-detail.utils'

type OrderItemListProps = {
  items: NonNullable<OrderDetailData['getOrder']>['items']
  orderId: string
}

export function OrderItemList({ items, orderId }: OrderItemListProps) {
  return (
    <div className="flex flex-col gap-0">
      {items.map((item, index) => (
        <article
          key={`${orderId}-${index}`}
          className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-3 last:border-b-0 max-[370px]:grid-cols-[48px_minmax(0,1fr)_auto]"
        >
          <img
            src={resolveOrderProductImageUrl(item.product.imageUrl)}
            alt=""
            className="size-[52px] rounded-xl bg-muted object-cover max-[370px]:size-[48px]"
          />
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-card-foreground">{item.product.name}</h3>
            <p className="mt-1.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              x{item.quantity}
            </p>
          </div>
          <strong className="whitespace-nowrap text-right text-[14px] font-semibold text-card-foreground">
            {formatOrderBirr(item.priceAtTime * item.quantity)}
          </strong>
        </article>
      ))}
    </div>
  )
}
