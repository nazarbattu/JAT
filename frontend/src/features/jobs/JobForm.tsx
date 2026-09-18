import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { CompanyForm } from "@/features/companies/CompanyForm"
import {
  companyKeys,
  createCompany,
  listCompanies,
} from "@/features/companies/api"
import { jobSchema, type JobFormValues } from "@/features/jobs/schema"
import { instantToLocalInput, localInputToInstant } from "@/lib/datetime"
import type { CompanyInput } from "@/types/company"
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  type Job,
  type JobInput,
} from "@/types/job"

type JobFormProps = {
  initial?: Job
  defaultCompanyId?: string
  submitLabel?: string
  onSubmit: (input: JobInput) => Promise<void> | void
  onCancel?: () => void
  isSubmitting?: boolean
}

function emptyToNull(value?: string) {
  const trimmed = value?.trim() ?? ""
  return trimmed.length > 0 ? trimmed : null
}

export function JobForm({
  initial,
  defaultCompanyId,
  submitLabel = "Save",
  onSubmit,
  onCancel,
  isSubmitting = false,
}: JobFormProps) {
  const queryClient = useQueryClient()
  const [addCompanyOpen, setAddCompanyOpen] = useState(false)

  const companiesQuery = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: listCompanies,
  })

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      companyId: initial?.companyId ?? defaultCompanyId ?? "",
      title: initial?.title ?? "",
      portal: initial?.portal ?? "",
      portalApplicationId: initial?.portalApplicationId ?? "",
      appliedAt: instantToLocalInput(initial?.appliedAt),
      status: initial?.status ?? "wishlist",
      jobUrl: initial?.jobUrl ?? "",
      notes: initial?.notes ?? "",
    },
  })

  const createCompanyMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: async (company) => {
      await queryClient.invalidateQueries({ queryKey: companyKeys.lists() })
      form.setValue("companyId", company.id, { shouldValidate: true })
      setAddCompanyOpen(false)
    },
  })

  const { errors } = form.formState
  const companies = companiesQuery.data ?? []
  const statusItems = Object.fromEntries(
    JOB_STATUSES.map((status) => [status, JOB_STATUS_LABELS[status]]),
  )

  return (
    <>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit({
            companyId: values.companyId,
            title: values.title.trim(),
            portal: emptyToNull(values.portal),
            portalApplicationId: emptyToNull(values.portalApplicationId),
            appliedAt: localInputToInstant(values.appliedAt),
            status: values.status,
            jobUrl: emptyToNull(values.jobUrl),
            notes: emptyToNull(values.notes),
          })
        })}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="companyId">Company</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAddCompanyOpen(true)}
            >
              <PlusIcon data-icon="inline-start" />
              Add company
            </Button>
          </div>
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
                    <SelectValue
                      placeholder={
                        companies.length === 0
                          ? "Add a company first"
                          : "Select a company"
                      }
                    />
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
          {errors.companyId && (
            <p className="text-xs text-destructive">{errors.companyId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Software Engineer"
            {...form.register("title")}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  if (value) field.onChange(value)
                }}
                items={statusItems}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {JOB_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portal">Portal</Label>
            <Input
              id="portal"
              placeholder="LinkedIn, Naukri…"
              {...form.register("portal")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="portalApplicationId">Portal application ID</Label>
            <Input id="portalApplicationId" {...form.register("portalApplicationId")} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="appliedAt">Applied at</Label>
          <Input id="appliedAt" type="datetime-local" {...form.register("appliedAt")} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jobUrl">Job URL</Label>
          <Input
            id="jobUrl"
            type="url"
            inputMode="url"
            placeholder="https://…"
            {...form.register("jobUrl")}
            aria-invalid={!!errors.jobUrl}
          />
          {errors.jobUrl && (
            <p className="text-xs text-destructive">{errors.jobUrl.message}</p>
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
          <Button type="submit" disabled={isSubmitting || companies.length === 0}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>

      <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add company</DialogTitle>
            <DialogDescription>
              Create a company and select it for this job.
            </DialogDescription>
          </DialogHeader>
          <CompanyForm
            submitLabel="Create & select"
            isSubmitting={createCompanyMutation.isPending}
            onCancel={() => setAddCompanyOpen(false)}
            onSubmit={async (input: CompanyInput) => {
              await createCompanyMutation.mutateAsync(input)
            }}
          />
          {createCompanyMutation.isError && (
            <p className="text-xs text-destructive">Could not create company.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
