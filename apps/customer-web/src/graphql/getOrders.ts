import { gql } from '@apollo/client'

export const GET_ORDERS_QUERY = gql`
  query CustomerOrders($ids: [ID!]) {
    getOrders(ids: $ids) {
      id
      totalAmount
      status
      createdAt
      items {
        quantity
        priceAtTime
        product {
          name
          imageUrl
        }
      }
    }
  }
`

export type CustomerOrdersData = {
  getOrders: Array<{
    id: string
    totalAmount: number
    status: string
    createdAt: string
    items: Array<{
      quantity: number
      priceAtTime: number
      product: { name: string; imageUrl?: string | null }
    }>
  }>
}
