import { Loader2, Pencil, Plus } from 'lucide-react'
import type React from 'react'
import { Button } from '../../../components/ui/button'
import { Checkbox } from '../../../components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Field, FieldContent, FieldGroup, FieldLabel } from '../../../components/ui/field'
import { Input } from '../../../components/ui/input'
import { NativeSelect, NativeSelectOption } from '../../../components/ui/native-select'
import type { CategoryRow } from '../../../graphql/products'
import type { ProductFormState } from '../products.types'
import { ProductImageInput } from './ProductImageInput'

type ProductFormDialogProps = {
  categories: CategoryRow[]
  categoriesLoading: boolean
  form: ProductFormState
  open: boolean
  saving: boolean
  title: string
  uploadError: string | null
  uploading: boolean
  onClose: () => void
  onFileUpload: (file: File | undefined) => void
  onFormChange: React.Dispatch<React.SetStateAction<ProductFormState>>
  onOpenCreateCategory: () => void
  onOpenEditCategory: (categoryId: string) => void
  onSubmit: (event: React.FormEvent) => void
}

export function ProductFormDialog({
  categories,
  categoriesLoading,
  form,
  open,
  saving,
  title,
  uploadError,
  uploading,
  onClose,
  onFileUpload,
  onFormChange,
  onOpenCreateCategory,
  onOpenEditCategory,
  onSubmit,
}: ProductFormDialogProps) {
  const selectableCategories = categories.filter(
    (category) => category.active || category.id === form.categoryId,
  )
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose()
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Update the menu item details shown to customers.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="product-name">Name</FieldLabel>
              <Input
                id="product-name"
                required
                value={form.name}
                onChange={(event) =>
                  onFormChange((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="product-category">Category</FieldLabel>
              <div className="flex gap-2">
                <NativeSelect
                  id="product-category"
                  required
                  className="min-w-0 flex-1"
                  disabled={categoriesLoading}
                  value={form.categoryId}
                  onChange={(event) => {
                    const category = categories.find((row) => row.id === event.target.value)
                    onFormChange((current) => ({
                      ...current,
                      categoryId: category?.id ?? '',
                    }))
                  }}
                >
                  <NativeSelectOption value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select category'}
                  </NativeSelectOption>
                  {selectableCategories.map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {category.active ? category.name : `${category.name} (inactive)`}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                <Button type="button" variant="outline" size="icon" onClick={onOpenCreateCategory} title="Add category">
                  <Plus className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!form.categoryId}
                  onClick={() => onOpenEditCategory(form.categoryId)}
                  title="Edit selected category"
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="product-price">Price (Birr)</FieldLabel>
              <Input
                id="product-price"
                required
                inputMode="decimal"
                value={form.priceBirr}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    priceBirr: event.target.value,
                  }))
                }
                placeholder="e.g. 380.00"
                className="tabular-nums"
              />
            </Field>
            <ProductImageInput
              form={form}
              uploadError={uploadError}
              uploading={uploading}
              onFileUpload={onFileUpload}
              onFormChange={onFormChange}
            />
            <Field orientation="horizontal">
              <Checkbox
                checked={form.active}
                onCheckedChange={(checked) =>
                  onFormChange((current) => ({
                    ...current,
                    active: checked === true,
                  }))
                }
              />
              <FieldContent>
                <FieldLabel>Active (on menu)</FieldLabel>
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
