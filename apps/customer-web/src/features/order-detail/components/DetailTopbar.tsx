import { ArrowLeft } from 'lucide-react'

type DetailTopbarProps = {
  onBack: () => void
  title: string
}

export function DetailTopbar({ onBack, title }: DetailTopbarProps) {
  return (
    <header className="sticky top-0 z-10 grid grid-cols-[44px_1fr_44px] items-center gap-2 bg-[#f7f7f5]/95 px-4 py-4 pt-[calc(14px+env(safe-area-inset-top))] backdrop-blur max-[370px]:px-3">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full text-[#151515] transition active:scale-95"
        onClick={onBack}
        aria-label="Back"
      >
        <ArrowLeft className="size-6" />
      </button>
      <h1 className="truncate text-center text-[23px] font-black text-[#151515] max-[370px]:text-[21px]">{title}</h1>
      <span />
    </header>
  )
}
