import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner'
import { useApolloClient } from '@apollo/client/react'
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
import { CUSTOMER_SHOP, type CustomerShopRow } from '../../../graphql/customerShop'

type HomeScreenProps = {
  hasTableSession: boolean
  onContinue: () => void
  onStartNewSession: (session: QrSession) => void
  shopName: string
  tableRef: string
}

const HOME_BACKGROUND = '/images/ejoy-addis-home-bg.png'
const MAX_SCAN_DISTANCE_METERS = 30

function getHomeShopName(shopName: string) {
  return shopName.trim() === 'E-Joy Addis Ababa' ? 'E-Joy Addis' : shopName
}

export function HomeScreen({
  hasTableSession,
  onContinue,
  onStartNewSession,
  shopName,
  tableRef,
}: HomeScreenProps) {
  const apollo = useApolloClient()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [checkingLocation, setCheckingLocation] = useState(false)

  const handleScan = (codes: IDetectedBarcode[]) => {
    if (checkingLocation) return
    const rawValue = codes[0]?.rawValue
    if (!rawValue) return

    const session = 
          (rawValue)
    if (!session) {
      setScanError('That QR code does not look like an E-Joy table code.')
      return
    }

    void confirmNearbyAndStart(session)
  }

  async function confirmNearbyAndStart(session: QrSession) {
    setCheckingLocation(true)
    setScanError('Checking your location...')
    try {
      const shopResult = await apollo.query<{ customerShop: CustomerShopRow | null }>({
        query: CUSTOMER_SHOP,
        variables: { shopId: session.shopId },
        fetchPolicy: 'network-only',
      })
      const shop = shopResult.data?.customerShop
      if (
        typeof shop?.latitude !== 'number' ||
        typeof shop.longitude !== 'number'
      ) {
        setScanError('This restaurant has not configured its location yet.')
        return
      }
      const position = await getCurrentPosition()
      const distanceMeters = distanceBetweenMeters(
        position.coords.latitude,
        position.coords.longitude,
        shop.latitude,
        shop.longitude,
      )
      if (distanceMeters > MAX_SCAN_DISTANCE_METERS) {
        setScanError(
          `You are ${Math.round(distanceMeters)}m away. Please scan within ${MAX_SCAN_DISTANCE_METERS}m of the restaurant.`,
        )
        return
      }
      onStartNewSession(session)
      setScannerOpen(false)
      setScanError(null)
      toast.success(`Table ${session.table} selected.`)
      onContinue()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Location check failed.'
      setScanError(message)
    } finally {
      setCheckingLocation(false)
    }
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
          checkingLocation={checkingLocation}
          onClose={() => setScannerOpen(false)}
          onError={(message) => setScanError(message)}
          onScan={handleScan}
        />
      ) : null}
    </section>
  )
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location permission is required before scanning.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, () => {
      reject(new Error('Please allow location access to scan this table QR.'))
    }, {
      enableHighAccuracy: true,
      maximumAge: 15000,
      timeout: 10000,
    })
  })
}

function distanceBetweenMeters(
  latA: number,
  lonA: number,
  latB: number,
  lonB: number,
): number {
  const earthRadiusMeters = 6371000
  const dLat = toRadians(latB - latA)
  const dLon = toRadians(lonB - lonA)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(latA)) *
      Math.cos(toRadians(latB)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function QrScannerPanel({
  checkingLocation,
  error,
  onClose,
  onError,
  onScan,
}: {
  checkingLocation: boolean
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
          {checkingLocation ? (
            <div className="absolute inset-0 grid place-items-center bg-[#120c08]/72 text-sm font-black text-[#fffdfa]">
              Checking location...
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-10 rounded-[1.5rem] border-2 border-[#fffdfa]/82 shadow-[0_0_0_999px_rgba(0,0,0,0.22)]" />
          <Camera className="pointer-events-none absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-[#fffdfa]/80" />
        </div>
        {error ? <p className="px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
      </section>
    </div>
  )
}
