import { useState } from "react"
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
import { useBaseDialogOpenChange } from "@/components/ui/stacked-modal"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CompanyForm } from "@/features/companies/CompanyForm"
import {
  companyKeys,
  createCompany,
  listCompanies,
} from "@/features/companies/api"
import type { CompanyInput } from "@/types/company"

export function CompaniesPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const onCreateOpenChange = useBaseDialogOpenChange(setCreateOpen)

  const companiesQuery = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: listCompanies,
  })

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: companyKeys.all })
      setCreateOpen(false)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track employers you are applying to.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add company
        </Button>
      </div>

      {companiesQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Loading companies...</p>
      )}

      {companiesQuery.isError && (
        <p className="text-sm text-destructive">
          Failed to load companies. Is the backend running on port 8080?
        </p>
      )}

      {companiesQuery.data && companiesQuery.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No companies yet.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            Add your first company
          </Button>
        </div>
      )}

      {companiesQuery.data && companiesQuery.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Website</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companiesQuery.data.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: company.id }}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {company.location || "—"}
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Visit
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(company.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={onCreateOpenChange}>
        {createOpen ? (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add company</DialogTitle>
              <DialogDescription>
                Create a company to attach jobs and contacts.
              </DialogDescription>
            </DialogHeader>
            <CompanyForm
              submitLabel="Create"
              isSubmitting={createMutation.isPending}
              onCancel={() => setCreateOpen(false)}
              onSubmit={async (input: CompanyInput) => {
                await createMutation.mutateAsync(input)
              }}
            />
            {createMutation.isError && (
              <p className="text-xs text-destructive">Could not create company.</p>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  )
}
