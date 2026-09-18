import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { XIcon } from "lucide-react"
import { StringListField } from "@/components/form/StringListField"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CompanyCombobox } from "@/features/companies/CompanyCombobox"
import { listCompanies, companyKeys } from "@/features/companies/api"
import {
  buildHiringCompanyIds,
  createContactSchema,
  type ContactFormValues,
} from "@/features/contacts/schema"
import type { Contact, ContactInput } from "@/types/contact"

type ContactFormProps = {
  initial?: Contact
  /** Prefill employer / ensure this company stays in hiring-for (e.g. job company). */
  defaultCompanyId?: string
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

function defaultFormValues(
  initial: Contact | undefined,
  defaultCompanyId: string | undefined,
): ContactFormValues {
  if (initial) {
    const employer = initial.employerCompanyId
    const others = (initial.hiringCompanyIds ?? []).filter((id) => id !== employer)
    return {
      employerCompanyId: employer,
      hiringForEmployer: (initial.hiringCompanyIds ?? []).includes(employer),
      otherHiringCompanyIds: others,
      name: initial.name ?? "",
      position: initial.position ?? "",
      emails: initial.emails?.length ? initial.emails : [""],
      phones: initial.phones?.length ? initial.phones : [""],
      linkedinUrl: initial.linkedinUrl ?? "",
      notes: initial.notes ?? "",
    }
  }

  const employer = defaultCompanyId ?? ""
  const otherHiringCompanyIds =
    defaultCompanyId && defaultCompanyId !== employer ? [defaultCompanyId] : []

  return {
    employerCompanyId: employer,
    hiringForEmployer: true,
    otherHiringCompanyIds,
    name: "",
    position: "",
    emails: [""],
    phones: [""],
    linkedinUrl: "",
    notes: "",
  }
}

export function ContactForm({
  initial,
  defaultCompanyId,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ContactFormProps) {
  const companiesQuery = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: listCompanies,
  })

  const resolver = useMemo(
    () => zodResolver(createContactSchema(defaultCompanyId)),
    [defaultCompanyId],
  )

  const form = useForm<ContactFormValues>({
    resolver,
    defaultValues: defaultFormValues(initial, defaultCompanyId),
  })

  const { errors } = form.formState
  const companies = companiesQuery.data ?? []
  const [employerCompanyId, hiringForEmployer, otherHiringCompanyIds] =
    useWatch({
      control: form.control,
      name: ["employerCompanyId", "hiringForEmployer", "otherHiringCompanyIds"],
    })

  const otherHiringExcludeIds = useMemo(
    () => [employerCompanyId, ...(otherHiringCompanyIds ?? [])].filter(Boolean),
    [employerCompanyId, otherHiringCompanyIds],
  )

  const employerName =
    companies.find((company) => company.id === employerCompanyId)?.name ??
    "their company"

  const requiredHiringName = defaultCompanyId
    ? companies.find((company) => company.id === defaultCompanyId)?.name
    : undefined
  const requiredHiringIsOther =
    !!defaultCompanyId &&
    defaultCompanyId !== employerCompanyId &&
    !(otherHiringCompanyIds ?? []).includes(defaultCompanyId)

  function addOtherHiringCompany(companyId: string) {
    if (!companyId || companyId === employerCompanyId) return
    const current = form.getValues("otherHiringCompanyIds") ?? []
    if (current.includes(companyId)) return
    form.setValue("otherHiringCompanyIds", [...current, companyId], {
      shouldValidate: true,
    })
  }

  function removeOtherHiringCompany(companyId: string) {
    const current = form.getValues("otherHiringCompanyIds") ?? []
    form.setValue(
      "otherHiringCompanyIds",
      current.filter((id) => id !== companyId),
      { shouldValidate: true },
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit({
          employerCompanyId: values.employerCompanyId,
          hiringCompanyIds: buildHiringCompanyIds(values, defaultCompanyId),
          name: values.name.trim(),
          position: emptyToNull(values.position),
          emails: cleanList(values.emails),
          phones: cleanList(values.phones),
          linkedinUrl: emptyToNull(values.linkedinUrl),
          notes: emptyToNull(values.notes),
        })
      })}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="employerCompanyId">Works for</Label>
        <Controller
          control={form.control}
          name="employerCompanyId"
          render={({ field }) => (
            <CompanyCombobox
              id="employerCompanyId"
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                form.setValue(
                  "otherHiringCompanyIds",
                  (form.getValues("otherHiringCompanyIds") ?? []).filter(
                    (id) => id !== next,
                  ),
                  { shouldValidate: true },
                )
              }}
              companies={companies}
              placeholder="Search or add a company…"
              disabled={companiesQuery.isLoading}
              aria-invalid={!!errors.employerCompanyId}
            />
          )}
        />
        {companiesQuery.isLoading && (
          <p className="text-xs text-muted-foreground">Loading companies…</p>
        )}
        {errors.employerCompanyId && (
          <p className="text-xs text-destructive">
            {errors.employerCompanyId.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Hiring for</Label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            checked={!!hiringForEmployer}
            disabled={!employerCompanyId}
            onChange={(event) =>
              form.setValue("hiringForEmployer", event.target.checked, {
                shouldValidate: true,
              })
            }
          />
          <span>
            Their company
            {employerCompanyId ? (
              <span className="text-muted-foreground"> ({employerName})</span>
            ) : null}
          </span>
        </label>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="otherHiringCompanies"
            className="text-xs font-normal text-muted-foreground"
          >
            Other companies
          </Label>
          {(otherHiringCompanyIds ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(otherHiringCompanyIds ?? []).map((id) => {
                const name =
                  companies.find((company) => company.id === id)?.name ?? id
                return (
                  <Badge key={id} variant="secondary" className="gap-1 pr-1">
                    {name}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-muted"
                      aria-label={`Remove ${name}`}
                      onClick={() => removeOtherHiringCompany(id)}
                    >
                      <XIcon className="size-2.5" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          )}
          <CompanyCombobox
            id="otherHiringCompanies"
            value=""
            onChange={addOtherHiringCompany}
            companies={companies}
            excludeIds={otherHiringExcludeIds}
            placeholder="Search or add a company…"
            aria-invalid={!!errors.otherHiringCompanyIds}
          />
          {errors.otherHiringCompanyIds && (
            <p className="text-xs text-destructive">
              {errors.otherHiringCompanyIds.message}
            </p>
          )}
        </div>

        {errors.hiringForEmployer && (
          <p className="text-xs text-destructive">
            {errors.hiringForEmployer.message}
          </p>
        )}

        {requiredHiringIsOther && requiredHiringName && (
          <p className="text-xs text-muted-foreground">
            This contact will also be marked as hiring for {requiredHiringName}{" "}
            (this job’s company).
          </p>
        )}
      </div>

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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
