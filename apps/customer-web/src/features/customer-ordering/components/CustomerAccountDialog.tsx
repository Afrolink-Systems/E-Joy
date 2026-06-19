import { ChevronRight, Fingerprint, LogOut, Phone, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import type { CustomerThemeStyle } from '../customer-ordering.types'
import type { CustomerAccountState } from '../hooks/useCustomerAccount'
import { formatBirr } from '../customer-ordering.utils'

type CustomerAccountDialogProps = {
  account: CustomerAccountState
  rememberedOrderIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  themePreset: string
  themeVars: CustomerThemeStyle
}

export function CustomerAccountDialog({
  account,
  rememberedOrderIds,
  open,
  onOpenChange,
  themePreset,
  themeVars,
}: CustomerAccountDialogProps) {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState(0)

  useEffect(() => {
    if (otpCooldownSeconds <= 0) return undefined
    const intervalId = window.setInterval(() => {
      setOtpCooldownSeconds((seconds) => Math.max(0, seconds - 1))
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [otpCooldownSeconds])

  async function requestOtp(purpose: 'signup' | 'login') {
    setBusy(true)
    try {
      const result = await account.requestOtp(phone, purpose)
      setOtpCooldownSeconds(result?.retryAfterSeconds ?? 120)
      toast.success('Verification code sent')
    } catch (error) {
      setOtpCooldownSeconds(retryAfterFromError(error) ?? otpCooldownSeconds)
      toast.error(error instanceof Error ? error.message : 'Could not send code')
    } finally {
      setBusy(false)
    }
  }

  async function verifyAndRegisterPasskey() {
    setBusy(true)
    try {
      await account.verifyOtp(phone, code, 'signup')
      try {
        await account.registerPasskey(phone)
        toast.success('Signed in with passkey')
      } catch {
        toast.message('Signed in. Passkey could not be saved on this device.')
      }
      await account.claimOrders(rememberedOrderIds)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not verify code')
    } finally {
      setBusy(false)
    }
  }

  async function loginWithPasskey() {
    setBusy(true)
    try {
      await account.loginWithPasskey(phone)
      await account.claimOrders(rememberedOrderIds)
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Passkey login failed'
      toast.error(
        message.toLowerCase().includes('verify phone') || message.toLowerCase().includes('no passkey')
          ? 'Use phone code first, then sign in with passkey next time.'
          : message,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        data-theme={themePreset}
        style={themeVars}
        className="top-auto bottom-0 max-w-[min(430px,calc(100vw-1rem))] translate-y-0 gap-0 rounded-t-[24px] border border-border bg-background p-0 shadow-[0_-18px_50px_rgba(17,24,39,0.18)] data-open:slide-in-from-bottom-4 data-closed:slide-out-to-bottom-4"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border" />
        <button
          type="button"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground transition active:scale-95"
          aria-label="Close account"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-4" />
        </button>
        <div className="px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-5">
          <div className="flex items-center gap-3 pr-9">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[20px] font-semibold leading-tight">Account</h2>
              <p className="mt-0.5 text-[12px] leading-4 text-muted-foreground">
                Save receipts, history, and spending across restaurants.
              </p>
            </div>
          </div>

          {account.me ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[15px] font-semibold">{account.me.phone}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  {account.me.passkeyCount > 0 ? 'Passkey enabled' : 'Phone verified'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-border bg-card p-3.5">
                  <p className="text-[11px] font-medium text-muted-foreground">Orders</p>
                  <p className="mt-1 text-[20px] font-semibold">{account.expense?.orderCount ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3.5">
                  <p className="text-[11px] font-medium text-muted-foreground">Spent</p>
                  <p className="mt-1 text-[18px] font-semibold">{formatBirr(account.expense?.totalAmount ?? 0)}</p>
                </div>
              </div>

              {account.expense?.byRestaurant.length ? (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="space-y-2.5">
                    {account.expense.byRestaurant.slice(0, 4).map((row) => (
                      <div key={row.shopId} className="flex items-center justify-between gap-3 text-[13px]">
                        <span className="min-w-0 truncate font-medium">{row.shopName}</span>
                        <span className="shrink-0 text-muted-foreground">{formatBirr(row.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <Button type="button" variant="outline" className="h-11 w-full rounded-full bg-card" onClick={() => void account.logout()}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <label className="grid h-14 grid-cols-[36px_1fr] items-center gap-2 px-3.5">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                    <Phone className="size-4" />
                  </span>
                  <Input
                    className="h-12 border-0 bg-transparent px-0 text-[14px] shadow-none focus-visible:ring-0"
                    inputMode="tel"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>
                <div className="ml-[62px] h-px bg-border" />
                <label className="grid h-14 grid-cols-[36px_1fr] items-center gap-2 px-3.5">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </span>
                  <Input
                    className="h-12 border-0 bg-transparent px-0 text-[14px] shadow-none focus-visible:ring-0"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
                  <Button type="button" variant="outline" className="h-10 rounded-xl bg-background text-[13px]" disabled={busy || !phone || otpCooldownSeconds > 0} onClick={() => void requestOtp('signup')}>
                    {otpCooldownSeconds > 0 ? `Retry in ${formatCooldown(otpCooldownSeconds)}` : 'Get code'}
                  </Button>
                  <Button type="button" className="h-10 rounded-xl text-[13px]" disabled={busy || !phone || !code} onClick={() => void verifyAndRegisterPasskey()}>
                    <ShieldCheck className="size-4" />
                    Sign in
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 py-1 text-[11px] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-12 w-full justify-between rounded-2xl bg-card px-4 text-[14px] font-medium"
                disabled={busy || !phone}
                onClick={() => void loginWithPasskey()}
              >
                <span className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary">
                    <Fingerprint className="size-4" />
                  </span>
                  Sign in with passkey
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function retryAfterFromError(error: unknown): number | null {
  const message = error instanceof Error ? error.message : ''
  const match = message.match(/wait\s+(\d+)\s+seconds/i)
  return match ? Number(match[1]) : null
}
