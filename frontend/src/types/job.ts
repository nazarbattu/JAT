export const JOB_STATUSES = [
  "wishlist",
  "applied",
  "in_process",
  "offer",
  "rejected",
  "withdrawn",
  "ghosted",
] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  in_process: "In process",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  ghosted: "Ghosted",
}

export type Job = {
  id: string
  companyId: string
  title: string
  portal: string | null
  portalApplicationId: string | null
  appliedAt: string | null
  status: JobStatus
  jobUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type JobInput = {
  companyId: string
  title: string
  portal?: string | null
  portalApplicationId?: string | null
  appliedAt?: string | null
  status: JobStatus
  jobUrl?: string | null
  notes?: string | null
}
