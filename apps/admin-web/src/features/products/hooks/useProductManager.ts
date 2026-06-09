import { useMutation, useQuery } from '@apollo/client/react'
import type React from 'react'
import { useEffect, useState } from 'react'
import {
  ARCHIVE_PRODUCT,
  CATEGORIES,
  CREATE_CATEGORY,
  CREATE_PRODUCT,
  PRODUCTS,
  UPDATE_CATEGORY,
  UPDATE_PRODUCT,
  type CategoryRow,
  type ProductRow,
} from '../../../graphql/products'
import { useAdminSession } from '../../../lib/adminSession'
import { birrInputToCents } from '../../../lib/price'
import type { CategoryFormState, ProductToast } from '../products.types'
import { formatSubmitError, graphqlErrorMessage } from '../products.utils'
import { useProductForm } from './useProductForm'

type CategoryMutationResult = {
  createCategory?: CategoryRow | null
  updateCategory?: CategoryRow | null
}

export function useProductManager() {
  const { shopId } = useAdminSession()
  const productForm = useProductForm()
  const [toast, setToast] = useState<ProductToast | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(() => emptyCategoryForm())
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)

  const { data, loading, error, refetch } = useQuery<{ products: ProductRow[] }>(
    PRODUCTS,
    {
      variables: { shopId, categoryId: undefined },
      fetchPolicy: 'network-only',
    },
  )
  const {
    data: categoryData,
    loading: categoriesLoading,
    refetch: refetchCategories,
  } = useQuery<{ categories: CategoryRow[] }>(CATEGORIES, {
    variables: { shopId },
    fetchPolicy: 'network-only',
  })

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT)
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT)
  const [archiveProduct, { loading: archiving }] = useMutation(ARCHIVE_PRODUCT)
  const [createCategory, { loading: creatingCategory }] =
    useMutation<CategoryMutationResult>(CREATE_CATEGORY)
  const [updateCategory, { loading: updatingCategory }] =
    useMutation<CategoryMutationResult>(UPDATE_CATEGORY)

  const categories = categoryData?.categories ?? []

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), 4500)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  function openCreate() {
    setToast(null)
    productForm.openCreate()
  }

  function openEdit(product: ProductRow) {
    setToast(null)
    productForm.openEdit(product)
  }

  function closeModal() {
    setToast(null)
    productForm.closeModal()
  }

  function openCreateCategory() {
    setToast(null)
    setCategoryForm(emptyCategoryForm(categories.length * 10 + 10))
    setCategoryModalOpen(true)
  }

  function openEditCategory(categoryId: string) {
    const category = categories.find((row) => row.id === categoryId)
    if (!category) return
    setToast(null)
    setCategoryForm({
      id: category.id,
      name: category.name,
      iconKey: category.iconKey,
      color: category.color,
      sortOrder: String(category.sortOrder),
      active: category.active,
    })
    setCategoryModalOpen(true)
  }

  function closeCategoryModal() {
    setCategoryModalOpen(false)
    setCategoryForm(emptyCategoryForm())
  }

  async function onCategorySubmit(event: React.FormEvent) {
    event.preventDefault()
    const name = categoryForm.name.trim()
    if (!name) return
    const sortOrder = Number(categoryForm.sortOrder || 0)
    const input = {
      name,
      iconKey: categoryForm.iconKey,
      color: categoryForm.color,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      active: categoryForm.active,
    }
    setToast(null)
    try {
      const result = categoryForm.id
        ? await updateCategory({
            variables: {
              categoryId: categoryForm.id,
              shopId,
              input,
            },
          })
        : await createCategory({
            variables: {
              shopId,
              input,
            },
          })
      const saved =
        result.data?.createCategory ?? result.data?.updateCategory ?? null
      await refetchCategories()
      await refetch()
      if (saved) {
        productForm.setForm((current) => ({
          ...current,
          categoryId: saved.id,
        }))
      }
      closeCategoryModal()
    } catch (err) {
      setToast({
        variant: 'error',
        message: graphqlErrorMessage(err) || 'Could not save category.',
      })
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const form = productForm.form
    const unitPrice = birrInputToCents(form.priceBirr)
    const selectedCategory = categories.find((category) => category.id === form.categoryId)
    if (!form.name.trim() || !selectedCategory) return

    setToast(null)
    try {
      const imageUrl = form.imageUrl.trim()
      if (productForm.editing) {
        await updateProduct({
          variables: {
            productId: productForm.editing.id,
            shopId,
            input: {
              name: form.name.trim(),
              categoryId: selectedCategory.id,
              unitPrice,
              imageUrl,
              active: form.active,
            },
          },
        })
      } else {
        await createProduct({
          variables: {
            shopId,
            input: {
              name: form.name.trim(),
              categoryId: selectedCategory.id,
              unitPrice,
              ...(imageUrl ? { imageUrl } : {}),
              active: form.active,
            },
          },
        })
      }
      await refetch()
      closeModal()
    } catch (err) {
      setToast({
        variant: 'error',
        message: formatSubmitError(err) ?? 'Could not save. Please try again.',
      })
    }
  }

  function onArchiveClick(product: ProductRow) {
    if (
      !window.confirm('Are you sure you want to remove this item from the active menu?')
    ) {
      return
    }

    void (async () => {
      setToast(null)
      try {
        await archiveProduct({ variables: { productId: product.id, shopId } })
        await refetch()
      } catch (err) {
        const raw = graphqlErrorMessage(err)
        setToast({
          variant: 'error',
          message: raw.trim() ? raw : 'Could not archive this item.',
        })
      }
    })()
  }

  return {
    archiving,
    categories,
    categoriesLoading,
    categoryForm: {
      closeCategoryModal,
      form: categoryForm,
      modalOpen: categoryModalOpen,
      openCreateCategory,
      openEditCategory,
      saving: creatingCategory || updatingCategory,
      setForm: setCategoryForm,
      onSubmit: onCategorySubmit,
    },
    closeModal,
    error,
    loading,
    onArchiveClick,
    onSubmit,
    openCreate,
    openEdit,
    productForm,
    rows: data?.products ?? [],
    saving: creating || updating,
    shopId,
    toast,
  }
}

function emptyCategoryForm(sortOrder = 10): CategoryFormState {
  return {
    name: '',
    iconKey: 'grid',
    color: '#E8C49E',
    sortOrder: String(sortOrder),
    active: true,
  }
}

