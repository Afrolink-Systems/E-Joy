import { gql } from '@apollo/client'

export const PRODUCTS = gql`
  query AdminProducts($shopId: String, $categoryId: String) {
    products(shopId: $shopId, categoryId: $categoryId) {
      id
      shopId
      name
      categoryId
      category {
        id
        shopId
        name
        iconKey
        color
        sortOrder
        active
      }
      unitPrice
      imageUrl
      active
      status
    }
  }
`

export const CATEGORIES = gql`
  query AdminCategories($shopId: String) {
    categories(shopId: $shopId) {
      id
      shopId
      name
      iconKey
      color
      sortOrder
      active
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($shopId: String, $input: CreateCategoryInput!) {
    createCategory(shopId: $shopId, input: $input) {
      id
      shopId
      name
      iconKey
      color
      sortOrder
      active
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($categoryId: String!, $shopId: String, $input: UpdateCategoryInput!) {
    updateCategory(categoryId: $categoryId, shopId: $shopId, input: $input) {
      id
      shopId
      name
      iconKey
      color
      sortOrder
      active
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($shopId: String!, $input: CreateProductInput!) {
    createProduct(shopId: $shopId, input: $input) {
      id
      shopId
      name
      categoryId
      category {
        id
        shopId
        name
        iconKey
        color
        sortOrder
        active
      }
      unitPrice
      imageUrl
      active
      status
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($productId: String!, $shopId: String, $input: UpdateProductInput!) {
    updateProduct(productId: $productId, shopId: $shopId, input: $input) {
      id
      shopId
      name
      categoryId
      category {
        id
        shopId
        name
        iconKey
        color
        sortOrder
        active
      }
      unitPrice
      imageUrl
      active
      status
    }
  }
`

export const ARCHIVE_PRODUCT = gql`
  mutation ArchiveProduct($productId: String!, $shopId: String) {
    archiveProduct(productId: $productId, shopId: $shopId) {
      id
      status
    }
  }
`

export type ProductRow = {
  id: string
  shopId: string
  name: string
  categoryId: string
  category: CategoryRow
  unitPrice: number
  imageUrl?: string | null
  active: boolean
  status: 'ACTIVE' | 'ARCHIVED'
}

export type CategoryRow = {
  id: string
  shopId: string
  name: string
  iconKey: string
  color: string
  sortOrder: number
  active: boolean
}
