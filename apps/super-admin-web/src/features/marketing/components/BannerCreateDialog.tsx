import type React from 'react'
import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Field, FieldError, FieldLabel } from '../../../components/ui/field'
import { Input } from '../../../components/ui/input'
import type { CreateBannerForm } from '../marketing.types'

type BannerCreateDialogProps = {
  error: string | null
  onCreate: (input: CreateBannerForm) => Promise<void>
  onOpenChange: (open: boolean) => void
  open: boolean
  saving: boolean
}

export function BannerCreateDialog({
  error,
  onCreate,
  onOpenChange,
  open,
  saving,
}: BannerCreateDialogProps) {
  const [title, setTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !imageFile || saving) return
    try {
      await onCreate({
        imageFile,
        linkUrl: linkUrl.trim(),
        title: title.trim(),
      })
      setTitle('')
      setLinkUrl('')
      setImageFile(null)
    } catch {
      // The parent owns the displayed error so the form state can stay intact.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New banner</DialogTitle>
          <DialogDescription>
            Upload a public banner image and publish it to the platform feed.
          </DialogDescription>
        </DialogHeader>
        <form id="create-banner-form" className="grid gap-3" onSubmit={onSubmit}>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="banner-title">Title</FieldLabel>
            <Input
              id="banner-title"
              value={title}
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="banner-link">Link URL</FieldLabel>
            <Input
              id="banner-link"
              value={linkUrl}
              disabled={saving}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="banner-image">Banner image</FieldLabel>
            <Input
              id="banner-image"
              type="file"
              accept="image/*"
              disabled={saving}
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              required
            />
            {imageFile ? (
              <p className="text-xs text-muted-foreground">{imageFile.name}</p>
            ) : null}
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
        </form>
        <DialogFooter showCloseButton>
          <Button
            type="submit"
            form="create-banner-form"
            disabled={saving || !title.trim() || !imageFile}
          >
            {saving ? 'Uploading...' : 'Create banner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
