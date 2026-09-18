import { Badge } from "@/components/ui/badge"
import { JOB_STATUS_LABELS, type JobStatus } from "@/types/job"

const STATUS_VARIANT: Record<
  JobStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  wishlist: "outline",
  applied: "secondary",
  in_process: "default",
  offer: "default",
  rejected: "destructive",
  withdrawn: "outline",
  ghosted: "destructive",
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>{JOB_STATUS_LABELS[status]}</Badge>
  )
}
