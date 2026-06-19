import { gql } from '@apollo/client'

export const REQUEST_CUSTOMER_OTP = gql`
  mutation RequestCustomerOtp($input: RequestCustomerOtpInput!) {
    requestCustomerOtp(input: $input) {
      ok
      expiresAt
      retryAfterSeconds
      devCode
    }
  }
`

export const VERIFY_CUSTOMER_OTP = gql`
  mutation VerifyCustomerOtp($input: VerifyCustomerOtpInput!) {
    verifyCustomerOtp(input: $input) {
      accessToken
      expiresAt
      role
      scope
    }
  }
`

export const REFRESH_CUSTOMER_SESSION = gql`
  mutation RefreshCustomerSession {
    refreshSession {
      accessToken
      expiresAt
      role
      scope
    }
  }
`

export const BEGIN_CUSTOMER_PASSKEY_REGISTRATION = gql`
  mutation BeginCustomerPasskeyRegistration($phone: String!) {
    beginCustomerPasskeyRegistration(phone: $phone) {
      optionsJson
    }
  }
`

export const FINISH_CUSTOMER_PASSKEY_REGISTRATION = gql`
  mutation FinishCustomerPasskeyRegistration($input: FinishCustomerPasskeyInput!) {
    finishCustomerPasskeyRegistration(input: $input) {
      accessToken
      expiresAt
      role
      scope
    }
  }
`

export const BEGIN_CUSTOMER_PASSKEY_LOGIN = gql`
  mutation BeginCustomerPasskeyLogin($phone: String!) {
    beginCustomerPasskeyLogin(phone: $phone) {
      optionsJson
    }
  }
`

export const FINISH_CUSTOMER_PASSKEY_LOGIN = gql`
  mutation FinishCustomerPasskeyLogin($input: FinishCustomerPasskeyInput!) {
    finishCustomerPasskeyLogin(input: $input) {
      accessToken
      expiresAt
      role
      scope
    }
  }
`

export const CUSTOMER_ME = gql`
  query CustomerMe {
    customerMe {
      id
      phone
      name
      phoneVerified
      passkeyCount
    }
  }
`

export const CUSTOMER_LOGOUT = gql`
  mutation CustomerLogout {
    customerLogout
  }
`

export const CLAIM_CUSTOMER_ORDERS = gql`
  mutation ClaimCustomerOrders($orderIds: [String!]!) {
    claimCustomerOrders(orderIds: $orderIds)
  }
`

export const CUSTOMER_EXPENSE_SUMMARY = gql`
  query CustomerExpenseSummary {
    customerExpenseSummary {
      orderCount
      totalAmount
      byRestaurant {
        shopId
        shopName
        orderCount
        totalAmount
      }
    }
  }
`

export type CustomerAuthPayload = {
  accessToken: string
  expiresAt: string
  role: string
  scope: string[]
}

export type CustomerMe = {
  id: string
  phone: string
  name?: string | null
  phoneVerified: boolean
  passkeyCount: number
}

export type CustomerExpenseSummary = {
  orderCount: number
  totalAmount: number
  byRestaurant: Array<{
    shopId: string
    shopName: string
    orderCount: number
    totalAmount: number
  }>
}
