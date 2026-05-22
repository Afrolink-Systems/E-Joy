import { gql } from '@apollo/client'

export const INITIATE_PAYMENT_MUTATION = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      ok
      error {
        code
        message
      }
      payment {
        id
        channel
        state
      }
      rawRequest
      toPayUrl
    }
  }
`

export type InitiatePaymentData = {
  initiatePayment?: {
    ok: boolean
    error?: { code?: string; message?: string } | null
    payment?: {
      id: string
      channel: string
      state: string
    } | null
    rawRequest?: string | null
    toPayUrl?: string | null
  } | null
}
