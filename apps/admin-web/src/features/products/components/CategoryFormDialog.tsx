import { Loader2 } from 'lucide-react'
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
import type { CategoryFormState } from '../products.types'
import { CATEGORY_ICON_OPTIONS } from './category-form-options'

type CategoryFormDialogProps = {
  form: CategoryFormState
  open: boolean
  saving: boolean
  onClose: () => void
  onFormChange: React.Dispatch<React.SetStateAction<CategoryFormState>>
  onSubmit: (event: React.FormEvent) => void
}

export function CategoryFormDialog({
  form,
  open,
  saving,
  onClose,
  onFormChange,
  onSubmit,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose()
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{form.id ? 'Edit category' : 'Add category'}</DialogTitle>
          <DialogDescription>Choose how this category appears in the customer menu.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input
                id="category-name"
                required
                value={form.name}
                onChange={(event) =>
                  onFormChange((current) => ({ ...current, name: event.target.value }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category-icon">Icon</FieldLabel>
              <NativeSelect
                id="category-icon"
                className="w-full"
                value={form.iconKey}
                onChange={(event) =>
                  onFormChange((current) => ({ ...current, iconKey: event.target.value }))
                }
              >
                {CATEGORY_ICON_OPTIONS.map((option) => (
                  <NativeSelectOption key={option.value} value={option.value}>
                    {option.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="category-color">Color</FieldLabel>
                <Input
                  id="category-color"
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    onFormChange((current) => ({ ...current, color: event.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category-sort">Sort order</FieldLabel>
                <Input
                  id="category-sort"
                  inputMode="numeric"
                  value={form.sortOrder}
                  onChange={(event) =>
                    onFormChange((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                />
              </Field>
            </div>
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
                <FieldLabel>Active in customer menu</FieldLabel>
              </FieldContent>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
              Save category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
