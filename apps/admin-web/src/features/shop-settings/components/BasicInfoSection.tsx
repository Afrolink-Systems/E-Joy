import type React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Field, FieldGroup, FieldLabel } from '../../../components/ui/field'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import type { ShopSettingsFormState } from '../shop-settings.types'

type BasicInfoSectionProps = {
  form: ShopSettingsFormState
  onFormChange: React.Dispatch<React.SetStateAction<ShopSettingsFormState>>
}

export function BasicInfoSection({ form, onFormChange }: BasicInfoSectionProps) {
  const geolocationAvailable =
    typeof navigator !== 'undefined' && Boolean(navigator.geolocation)

  function useCurrentLocation() {
    if (!geolocationAvailable) return
    navigator.geolocation.getCurrentPosition((position) => {
      onFormChange((current) => ({
        ...current,
        latitude: position.coords.latitude.toFixed(7),
        longitude: position.coords.longitude.toFixed(7),
      }))
    })
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Basic information</CardTitle>
        <CardDescription>Public-facing name and contact details</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="settings-shop-name">Shop name *</FieldLabel>
            <Input
              id="settings-shop-name"
              required
              value={form.name}
              onChange={(event) =>
                onFormChange((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-description">Description</FieldLabel>
            <Textarea
              id="settings-description"
              value={form.description}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              placeholder="Briefly describe your concept, hours, or specialties"
              className="resize-y"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-contact-phone">Contact phone</FieldLabel>
            <Input
              id="settings-contact-phone"
              inputMode="tel"
              value={form.contactPhone}
              onChange={(event) =>
                onFormChange((current) => ({
                  ...current,
                  contactPhone: event.target.value,
                }))
              }
              placeholder="+251 ..."
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <Field>
              <FieldLabel htmlFor="settings-latitude">Latitude</FieldLabel>
              <Input
                id="settings-latitude"
                inputMode="decimal"
                value={form.latitude}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    latitude: event.target.value,
                  }))
                }
                placeholder="9.0300000"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="settings-longitude">Longitude</FieldLabel>
              <Input
                id="settings-longitude"
                inputMode="decimal"
                value={form.longitude}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    longitude: event.target.value,
                  }))
                }
                placeholder="38.7400000"
              />
            </Field>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full md:w-auto"
                onClick={useCurrentLocation}
                disabled={!geolocationAvailable}
              >
                Use current location
              </Button>
            </div>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
