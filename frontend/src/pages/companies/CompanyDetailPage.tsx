import { useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "@tanstack/react-router"
import { ArrowLeftIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CompanyForm } from "@/features/companies/CompanyForm"
import {
  companyKeys,
  deleteCompany,
  getCompany,
  updateCompany,
} from "@/features/companies/api"
import type { CompanyInput } from "@/types/company"

export function CompanyDetailPage() {
  const { companyId } = useParams({ from: "/companies/$companyId" })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const companyQuery = useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: () => getCompany(companyId),
  })

  const updateMutation = useMutation({
    mutationFn: (input: CompanyInput) => updateCompany(companyId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all })
      setEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteCompany(companyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all })
      await navigate({ to: "/companies" })
    },
  })

  if (companyQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading company...</p>
  }

  if (companyQuery.isError || !companyQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">Company not found.</p>
        <Link
          to="/companies"
          className="inline-flex h-7 w-fit items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-input/50"
        >
          Back to companies
        </Link>
      </div>
    )
  }

  const company = companyQuery.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link
            to="/companies"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Companies
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-medium tracking-tight">
              {company.name}
            </h1>
            {company.location && (
              <p className="mt-1 text-sm text-muted-foreground">{company.location}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <PencilIcon data-icon="inline-start" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Company profile used across jobs and contacts.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Website">
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {company.website}
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Careers URL">
            {company.careersUrl ? (
              <a
                href={company.careersUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                {company.careersUrl}
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Location">{company.location || "—"}</Field>
          <Field label="Updated">
            <Badge variant="secondary">
              {new Date(company.updatedAt).toLocaleString()}
            </Badge>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <p className="whitespace-pre-wrap">{company.notes || "—"}</p>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit company</DialogTitle>
            <DialogDescription>Update company details.</DialogDescription>
          </DialogHeader>
          <CompanyForm
            key={company.updatedAt}
            initial={company}
            submitLabel="Save changes"
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditOpen(false)}
            onSubmit={async (input) => {
              await updateMutation.mutateAsync(input)
            }}
          />
          {updateMutation.isError && (
            <p className="text-xs text-destructive">Could not update company.</p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete company?</DialogTitle>
            <DialogDescription>
              This removes <strong>{company.name}</strong>. Related jobs may fail if the
              backend enforces foreign keys.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
          {deleteMutation.isError && (
            <p className="text-xs text-destructive">Could not delete company.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm break-all">{children}</dd>
    </div>
  )
}
