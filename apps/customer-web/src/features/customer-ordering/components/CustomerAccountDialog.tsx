import { Fingerprint, LogOut, ReceiptText, ShieldCheck, UserRound } from 'lucide-react'
import { useState } from 'react'
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
  const [devCode, setDevCode] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function requestOtp(purpose: 'signup' | 'login') {
    setBusy(true)
    try {
      const result = await account.requestOtp(phone, purpose)
      setDevCode(result?.devCode ?? null)
      toast.success('Verification code sent')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send code')
    } finally {
      setBusy(false)
    }
  }

  async function verifyAndRegister() {
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

  async function loginWithOtp() {
    setBusy(true)
    try {
      await account.verifyOtp(phone, code, 'login')
      await account.claimOrders(rememberedOrderIds)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign in')
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
            {devCode ? (
              <p className="rounded-md bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                Dev code: {devCode}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="h-11" disabled={busy || !phone} onClick={() => void requestOtp('signup')}>
                Get code
              </Button>
              <Button type="button" className="h-11" disabled={busy || !phone || !code} onClick={() => void verifyAndRegister()}>
                <Fingerprint className="size-4" />
                Save
              </Button>
            </div>
            <Button type="button" variant="secondary" className="h-11 w-full" disabled={busy || !phone} onClick={() => void loginWithPasskey()}>
              <Fingerprint className="size-4" />
              Sign in with passkey
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="ghost" className="h-10" disabled={busy || !phone} onClick={() => void requestOtp('login')}>
                Login code
              </Button>
              <Button type="button" variant="ghost" className="h-10" disabled={busy || !phone || !code} onClick={() => void loginWithOtp()}>
                <ReceiptText className="size-4" />
                OTP login
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

