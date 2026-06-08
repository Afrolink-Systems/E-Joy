export type ProductFormState = {
  name: string
  categoryId: string
  priceBirr: string
  imageUrl: string
  active: boolean
}

export type CategoryFormState = {
  id?: string
  name: string
  iconKey: string
  color: string
  sortOrder: string
  active: boolean
}

export type ProductToast = {
  variant: 'error'
  message: string
}

