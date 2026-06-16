import { Fingerprint, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import type { CustomerAccountState } from '../hooks/useCustomerAccount'
import { formatBirr } from '../customer-ordering.utils'

type CustomerAccountDialogProps = {
  account: CustomerAccountState
  rememberedOrderIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerAccountDialog({
  account,
  rememberedOrderIds,
  open,
  onOpenChange,
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

  async function verifyAndRegister() {
    setBusy(true)
    try {
      await account.verifyOtp(phone, code, 'signup')
      await account.claimOrders(rememberedOrderIds)
      onOpenChange(false)
      toast.success('Signed in')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not verify code')
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
        toast.success('Passkey saved')
      } catch {
        toast.message('Signed in with phone. You can add a passkey later.')
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
      toast.error(error instanceof Error ? error.message : 'Passkey login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-4 rounded-[1.35rem] p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <UserRound className="size-5 text-primary" />
            Account
          </DialogTitle>
          <DialogDescription>
            Save receipts, history, and spending across restaurants.
          </DialogDescription>
        </DialogHeader>

        {account.me ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-3">
              <p className="text-sm font-black">{account.me.phone}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                {account.me.passkeyCount > 0 ? 'Passkey enabled' : 'Phone verified'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold text-muted-foreground">Orders</p>
                <p className="mt-1 text-xl font-black">{account.expense?.orderCount ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold text-muted-foreground">Spent</p>
                <p className="mt-1 text-xl font-black">{formatBirr(account.expense?.totalAmount ?? 0)}</p>
              </div>
            </div>

            {account.expense?.byRestaurant.length ? (
              <div className="space-y-2">
                {account.expense.byRestaurant.slice(0, 4).map((row) => (
                  <div key={row.shopId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-bold">{row.shopName}</span>
                    <span className="shrink-0 text-muted-foreground">{formatBirr(row.totalAmount)}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <Button type="button" variant="outline" className="h-11 w-full" onClick={() => void account.logout()}>
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              className="h-11 rounded-lg text-base"
              inputMode="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <Input
              className="h-11 rounded-lg text-base"
              inputMode="numeric"
              placeholder="6-digit code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="h-11" disabled={busy || !phone || otpCooldownSeconds > 0} onClick={() => void requestOtp('signup')}>
                {otpCooldownSeconds > 0 ? `Retry in ${formatCooldown(otpCooldownSeconds)}` : 'Get code'}
              </Button>
              <Button type="button" className="h-11" disabled={busy || !phone || !code} onClick={() => void verifyAndRegister()}>
                <ShieldCheck className="size-4" />
                Sign in
              </Button>
            </div>
            <Button type="button" variant="outline" className="h-11 w-full" disabled={busy || !phone || !code} onClick={() => void verifyAndRegisterPasskey()}>
              <Fingerprint className="size-4" />
              Sign in and add passkey
            </Button>
            <Button type="button" variant="secondary" className="h-11 w-full" disabled={busy || !phone} onClick={() => void loginWithPasskey()}>
              <Fingerprint className="size-4" />
              Sign in with passkey
            </Button>
          </div>
        )}
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
