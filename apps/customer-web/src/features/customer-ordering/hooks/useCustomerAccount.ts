import { useMutation, useQuery } from '@apollo/client/react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { useEffect, useState } from 'react'
import {
  BEGIN_CUSTOMER_PASSKEY_LOGIN,
  BEGIN_CUSTOMER_PASSKEY_REGISTRATION,
  CLAIM_CUSTOMER_ORDERS,
  CUSTOMER_EXPENSE_SUMMARY,
  CUSTOMER_LOGOUT,
  CUSTOMER_ME,
  FINISH_CUSTOMER_PASSKEY_LOGIN,
  FINISH_CUSTOMER_PASSKEY_REGISTRATION,
  REFRESH_CUSTOMER_SESSION,
  REQUEST_CUSTOMER_OTP,
  VERIFY_CUSTOMER_OTP,
  type CustomerAuthPayload,
  type CustomerExpenseSummary,
  type CustomerMe,
} from '../../../graphql/customerAuth'
import {
  CUSTOMER_AUTH_EVENT,
  clearCustomerAccessToken,
  getCustomerAccessToken,
  setCustomerAccessToken,
} from '../../../lib/customerAuth'
import { apolloClient } from '../../../lib/apollo'

type AuthPayloadResult<TName extends string> = Record<TName, CustomerAuthPayload>

export function useCustomerAccount() {
  const [token, setToken] = useState(() => getCustomerAccessToken())
  const meQuery = useQuery<{ customerMe: CustomerMe | null }>(CUSTOMER_ME, {
    skip: !token,
    fetchPolicy: 'cache-and-network',
  })
  const expenseQuery = useQuery<{
    customerExpenseSummary: CustomerExpenseSummary
  }>(CUSTOMER_EXPENSE_SUMMARY, {
    skip: !token,
    fetchPolicy: 'cache-and-network',
  })
  const [requestOtpMutation] = useMutation<{
    requestCustomerOtp: {
      ok: boolean
      expiresAt: string
      retryAfterSeconds?: number
      devCode?: string | null
    }
  }>(REQUEST_CUSTOMER_OTP)
  const [verifyOtpMutation] =
    useMutation<AuthPayloadResult<'verifyCustomerOtp'>>(VERIFY_CUSTOMER_OTP)
  const [refreshSessionMutation] =
    useMutation<AuthPayloadResult<'refreshSession'>>(REFRESH_CUSTOMER_SESSION)
  const [beginRegistrationMutation] = useMutation<{
    beginCustomerPasskeyRegistration: { optionsJson: string }
  }>(BEGIN_CUSTOMER_PASSKEY_REGISTRATION)
  const [finishRegistrationMutation] =
    useMutation<AuthPayloadResult<'finishCustomerPasskeyRegistration'>>(
      FINISH_CUSTOMER_PASSKEY_REGISTRATION,
    )
  const [beginLoginMutation] = useMutation<{
    beginCustomerPasskeyLogin: { optionsJson: string }
  }>(BEGIN_CUSTOMER_PASSKEY_LOGIN)
  const [finishLoginMutation] =
    useMutation<AuthPayloadResult<'finishCustomerPasskeyLogin'>>(
      FINISH_CUSTOMER_PASSKEY_LOGIN,
    )
  const [claimOrdersMutation] = useMutation<{ claimCustomerOrders: number }>(
    CLAIM_CUSTOMER_ORDERS,
  )
  const [logoutMutation] = useMutation<{ customerLogout: boolean }>(CUSTOMER_LOGOUT)

  useEffect(() => {
    const onAuthChanged = () => setToken(getCustomerAccessToken())
    window.addEventListener(CUSTOMER_AUTH_EVENT, onAuthChanged)
    return () => window.removeEventListener(CUSTOMER_AUTH_EVENT, onAuthChanged)
  }, [])

  useEffect(() => {
    if (token) return
    let alive = true
    void refreshSessionMutation()
      .then((result) => {
        const auth = result.data?.refreshSession
        if (!alive || auth?.role !== 'customer' || !auth.accessToken) return
        setCustomerAccessToken(auth.accessToken)
        setToken(auth.accessToken)
      })
      .catch(() => {
        /* no customer refresh cookie */
      })
    return () => {
      alive = false
    }
  }, [refreshSessionMutation, token])

  async function requestOtp(phone: string, purpose: 'signup' | 'login' | 'recovery') {
    const result = await requestOtpMutation({
      variables: { input: { phone, purpose } },
    })
    return result.data?.requestCustomerOtp
  }

  async function verifyOtp(phone: string, code: string, purpose: 'signup' | 'login' | 'recovery') {
    const result = await verifyOtpMutation({
      variables: { input: { phone, code, purpose } },
    })
    const auth = result.data?.verifyCustomerOtp
    if (auth?.accessToken) {
      setCustomerAccessToken(auth.accessToken)
      setToken(auth.accessToken)
      await refetchAccount()
    }
    return auth
  }

  async function registerPasskey(phone: string) {
    const begin = await beginRegistrationMutation({ variables: { phone } })
    const optionsJson = begin.data?.beginCustomerPasskeyRegistration.optionsJson
    if (!optionsJson) throw new Error('Could not start passkey registration')
    const response = await startRegistration({ optionsJSON: JSON.parse(optionsJson) })
    const finish = await finishRegistrationMutation({
      variables: { input: { phone, responseJson: JSON.stringify(response) } },
    })
    const auth = finish.data?.finishCustomerPasskeyRegistration
    if (auth?.accessToken) {
      setCustomerAccessToken(auth.accessToken)
      setToken(auth.accessToken)
      await refetchAccount()
    }
    return auth
  }

  async function loginWithPasskey(phone: string) {
    const begin = await beginLoginMutation({ variables: { phone } })
    const optionsJson = begin.data?.beginCustomerPasskeyLogin.optionsJson
    if (!optionsJson) throw new Error('Could not start passkey login')
    const response = await startAuthentication({ optionsJSON: JSON.parse(optionsJson) })
    const finish = await finishLoginMutation({
      variables: { input: { phone, responseJson: JSON.stringify(response) } },
    })
    const auth = finish.data?.finishCustomerPasskeyLogin
    if (auth?.accessToken) {
      setCustomerAccessToken(auth.accessToken)
      setToken(auth.accessToken)
      await refetchAccount()
    }
    return auth
  }

  async function claimOrders(orderIds: string[]) {
    if (!getCustomerAccessToken() || orderIds.length === 0) return 0
    const result = await claimOrdersMutation({ variables: { orderIds } })
    await refetchAccount()
    return result.data?.claimCustomerOrders ?? 0
  }

  async function logout() {
    try {
      await logoutMutation()
    } finally {
      clearCustomerAccessToken()
      setToken('')
      await apolloClient.clearStore()
    }
  }

  async function refetchAccount() {
    await Promise.allSettled([
      meQuery.refetch(),
      expenseQuery.refetch(),
      apolloClient.refetchQueries({ include: ['CustomerOrders'] }),
    ])
  }

  return {
    claimOrders,
    expense: expenseQuery.data?.customerExpenseSummary ?? null,
    expenseLoading: expenseQuery.loading,
    isSignedIn: Boolean(token && meQuery.data?.customerMe),
    loginWithPasskey,
    logout,
    me: meQuery.data?.customerMe ?? null,
    meLoading: meQuery.loading,
    refetchAccount,
    registerPasskey,
    requestOtp,
    token,
    verifyOtp,
  }
}

export type CustomerAccountState = ReturnType<typeof useCustomerAccount>
