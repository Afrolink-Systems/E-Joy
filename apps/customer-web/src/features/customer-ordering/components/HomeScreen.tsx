import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import {
  Camera,
  ChevronRight,
  QrCode,
  ScanLine,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { useTableSessionStore } from '../../../store/useTableSessionStore'

type HomeScreenProps = {
  hasTableSession: boolean
  onContinue: () => void
  shopName: string
  tableRef: string
}

type QrSession = {
  shopId: string
  table: string
}

const HOME_BACKGROUND = '/images/ejoy-addis-home-bg.png'

function getHomeShopName(shopName: string) {
  return shopName.trim() === 'E-Joy Addis Ababa' ? 'E-Joy Addis' : shopName
}

export function HomeScreen({
  hasTableSession,
  onContinue,
  shopName,
  tableRef,
}: HomeScreenProps) {
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
    onContinue()
  }

  return (
    <section className="relative h-dvh overflow-hidden bg-[#f4ead7] text-[#27190e]">
      <img
        src={HOME_BACKGROUND}
        alt=""
        className="absolute inset-0 size-full object-cover object-[38%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,249,239,0.58)_0%,rgba(255,249,239,0.2)_58%,rgba(255,249,239,0)_100%),linear-gradient(180deg,rgba(255,249,239,0.08)_0%,rgba(255,249,239,0)_40%,rgba(244,234,215,0.72)_70%,rgba(244,234,215,0.98)_100%)]" />

      <div className="relative z-10 flex h-full flex-col px-5 pb-[calc(104px+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+36px)] max-[370px]:px-4 max-[370px]:pb-[calc(92px+env(safe-area-inset-bottom))] max-[370px]:pt-[calc(env(safe-area-inset-top)+26px)]">
        <div className="mt-7 max-w-61.25 max-[370px]:mt-5 max-[370px]:max-w-54.5">
          <h1 className="text-[38px] font-black leading-[0.92] text-[#3a2517] drop-shadow-[0_1px_0_rgba(255,248,236,0.55)] max-[370px]:text-[32px]">
            {getHomeShopName(shopName)}
          </h1>
          <div className="mt-4 h-1 w-14 rounded-full bg-[#bd8425]" />
          <p className="mt-4 max-w-53.75 text-[15px] font-semibold leading-[1.55] text-[#4e3a2b] max-[370px]:max-w-49.5 max-[370px]:text-[13px] max-[370px]:leading-5">
            Order favorites, pay with Telebirr, and relax. We'll bring everything to your table.
          </p>
        </div>

        <div className="mt-auto">
          <section className="rounded-[1.5rem] border border-white/65 bg-[#fff8ed]/62 p-4 text-center shadow-[0_22px_54px_rgba(58,37,23,0.14),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl max-[370px]:rounded-[1.35rem] max-[370px]:p-3.5">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#eef2df]/82 text-green-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_10px_24px_rgba(58,37,23,0.08)] backdrop-blur max-[370px]:size-14">
              <QrCode className="size-8 max-[370px]:size-7" strokeWidth={2.4} />
            </div>
            <h2 className="mt-3 text-[23px] font-black leading-tight max-[370px]:text-[20px]">Scan QR Code</h2>
            <p className="mx-auto mt-1.5 max-w-[260px] text-[14px] font-medium leading-5 text-[#6f6258] max-[370px]:text-[12px] max-[370px]:leading-[1.35rem]">
              {hasTableSession
                ? 'Scan again to switch table.'
                : 'Scan the QR code on your table to view the menu and order.'}
            </p>
            <Button
              type="button"
              className="mt-4 h-12 w-full rounded-full bg-green-800 text-[15px] font-black text-[#fbf6ed] shadow-[0_14px_26px_rgba(22,101,52,0.24)] hover:bg-green-900 max-[370px]:mt-3 max-[370px]:h-11"
              onClick={() => {
                setScanError(null)
                setScannerOpen(true)
              }}
            >
              <ScanLine className="size-5" data-icon="inline-start" />
              Scan QR Code
            </Button>
          </section>

          {hasTableSession ? (
            <div className="mt-3">
              <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-[10px] font-black uppercase tracking-[0.18em] text-[#bc862b]">
                <span className="h-px bg-[#dfcfb9]" />
                OR
                <span className="h-px bg-[#dfcfb9]" />
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="flex w-full items-center gap-3 rounded-[1.2rem] border border-[#eadbc7] bg-[#f5ead7]/94 p-3 text-left shadow-[0_14px_32px_rgba(58,37,23,0.1)] transition active:scale-[0.985]"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#efd9af] text-[#a06f1e]">
                  <QrCode className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-black text-[#24180f]">Continue ordering</span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-[#6f6258]">
                    Table {tableRef || 'selected'} is ready.
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-[#3a2517]" />
              </button>
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-3 px-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green-50/90 text-green-700">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black">Safe. Fast. Convenient.</p>
              <p className="text-xs font-medium leading-4 text-[#6f6258]">
                {hasTableSession
                  ? 'Your table session is ready.'
                  : 'Your order starts after we know your table.'}
              </p>
            </div>
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
