import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LocationInput } from "@/components/location/LocationInput"
import {
  companySchema,
  type CompanyFormValues,
} from "@/features/companies/schema"
import type { Company, CompanyInput } from "@/types/company"

type CompanyFormProps = {
  initial?: Company
  submitLabel?: string
  onSubmit: (input: CompanyInput) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

export function CompanyForm({
  initial,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CompanyFormProps) {
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initial?.name ?? "",
      website: initial?.website ?? "",
      careersUrl: initial?.careersUrl ?? "",
      location: initial?.location ?? "",
      notes: initial?.notes ?? "",
    },
  })

  const { errors } = form.formState

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          name: values.name.trim(),
          website: emptyToNull(values.website),
          careersUrl: emptyToNull(values.careersUrl),
          location: emptyToNull(values.location),
          notes: emptyToNull(values.notes),
        })
      })}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          inputMode="url"
          placeholder="https://example.com"
          {...form.register("website")}
          aria-invalid={!!errors.website}
        />
        {errors.website && (
          <p className="text-xs text-destructive">{errors.website.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="careersUrl">Careers URL</Label>
        <Input
          id="careersUrl"
          type="url"
          inputMode="url"
          placeholder="https://example.com/careers"
          {...form.register("careersUrl")}
          aria-invalid={!!errors.careersUrl}
        />
        {errors.careersUrl && (
          <p className="text-xs text-destructive">{errors.careersUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Controller
          control={form.control}
          name="location"
          render={({ field }) => (
            <LocationInput
              id="location"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={!!errors.location}
              placeholder="Type a city name…"
            />
          )}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={4} {...form.register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
