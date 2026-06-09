import { useState } from 'react'
import { DataList } from '../../platform-console/components/DataList'
import type { Banner, CreateBannerForm } from '../marketing.types'
import { BannerCreateDialog } from './BannerCreateDialog'

type BannerListProps = {
  banners: Banner[]
  onCreate: (input: CreateBannerForm) => Promise<void>
  onDisable: (index: number) => void
}

export function BannerList({ banners, onCreate, onDisable }: BannerListProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createBanner(input: CreateBannerForm) {
    setError(null)
    setSaving(true)
    try {
      await onCreate(input)
      setCreateOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Banner upload failed')
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DataList
        title="Banners"
        actionLabel="New banner"
        onAction={() => {
          setError(null)
          setCreateOpen(true)
        }}
        rows={banners.map((banner) => [banner.title, banner.status, banner.linkUrl ?? 'No link'])}
        rowAction={onDisable}
      />
      <BannerCreateDialog
        error={error}
        open={createOpen}
        saving={saving}
        onCreate={createBanner}
        onOpenChange={setCreateOpen}
      />
    </>
  )
}
