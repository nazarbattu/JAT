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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { companyKeys, listCompanies } from "@/features/companies/api"
import { JobForm } from "@/features/jobs/JobForm"
import { JobStatusBadge } from "@/features/jobs/JobStatusBadge"
import { createJob, jobKeys, listJobs } from "@/features/jobs/api"
import {
  JOB_STATUSES,
  JOB_STATUS_LABELS,
  type JobInput,
  type JobStatus,
} from "@/types/job"

export function JobsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all")

  const jobsQuery = useQuery({
    queryKey: jobKeys.list({
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    queryFn: () =>
      listJobs({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
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
    mutationFn: createJob,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.all })
      setCreateOpen(false)
    },
  })

  const statusItems = {
    all: "All statuses",
    ...Object.fromEntries(
      JOB_STATUSES.map((status) => [status, JOB_STATUS_LABELS[status]]),
    ),
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium tracking-tight">Jobs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Roles you are tracking. Creating a job also starts its thread.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Add job
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            if (value) setStatusFilter(value as JobStatus | "all")
          }}
          items={statusItems}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {JOB_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {JOB_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {jobsQuery.isLoading && (
        <p className="text-sm text-muted-foreground">Loading jobs...</p>
      )}

      {jobsQuery.isError && (
        <p className="text-sm text-destructive">
          Failed to load jobs. Is the backend running on port 8080?
        </p>
      )}

      {jobsQuery.data && jobsQuery.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No jobs yet.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            Add your first job
          </Button>
        </div>
      )}

      {jobsQuery.data && jobsQuery.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Portal</TableHead>
                <TableHead className="w-[1%] whitespace-nowrap">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobsQuery.data.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Link
                      to="/jobs/$jobId"
                      params={{ jobId: job.id }}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      to="/companies/$companyId"
                      params={{ companyId: job.companyId }}
                      className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {companyNameById.get(job.companyId) ?? "Unknown company"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {job.portal || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(job.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add job</DialogTitle>
            <DialogDescription>
              Track a role at a company. A conversation thread is created automatically.
            </DialogDescription>
          </DialogHeader>
          <JobForm
            submitLabel="Create"
            isSubmitting={createMutation.isPending}
            onCancel={() => setCreateOpen(false)}
            onSubmit={async (input: JobInput) => {
              await createMutation.mutateAsync(input)
            }}
          />
          {createMutation.isError && (
            <p className="text-xs text-destructive">Could not create job.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
