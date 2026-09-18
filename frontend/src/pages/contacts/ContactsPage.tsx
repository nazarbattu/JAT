import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { companyKeys, listCompanies } from "@/features/companies/api"
import { ContactForm } from "@/features/contacts/ContactForm"
import {
  contactKeys,
  createContact,
  listContacts,
} from "@/features/contacts/api"
import type { ContactInput } from "@/types/contact"

export function ContactsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)

  const contactsQuery = useQuery({
    queryKey: contactKeys.lists(),
    queryFn: () => listContacts(),
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

  const createMutation = useMutation({
    mutationFn: createContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contactKeys.all })
      setCreateOpen(false)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            People at companies you are tracking.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add contact
        </Button>
      </div>

      {contactsQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Loading contacts...</p>
      )}

      {contactsQuery.isError && (
        <p className="text-sm text-destructive">
          Failed to load contacts. Is the backend running on port 8080?
        </p>
      )}

      {contactsQuery.data && contactsQuery.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No contacts yet.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            Add your first contact
          </Button>
        </div>
      )}

      {contactsQuery.data && contactsQuery.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contactsQuery.data.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Link
                      to="/contacts/$contactId"
                      params={{ contactId: contact.id }}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {contact.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: contact.companyId }}
                      className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {companyNameById.get(contact.companyId) ?? "Unknown company"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.position || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.emails[0] || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.phones[0] || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(contact.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add contact</DialogTitle>
            <DialogDescription>
              Add a person at a company for threads and interactions.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            submitLabel="Create"
            isSubmitting={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (input: ContactInput) => {
              await createMutation.mutateAsync(input)
            }}
          />
          {createMutation.isError && (
            <p className="text-xs text-destructive">Could not create contact.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
