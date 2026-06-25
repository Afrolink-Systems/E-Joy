import { gql } from '@apollo/client'

export const PRODUCT_REVIEWS = gql`
  query ProductReviews($shopId: ID!, $productId: ID!) {
    productReviews(shopId: $shopId, productId: $productId) {
      id
      productId
      rating
      comment
      author
      createdAt
    }
  }
`

export const CREATE_PRODUCT_REVIEW = gql`
  mutation CreateProductReview($input: CreateProductReviewInput!) {
    createProductReview(input: $input) {
      id
      productId
      rating
      comment
      author
      createdAt
    }
  }
`

export type ProductReview = {
  id: string
  productId: string
  rating: number
  comment: string
  author?: string | null
  createdAt: string
}

export type ProductReviewsData = {
  productReviews: ProductReview[]
}

export type CreateProductReviewData = {
  createProductReview: ProductReview
}
