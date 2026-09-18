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
import { useBaseDialogOpenChange } from "@/components/ui/stacked-modal"
import { companyKeys, getCompany } from "@/features/companies/api"
import { JobForm } from "@/features/jobs/JobForm"
import { JobStatusBadge } from "@/features/jobs/JobStatusBadge"
import { deleteJob, getJob, jobKeys, updateJob } from "@/features/jobs/api"
import { getThreadByJobId, threadKeys } from "@/features/threads/api"
import type { JobInput } from "@/types/job"

export function JobDetailPage() {
  const { jobId } = useParams({ from: "/jobs/$jobId" })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)
  const onEditOpenChange = useBaseDialogOpenChange(setEditOpen)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const jobQuery = useQuery({
    queryKey: jobKeys.detail(jobId),
    queryFn: () => getJob(jobId),
  })

  const companyId = jobQuery.data?.companyId
  const companyQuery = useQuery({
    queryKey: companyKeys.detail(companyId ?? "unknown"),
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
  })

  const threadQuery = useQuery({
    queryKey: threadKeys.byJob(jobId),
    queryFn: () => getThreadByJobId(jobId),
  })

  const updateMutation = useMutation({
    mutationFn: (input: JobInput) => updateJob(jobId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.all })
      setEditOpen(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(jobId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jobKeys.all })
      await navigate({ to: "/jobs" })
    },
  })

  if (jobQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading job...</p>
  }

  if (jobQuery.isError || !jobQuery.data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">Job not found.</p>
        <Link
          to="/jobs"
          className="inline-flex h-7 w-fit items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-input/50"
        >
          Back to jobs
        </Link>
      </div>
    )
  }

  const job = jobQuery.data
  const companyName = companyQuery.data?.name

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Link
            to="/jobs"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            Jobs
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-medium tracking-tight">
              {job.title}
            </h1>
            <JobStatusBadge status={job.status} />
          </div>
          {companyName && (
            <Link
              to="/companies/$companyId"
              params={{ companyId: job.companyId }}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {companyName}
            </Link>
          )}
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
          <CardDescription>Role tracking for this company.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Portal">{job.portal || "—"}</Field>
          <Field label="Portal application ID">
            {job.portalApplicationId || "—"}
          </Field>
          <Field label="Applied at">
            {job.appliedAt ? new Date(job.appliedAt).toLocaleString() : "—"}
          </Field>
          <Field label="Job URL">
            {job.jobUrl ? (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Open listing
              </a>
            ) : (
              "—"
            )}
          </Field>
          <Field label="Updated">
            <Badge variant="secondary">
              {new Date(job.updatedAt).toLocaleString()}
            </Badge>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <p className="whitespace-pre-wrap">{job.notes || "—"}</p>
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thread</CardTitle>
          <CardDescription>
            Conversation tracking for this job (created automatically).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {threadQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading thread…</p>
          )}
          {threadQuery.isError && (
            <p className="text-sm text-destructive">Could not load thread.</p>
          )}
          {threadQuery.data && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="secondary">
                  {threadQuery.data.status.replaceAll("_", " ")}
                </Badge>
                <span className="text-muted-foreground">
                  Started {new Date(threadQuery.data.createdAt).toLocaleString()}
                </span>
                {threadQuery.data.nextFollowUpAt && (
                  <span className="text-muted-foreground">
                    Next follow-up{" "}
                    {new Date(threadQuery.data.nextFollowUpAt).toLocaleString()}
                  </span>
                )}
              </div>
              <Button
                nativeButton={false}
                render={
                  <Link
                    to="/threads/$threadId"
                    params={{ threadId: threadQuery.data.id }}
                    search={{ tab: "interactions" }}
                  />
                }
              >
                Open thread
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={onEditOpenChange}>
        {editOpen ? (
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit job</DialogTitle>
              <DialogDescription>Update role details and status.</DialogDescription>
            </DialogHeader>
            <JobForm
              key={job.updatedAt}
              initial={job}
              submitLabel="Save changes"
              isSubmitting={updateMutation.isPending}
              onCancel={() => setEditOpen(false)}
              onSubmit={async (input) => {
                await updateMutation.mutateAsync(input)
              }}
            />
            {updateMutation.isError && (
              <p className="text-xs text-destructive">Could not update job.</p>
            )}
          </DialogContent>
        ) : null}
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete job?</DialogTitle>
            <DialogDescription>
              This removes <strong>{job.title}</strong> and its thread.
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
            <p className="text-xs text-destructive">Could not delete job.</p>
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
