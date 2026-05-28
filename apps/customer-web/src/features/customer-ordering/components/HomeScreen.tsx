import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import {
  Camera,
  ChevronRight,
  Coffee,
  QrCode,
  ScanLine,
  ShieldCheck,
  Soup,
  Utensils,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { useTableSessionStore } from '../../../store/useTableSessionStore'

type HomeScreenProps = {
  onStart: () => void
  shopName: string
}

type QrSession = {
  shopId: string
  table: string
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=900&q=86'
const COFFEE_IMAGE =
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=360&q=82'
const PASTA_IMAGE =
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=360&q=82'

export function HomeScreen({ onStart, shopName }: HomeScreenProps) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const setFromQrParams = useTableSessionStore((state) => state.setFromQrParams)

  const handleScan = (codes: IDetectedBarcode[]) => {
    const rawValue = codes[0]?.rawValue
    if (!rawValue) return

    const session = parseQrSession(rawValue)
    if (!session) {
      setScanError('That QR code does not look like an E-Joy table code.')
      return
    }

    setFromQrParams(session.shopId, session.table)
    setScannerOpen(false)
    setScanError(null)
    toast.success(`Table ${session.table} selected.`)
    onStart()
  }

  return (
    <section className="relative h-svh min-h-svh overflow-hidden bg-[#f6efe3] text-[#24180f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(245,184,88,0.18),transparent_34%),radial-gradient(circle_at_92%_24%,rgba(30,106,57,0.13),transparent_32%),linear-gradient(180deg,#fff7eb_0%,#f6efe3_56%,#f3eadb_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[360px] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="absolute -right-28 top-16 h-[250px] w-[330px] rounded-full object-cover opacity-95 shadow-[0_26px_70px_rgba(61,35,15,0.24)] min-[431px]:-right-24 min-[431px]:h-[280px] min-[431px]:w-[370px] max-[370px]:-right-36 max-[370px]:top-[72px]"
        />
        <div className="absolute right-4 top-7 grid size-14 place-items-center rounded-full bg-[#2d1a0c] text-[#f8ecda] shadow-[0_16px_32px_rgba(42,25,12,0.2)]">
          <Coffee className="size-7" />
        </div>
        <div className="absolute -left-20 top-28 h-48 w-48 rounded-full border border-[#b98a35]/20" />
        <div className="absolute right-0 top-0 h-full w-[52%] bg-[linear-gradient(110deg,rgba(246,239,227,0)_0%,rgba(246,239,227,0.86)_78%)]" />
      </div>

      <div className="no-scrollbar relative z-10 h-full overflow-y-auto px-5 pb-[calc(104px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+24px)] max-[370px]:px-4 max-[370px]:pt-[calc(env(safe-area-inset-top)+18px)]">
        <div className="flex items-center gap-1">
          <span className="h-5 w-1.5 rotate-[-18deg] rounded-full bg-green-700" />
          <span className="h-6 w-1.5 rounded-full bg-[#d29b2e]" />
          <span className="h-5 w-1.5 rotate-[18deg] rounded-full bg-red-500" />
        </div>

        <div className="mt-8 max-w-[265px] max-[370px]:mt-6">
          <h1 className="text-[40px] font-black leading-[0.96] tracking-[-0.02em] text-[#3a2517] max-[370px]:text-[35px]">
            {shopName}
          </h1>
          <div className="mt-5 h-1 w-16 rounded-full bg-[#bd8425]" />
          <p className="mt-5 text-[17px] font-semibold leading-7 text-[#4e3a2b] max-[370px]:text-[15px] max-[370px]:leading-6">
            Browse Ethiopian favorites, European comfort plates, coffee and cake. Pay with Telebirr, we bring it to your table.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 max-[370px]:mt-6">
          <CuisineCard image={COFFEE_IMAGE} icon={Coffee} label="Buna bar" />
          <CuisineCard image={PASTA_IMAGE} icon={Utensils} label="Pasta & grill" />
        </div>

        <section className="mt-5 rounded-[1.7rem] border border-[#eadbc7] bg-[#fffdfa]/92 p-5 text-center shadow-[0_22px_55px_rgba(58,37,23,0.13)] max-[370px]:rounded-[1.45rem] max-[370px]:p-4">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#eef0df] text-green-800 max-[370px]:size-16">
            <QrCode className="size-10 max-[370px]:size-8" />
          </div>
          <h2 className="mt-5 text-[25px] font-black leading-tight max-[370px]:mt-4 max-[370px]:text-[22px]">Scan QR Code</h2>
          <p className="mx-auto mt-2 max-w-[260px] text-[15px] font-medium leading-6 text-[#6f6258] max-[370px]:text-[14px]">
            Scan the QR code on your table to switch table or start a fresh order.
          </p>
          <Button
            type="button"
            className="mt-5 h-[52px] w-full rounded-full bg-green-800 text-[16px] font-black text-[#fbf6ed] shadow-[0_14px_26px_rgba(22,101,52,0.24)] hover:bg-green-900"
            onClick={() => {
              setScanError(null)
              setScannerOpen(true)
            }}
          >
            <ScanLine className="size-5" data-icon="inline-start" />
            Scan QR Code
          </Button>
        </section>

        <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-[#bc862b]">
          <span className="h-px bg-[#dfcfb9]" />
          OR
          <span className="h-px bg-[#dfcfb9]" />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="flex w-full items-center gap-4 rounded-[1.35rem] border border-[#eadbc7] bg-[#f5ead7]/88 p-4 text-left shadow-[0_14px_32px_rgba(58,37,23,0.08)] transition active:scale-[0.985]"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#efd9af] text-[#a06f1e] max-[370px]:size-12">
            <Soup className="size-7 max-[370px]:size-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-black text-[#24180f] max-[370px]:text-[15px]">Browse menu first</span>
            <span className="mt-1 block truncate text-sm font-medium text-[#6f6258]">Explore dishes and place your order.</span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-[#3a2517]" />
        </button>

        <div className="mt-7 flex items-center gap-4 px-3 pb-8">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-green-50 text-green-700">
            <ShieldCheck className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-black">Safe. Fast. Convenient.</p>
            <p className="mt-1 text-sm font-medium leading-5 text-[#6f6258]">Your order is secure and delivered to your table.</p>
          </div>
        </div>
      </div>

      {scannerOpen ? (
        <QrScannerPanel
          error={scanError}
          onClose={() => setScannerOpen(false)}
          onError={(message) => setScanError(message)}
          onScan={handleScan}
        />
      ) : null}
    </section>
  )
}

function CuisineCard({
  icon: Icon,
  image,
  label,
}: {
  icon: typeof Coffee
  image: string
  label: string
}) {
  return (
    <div className="relative h-24 overflow-hidden rounded-[1.25rem] bg-[#e8ddce] shadow-[0_12px_30px_rgba(58,37,23,0.09)] max-[370px]:h-20">
      <img src={image} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#24180f]/70 to-transparent" />
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 text-sm font-black text-[#fffaf0]">
        <span className="grid size-7 place-items-center rounded-full bg-[#fffaf0]/92 text-[#3a2517]">
          <Icon className="size-4" />
        </span>
        {label}
      </div>
    </div>
  )
}

function QrScannerPanel({
  error,
  onClose,
  onError,
  onScan,
}: {
  error: string | null
  onClose: () => void
  onError: (message: string) => void
  onScan: (codes: IDetectedBarcode[]) => void
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-[#1b120b]/55 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur-sm">
      <section className="w-full overflow-hidden rounded-[1.7rem] bg-[#fffdfa] shadow-[0_28px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-[18px] font-black text-[#24180f]">Scan table QR</h2>
            <p className="text-xs font-semibold text-[#7b6b5d]">Point your camera at the table code.</p>
          </div>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full bg-[#f3eadb] text-[#24180f]"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="relative aspect-square overflow-hidden bg-[#120c08]">
          <Scanner
            constraints={{ facingMode: 'environment' }}
            formats={['qr_code']}
            onError={(scannerError) => {
              const message = scannerError instanceof Error ? scannerError.message : 'Camera could not start.'
              onError(message)
            }}
            onScan={onScan}
            scanDelay={600}
            sound={false}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { width: '100%', height: '100%', objectFit: 'cover' },
            }}
          />
          <div className="pointer-events-none absolute inset-10 rounded-[1.5rem] border-2 border-[#fffdfa]/82 shadow-[0_0_0_999px_rgba(0,0,0,0.22)]" />
          <Camera className="pointer-events-none absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-[#fffdfa]/80" />
        </div>
        {error ? <p className="px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </section>
    </div>
  )
}

function parseQrSession(rawValue: string): QrSession | null {
  const trimmed = rawValue.trim()
  if (!trimmed) return null

  try {
    const parsed = JSON.parse(trimmed) as { shopId?: unknown; table?: unknown; tableNumber?: unknown }
    const shopId = typeof parsed.shopId === 'string' ? parsed.shopId.trim() : ''
    const table =
      typeof parsed.table === 'string'
        ? parsed.table.trim()
        : typeof parsed.tableNumber === 'string'
          ? parsed.tableNumber.trim()
          : ''
    if (shopId && table) return { shopId, table }
  } catch {
    /* QR is commonly a URL, not JSON. */
  }

  try {
    const url = new URL(trimmed, window.location.origin)
    const shopId = url.searchParams.get('shopId')?.trim() ?? ''
    const table = url.searchParams.get('table')?.trim() ?? ''
    if (shopId && table) return { shopId, table }
  } catch {
    /* invalid URL */
  }

  return null
}
