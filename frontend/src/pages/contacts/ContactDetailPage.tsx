import { useMemo, useState, type ReactNode } from "react"
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
import { useBaseDialogOpenChange } from "@/components/ui/stacked-modal"
import { companyKeys, getCompany, listCompanies } from "@/features/companies/api"
import { ContactForm } from "@/features/contacts/ContactForm"
import {
  contactKeys,
  deleteContact,
  getContact,
  updateContact,
} from "@/features/contacts/api"
import type { ContactInput } from "@/types/contact"

export function ContactDetailPage() {
  const { contactId } = useParams({ from: "/contacts/$contactId" })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const onEditOpenChange = useBaseDialogOpenChange(setEditOpen)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const contactQuery = useQuery({
    queryKey: contactKeys.detail(contactId),
    queryFn: () => getContact(contactId),
  })

  const employerCompanyId = contactQuery.data?.employerCompanyId
  const companyQuery = useQuery({
    queryKey: companyKeys.detail(employerCompanyId ?? "unknown"),
    queryFn: () => getCompany(employerCompanyId!),
    enabled: !!employerCompanyId,
  })

  const companiesQuery = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: listCompanies,
  })

  const companyNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const company of companiesQuery.data ?? []) {
      map.set(company.id, company.name)
    }
    return map
  }, [companiesQuery.data])

  const employerName =
    companyQuery.data?.name ??
    (employerCompanyId
      ? companyNameById.get(employerCompanyId) ?? null
      : null)

  const updateMutation = useMutation({
    mutationFn: (input: ContactInput) => updateContact(contactId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contactKeys.all })
      setEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteContact(contactId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contactKeys.all })
      await navigate({ to: "/contacts" })
    },
  })

  if (contactQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading contact...</p>
  }

  if (contactQuery.isError || !contactQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">Contact not found.</p>
        <Link
          to="/contacts"
          className="inline-flex h-7 w-fit items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-input/50"
        >
          Back to contacts
        </Link>
      </div>
    )
  }

  const contact = contactQuery.data
  const hiringIds = contact.hiringCompanyIds ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link
            to="/contacts"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Contacts
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-medium tracking-tight">
              {contact.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[contact.position, employerName].filter(Boolean).join(" · ") || "—"}
            </p>
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
          <CardDescription>
            Reusable across jobs and threads for companies they work at or hire for.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Works at">
            <Link
              to="/companies/$companyId"
              params={{ companyId: contact.employerCompanyId }}
              className="text-primary underline-offset-4 hover:underline"
            >
              {employerName ?? "View company"}
            </Link>
          </Field>
          <Field label="Hiring for">
            {hiringIds.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {hiringIds.map((id) => (
                  <li key={id}>
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: id }}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {companyNameById.get(id) ?? "View company"}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Position">{contact.position || "—"}</Field>
          <Field label="Emails">
            {contact.emails.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {contact.emails.map((email) => (
                  <li key={email}>
                    <a
                      href={`mailto:${email}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {email}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Phones">
            {contact.phones.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {contact.phones.map((phone) => (
                  <li key={phone}>{phone}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Field>
          <Field label="LinkedIn">
            {contact.linkedinUrl ? (
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Profile
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Updated">
            <Badge variant="secondary">
              {new Date(contact.updatedAt).toLocaleString()}
            </Badge>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <p className="whitespace-pre-wrap">{contact.notes || "—"}</p>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={onEditOpenChange}>
        {editOpen ? (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit contact</DialogTitle>
              <DialogDescription>Update contact details.</DialogDescription>
            </DialogHeader>
            <ContactForm
              key={contact.updatedAt}
              initial={contact}
              submitLabel="Save changes"
              isSubmitting={updateMutation.isPending}
              onCancel={() => setEditOpen(false)}
              onSubmit={async (input) => {
                await updateMutation.mutateAsync(input)
              }}
            />
            {updateMutation.isError && (
              <p className="text-xs text-destructive">Could not update contact.</p>
            )}
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete contact?</DialogTitle>
            <DialogDescription>
              This removes <strong>{contact.name}</strong>. Threads that reference this
              contact may be affected.
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
            <p className="text-xs text-destructive">Could not delete contact.</p>
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
