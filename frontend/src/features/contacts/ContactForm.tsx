import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { StringListField } from "@/components/form/StringListField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { listCompanies, companyKeys } from "@/features/companies/api"
import {
  contactSchema,
  type ContactFormValues,
} from "@/features/contacts/schema"
import type { Contact, ContactInput } from "@/types/contact"

type ContactFormProps = {
  initial?: Contact
  defaultCompanyId?: string
  /** Hide company picker and lock to defaultCompanyId */
  lockCompany?: boolean
  submitLabel?: string
  onSubmit: (input: ContactInput) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

export function ContactForm({
  initial,
  defaultCompanyId,
  lockCompany = false,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ContactFormProps) {
  const companiesQuery = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: listCompanies,
    enabled: !lockCompany,
  })

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      companyId: initial?.companyId ?? defaultCompanyId ?? "",
      name: initial?.name ?? "",
      position: initial?.position ?? "",
      emails: initial?.emails?.length ? initial.emails : [""],
      phones: initial?.phones?.length ? initial.phones : [""],
      linkedinUrl: initial?.linkedinUrl ?? "",
      notes: initial?.notes ?? "",
    },
  })

  const { errors } = form.formState
  const companies = companiesQuery.data ?? []
  const companyLocked = lockCompany && !!defaultCompanyId

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          companyId: companyLocked ? defaultCompanyId! : values.companyId,
          name: values.name.trim(),
          position: emptyToNull(values.position),
          emails: cleanList(values.emails),
          phones: cleanList(values.phones),
          linkedinUrl: emptyToNull(values.linkedinUrl),
          notes: emptyToNull(values.notes),
        })
      })}
    >
      {!companyLocked && (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="companyId">Company</Label>
        <Controller
          control={form.control}
          name="companyId"
          render={({ field }) => {
            const companyItems = Object.fromEntries(
              companies.map((company) => [company.id, company.name]),
            )

            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={companyItems}
                disabled={companies.length === 0}
              >
                <SelectTrigger
                  id="companyId"
                  className="w-full"
                  aria-invalid={!!errors.companyId}
                >
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }}
        />
        {companiesQuery.isLoading && (
          <p className="text-xs text-muted-foreground">Loading companies…</p>
        )}
        {!companiesQuery.isLoading && companies.length === 0 && (
          <p className="text-xs text-destructive">
            Create a company before adding contacts.
          </p>
        )}
        {errors.companyId && (
          <p className="text-xs text-destructive">{errors.companyId.message}</p>
        )}
      </div>
      )}

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
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          placeholder="Recruiter, Hiring Manager…"
          {...form.register("position")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Emails</Label>
        <Controller
          control={form.control}
          name="emails"
          render={({ field }) => (
            <StringListField
              values={field.value}
              onChange={field.onChange}
              type="email"
              placeholder="name@example.com"
              addLabel="Add email"
              aria-invalid={!!errors.emails}
            />
          )}
        />
        {Array.isArray(errors.emails) ? (
          errors.emails.map((error, index) =>
            error?.message ? (
              <p key={index} className="text-xs text-destructive">
                Email {index + 1}: {error.message}
              </p>
            ) : null,
          )
        ) : errors.emails?.message ? (
          <p className="text-xs text-destructive">{errors.emails.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Phones</Label>
        <Controller
          control={form.control}
          name="phones"
          render={({ field }) => (
            <StringListField
              values={field.value}
              onChange={field.onChange}
              type="tel"
              placeholder="+1 555 0100"
              addLabel="Add phone"
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
        <Input
          id="linkedinUrl"
          type="url"
          inputMode="url"
          placeholder="https://linkedin.com/in/…"
          {...form.register("linkedinUrl")}
          aria-invalid={!!errors.linkedinUrl}
        />
        {errors.linkedinUrl && (
          <p className="text-xs text-destructive">{errors.linkedinUrl.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...form.register("notes")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || (!companyLocked && companies.length === 0)}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
