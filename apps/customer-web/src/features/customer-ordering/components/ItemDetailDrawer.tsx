import { ArrowLeft, ChevronDown, ClipboardList, MessageSquareText, Star } from 'lucide-react'
import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  CREATE_PRODUCT_REVIEW,
  PRODUCT_REVIEWS,
  type CreateProductReviewData,
  type ProductReviewsData,
} from '../../../graphql/productReviews'
import type { CustomerThemeStyle, MenuItem } from '../customer-ordering.types'
import { resolveProductImageUrl } from '../customer-ordering.utils'
import { CartQuantityControl } from './CartQuantityControl'
import { FloatingCartBar } from './FloatingCartBar'

type ItemDetailDrawerProps = {
  cartQuantity: number
  cartTotalPrice: number
  cartTotalQuantity: number
  item: MenuItem | null
  onAdd: () => void
  onOpenCart: () => void
  onOpenChange: (open: boolean) => void
  onOpenOrders: () => void
  onRemove: () => void
  shopId: string
  themePreset: string
  themeVars: CustomerThemeStyle
}

export function ItemDetailDrawer({
  cartQuantity,
  cartTotalPrice,
  cartTotalQuantity,
  item,
  onAdd,
  onOpenCart,
  onOpenChange,
  onOpenOrders,
  onRemove,
  shopId,
  themePreset,
  themeVars,
}: ItemDetailDrawerProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [createReview, { loading: reviewSubmitting }] =
    useMutation<CreateProductReviewData>(CREATE_PRODUCT_REVIEW)
  const reviewsQuery = useQuery<ProductReviewsData>(PRODUCT_REVIEWS, {
    variables: { shopId, productId: item?.id ?? '' },
    skip: !item?.id || !shopId,
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => {
    if (!item) return
    setDetailsOpen(false)
    setReviewsOpen(false)
    setReviewText('')
    setReviewRating(5)
  }, [item])

  if (!item) return null

  const description = itemDescription(item)

  async function submitReview() {
    const productId = item?.id
    if (!productId) return
    const comment = reviewText.trim()
    if (!comment) {
      toast.error('Please write a short review first.')
      return
    }
    try {
      await createReview({
        variables: {
          input: {
            shopId,
            productId,
            rating: reviewRating,
            comment,
          },
        },
      })
      setReviewText('')
      setReviewRating(5)
      setReviewsOpen(true)
      await reviewsQuery.refetch()
      toast.success('Thanks for sharing your review.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Review failed'
      toast.error(message)
    }
  }

  async function submitReview() {
    const productId = item?.id
    if (!productId) return
    const comment = reviewText.trim()
    if (!comment) {
      toast.error('Please write a short review first.')
      return
    }
    try {
      await createReview({
        variables: {
          input: {
            shopId,
            productId,
            rating: reviewRating,
            comment,
          },
        },
      })
      setReviewText('')
      setReviewRating(5)
      setReviewsOpen(true)
      await reviewsQuery.refetch()
      toast.success('Thanks for sharing your review.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Review failed'
      toast.error(message)
    }
  }

  return (
    <section
      className="fixed inset-y-0 left-1/2 z-50 flex w-[min(480px,100vw)] -translate-x-1/2 flex-col overflow-hidden bg-background text-foreground"
      data-theme={themePreset}
      style={themeVars}
      aria-label={`${item.name} details`}
    >
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-[calc(104px+env(safe-area-inset-bottom))]">
        <div className="relative">
          <button
            type="button"
            className="absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] z-10 grid size-8 place-items-center rounded-full bg-card/95 text-primary ring-1 ring-border transition active:scale-95"
            onClick={() => onOpenChange(false)}
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-4" strokeWidth={2.2} />
          </button>
          <img
            className="h-[42svh] max-h-[330px] min-h-[245px] w-full object-cover max-[370px]:h-[38svh] max-[370px]:min-h-[215px]"
            src={resolveProductImageUrl(item.imageUrl)}
            alt=""
          />
        </div>

        <section className="px-5 pb-1 pt-4 max-[370px]:px-4">
          <h1 className="text-[21px] font-bold leading-tight text-foreground max-[370px]:text-[19px]">
            {item.name}
          </h1>
          <p className="mt-1.5 max-w-[330px] text-[12px] font-normal leading-5 text-muted-foreground max-[370px]:text-[11px] max-[370px]:leading-4">
            {description}
          </p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <strong className="leading-none text-primary">
              <span className="text-[22px] font-semibold max-[370px]:text-[19px]">
                {formatDetailPrice(item.unitPrice)}
              </span>
              <span className="ml-1 text-[13px] font-normal max-[370px]:text-[11px]">
                ETB
              </span>
            </strong>
            <CartQuantityControl
              addLabel={`Add ${item.name}`}
              incrementLabel={`Add ${item.name}`}
              onAdd={onAdd}
              onRemove={onRemove}
              quantity={cartQuantity}
              removeLabel={`Remove ${item.name}`}
              size="detail"
            />
          </div>
        </section>

        <InfoCard
          body={`${description} Prepared for your table and served warm.`}
          icon={ClipboardList}
          open={detailsOpen}
          onToggle={() => setDetailsOpen((value) => !value)}
          tone="strong"
          title="Item details"
        />
        <ReviewCard
          icon={MessageSquareText}
          open={reviewsOpen}
          onToggle={() => setReviewsOpen((value) => !value)}
          rating={reviewRating}
          reviews={reviewsQuery.data?.productReviews ?? []}
          submitting={reviewSubmitting}
          text={reviewText}
          title="Notes / Reviews"
          onRatingChange={setReviewRating}
          onSubmit={submitReview}
          onTextChange={setReviewText}
        />
      </div>

      <FloatingCartBar
        actionLabel="Orders"
        count={cartTotalQuantity}
        disabled={false}
        onAction={onOpenOrders}
        onCart={onOpenCart}
        totalPrice={cartTotalPrice}
      />
    </section>
  )
}

function ReviewCard({
  icon: Icon,
  onRatingChange,
  onSubmit,
  onTextChange,
  onToggle,
  open,
  rating,
  reviews,
  submitting,
  text,
  title,
}: {
  icon: typeof MessageSquareText
  onRatingChange: (rating: number) => void
  onSubmit: () => void
  onTextChange: (text: string) => void
  onToggle: () => void
  open: boolean
  rating: number
  reviews: ProductReviewsData['productReviews']
  submitting: boolean
  text: string
  title: string
}) {
  return (
    <section className="mx-5 mt-2.5 rounded-xl bg-card text-card-foreground shadow-[0_6px_16px_rgba(20,20,20,0.035)] max-[370px]:mx-4">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[30px_minmax(0,1fr)_18px] items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h2 className="truncate text-[14px] font-semibold leading-tight">{title}</h2>
        <ChevronDown className={`size-3.5 text-primary transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.3} />
      </button>
      {open ? (
        <div className="space-y-3 px-3.5 pb-3 pl-[54px]">
          <div className="flex items-center gap-1" aria-label="Review rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`text-[16px] leading-none ${value <= rating ? 'text-primary' : 'text-muted-foreground/35'}`}
                onClick={() => onRatingChange(value)}
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
              >
                <Star
                  className="size-4"
                  fill={value <= rating ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
            ))}
          </div>
          <textarea
            className="min-h-[72px] w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-[12px] leading-5 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary"
            maxLength={500}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Share what you liked or what we should improve."
          />
          <button
            type="button"
            disabled={submitting || !text.trim()}
            onClick={onSubmit}
            className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-[12px] font-semibold text-primary-foreground transition active:scale-95 disabled:opacity-55"
          >
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
          <div className="space-y-2 border-t border-border/70 pt-3">
            {reviews.length === 0 ? (
              <p className="text-[12px] font-normal leading-5 text-muted-foreground">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="rounded-lg bg-background px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-foreground">
                      {review.author?.trim() || 'Guest'}
                    </span>
                    <span className="text-[11px] text-primary">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                    {review.comment}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function InfoCard({
  body,
  icon: Icon,
  onToggle,
  open,
  title,
  tone = 'soft',
}: {
  body: string
  icon: typeof ClipboardList
  onToggle: () => void
  open: boolean
  title: string
  tone?: 'soft' | 'strong'
}) {
  return (
    <section className="mx-5 mt-2.5 rounded-xl bg-card text-card-foreground shadow-[0_6px_16px_rgba(20,20,20,0.035)] max-[370px]:mx-4">
      <button
        type="button"
        onClick={onToggle}
        className="grid w-full grid-cols-[30px_minmax(0,1fr)_18px] items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <span className={`grid size-7 place-items-center rounded-full ${tone === 'strong' ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <h2 className="truncate text-[14px] font-semibold leading-tight">{title}</h2>
        <ChevronDown className={`size-3.5 text-primary transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.3} />
      </button>
      {open ? (
        <p className="px-3.5 pb-3 pl-[54px] text-[12px] font-normal leading-5 text-muted-foreground">
          {body}
        </p>
      ) : null}
    </section>
  )
}

function formatDetailPrice(cents: number): string {
  const amount = cents / 100
  return Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)
}

function itemDescription(item: MenuItem): string {
  const category = item.categoryMeta?.name?.trim()
  if (category && category !== 'All') {
    return `Traditional ${category.toLowerCase()} favorite prepared with warm seasoning.`
  }
  return 'Traditional Ethiopian favorite prepared with warm seasoning.'
}
