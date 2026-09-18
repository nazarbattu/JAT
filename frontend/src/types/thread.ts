export const THREAD_STATUSES = [
  "active",
  "waiting_on_them",
  "waiting_on_me",
  "paused",
  "closed_won",
  "closed_lost",
  "closed_ghosted",
] as const

export type ThreadStatus = (typeof THREAD_STATUSES)[number]

export const THREAD_STATUS_LABELS: Record<ThreadStatus, string> = {
  active: "Active",
  waiting_on_them: "Waiting on them",
  waiting_on_me: "Waiting on me",
  paused: "Paused",
  closed_won: "Closed · won",
  closed_lost: "Closed · lost",
  closed_ghosted: "Closed · ghosted",
}

export const THREAD_ORIGINS = [
  "inbound",
  "outbound",
  "portal_then_inbound",
  "portal_then_outbound",
] as const

export type ThreadOrigin = (typeof THREAD_ORIGINS)[number]

export const THREAD_ORIGIN_LABELS: Record<ThreadOrigin, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
  portal_then_inbound: "Portal → inbound",
  portal_then_outbound: "Portal → outbound",
}

export type JobThread = {
  id: string
  jobId: string
  origin: ThreadOrigin | null
  status: ThreadStatus
  nextFollowUpAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ThreadUpdateInput = {
  origin?: ThreadOrigin | null
  status?: ThreadStatus
  nextFollowUpAt?: string | null
  closedAt?: string | null
}

export type ThreadContact = {
  id: string
  threadId: string
  contactId: string
  roleOnThread: string | null
  createdAt: string
  updatedAt: string
}

export type ThreadContactInput = {
  threadId: string
  contactId: string
  roleOnThread?: string | null
}
