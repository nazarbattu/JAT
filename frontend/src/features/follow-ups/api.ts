import { api } from "@/lib/api"
import { upsertLinkedRemark } from "@/features/remarks/api"
import type { FollowUp, FollowUpInput } from "@/types/follow-up"
import type { Remark } from "@/types/remark"

export const followUpKeys = {
  all: ["follow-ups"] as const,
  byThread: (threadId: string) =>
    [...followUpKeys.all, "thread", threadId] as const,
}

export function listFollowUps(threadId: string) {
  return api<FollowUp[]>(
    `/api/follow-ups?threadId=${encodeURIComponent(threadId)}`,
  )
}

function stripRemark(input: FollowUpInput) {
  const { remark: _remark, ...rest } = input
  return rest
}

export function createFollowUp(input: FollowUpInput) {
  return api<FollowUp>("/api/follow-ups", {
    method: "POST",
    body: JSON.stringify(stripRemark(input)),
  })
}

export function updateFollowUp(id: string, input: Partial<FollowUpInput>) {
  return api<FollowUp>(`/api/follow-ups/${id}`, {
    method: "PUT",
    body: JSON.stringify(stripRemark(input as FollowUpInput)),
  })
}

export async function createFollowUpWithRemark(input: FollowUpInput) {
  const followUp = await createFollowUp(input)
  await upsertLinkedRemark({
    threadId: followUp.threadId,
    followUpId: followUp.id,
    body: input.remark,
    recordedAt: followUp.dueAt,
  })
  return followUp
}

export async function updateFollowUpWithRemark(
  id: string,
  input: FollowUpInput,
  existingRemark?: Remark | null,
) {
  const followUp = await updateFollowUp(id, input)
  await upsertLinkedRemark({
    threadId: followUp.threadId,
    followUpId: followUp.id,
    existing: existingRemark,
    body: input.remark,
    recordedAt: followUp.dueAt,
  })
  return followUp
}

export function deleteFollowUp(id: string) {
  return api<void>(`/api/follow-ups/${id}`, {
    method: "DELETE",
  })
}
