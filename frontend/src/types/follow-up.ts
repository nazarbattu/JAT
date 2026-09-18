import type { InteractionChannel } from "@/types/interaction"

export const FOLLOW_UP_SOURCES = [
  "fixed_interval",
  "suggested_by_them",
  "manual",
] as const
export type FollowUpSource = (typeof FOLLOW_UP_SOURCES)[number]

export const FOLLOW_UP_SOURCE_LABELS: Record<FollowUpSource, string> = {
  fixed_interval: "Fixed interval",
  suggested_by_them: "Suggested by them",
  manual: "Manual",
}

export const FOLLOW_UP_STATUSES = [
  "pending",
  "done",
  "skipped",
  "cancelled",
] as const
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number]

export const FOLLOW_UP_STATUS_LABELS: Record<FollowUpStatus, string> = {
  pending: "Pending",
  done: "Done",
  skipped: "Skipped",
  cancelled: "Cancelled",
}

export type FollowUp = {
  id: string
  threadId: string
  dueAt: string
  source: FollowUpSource
  intervalDays: number | null
  suggestedNote: string | null
  channelHint: InteractionChannel | null
  contactId: string | null
  status: FollowUpStatus
  completedAt: string | null
  completedInteractionId: string | null
  createdAt: string
  updatedAt: string
}

export type FollowUpInput = {
  threadId: string
  dueAt: string
  source: FollowUpSource
  intervalDays?: number | null
  suggestedNote?: string | null
  channelHint?: InteractionChannel | null
  contactId?: string | null
  status?: FollowUpStatus
  completedAt?: string | null
  completedInteractionId?: string | null
  remark?: string | null
}
