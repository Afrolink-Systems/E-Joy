import { Skeleton } from '../../../components/ui/skeleton'

export function MenuSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid min-h-[102px] grid-cols-[92px_minmax(0,1fr)_42px] items-center gap-3 border-b border-border/70 pb-3 max-[370px]:grid-cols-[80px_minmax(0,1fr)_38px]"
        >
          <Skeleton className="aspect-square w-full rounded-[14px]" />
          <div className="min-w-0">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="mt-3 h-5 w-20" />
          </div>
          <Skeleton className="size-9 rounded-full max-[370px]:size-8" />
        </div>
      ))}
    </div>
  )
}
