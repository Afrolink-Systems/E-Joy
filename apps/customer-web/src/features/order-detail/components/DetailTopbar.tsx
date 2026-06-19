import { ArrowLeft } from 'lucide-react'

type DetailTopbarProps = {
  onBack: () => void
  title: string
}

export function DetailTopbar({ onBack, title }: DetailTopbarProps) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[40px_1fr_40px] items-center gap-2 bg-background/95 px-4 py-3 pt-[calc(10px+env(safe-area-inset-top))] text-foreground backdrop-blur max-[370px]:px-3">
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full text-foreground transition active:scale-95"
        onClick={onBack}
        aria-label="Back"
      >
        <ArrowLeft className="size-5" />
      </button>
      <h1 className="truncate text-center text-[20px] font-extrabold max-[370px]:text-[19px]">{title}</h1>
      <span />
    </header>
  )
}
