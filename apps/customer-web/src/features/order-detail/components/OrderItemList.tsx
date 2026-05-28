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
          className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 border-b border-black/6 py-4 last:border-b-0 max-[370px]:grid-cols-[64px_minmax(0,1fr)_auto] max-[370px]:gap-3"
        >
          <img
            src={resolveOrderProductImageUrl(item.product.imageUrl)}
            alt=""
            className="size-[76px] rounded-[1rem] bg-neutral-100 object-cover shadow-[0_8px_20px_rgba(20,20,20,0.07)] max-[370px]:size-16"
          />
          <div className="min-w-0">
            <h3 className="truncate text-[18px] font-black text-[#151515] max-[370px]:text-[16px]">{item.product.name}</h3>
            <p className="mt-2 inline-flex rounded-full bg-neutral-50 px-3 py-1 text-[14px] font-bold text-[#151515] max-[370px]:text-[12px]">
              x{item.quantity}
            </p>
          </div>
          <strong className="whitespace-nowrap text-right text-[17px] font-black text-[#151515] max-[370px]:text-[14px]">
            {formatOrderBirr(item.priceAtTime * item.quantity)}
          </strong>
        </article>
      ))}
    </div>
  )
}
