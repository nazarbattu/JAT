import { api } from "@/lib/api"
import type { Remark, RemarkInput } from "@/types/remark"

export const remarkKeys = {
  all: ["remarks"] as const,
  byThread: (threadId: string) =>
    [...remarkKeys.all, "thread", threadId] as const,
}

export function listRemarks(threadId: string) {
  return api<Remark[]>(
    `/api/remarks?threadId=${encodeURIComponent(threadId)}`,
  )
}

export function createRemark(input: RemarkInput) {
  return api<Remark>("/api/remarks", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateRemark(id: string, input: Partial<RemarkInput>) {
  return api<Remark>(`/api/remarks/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteRemark(id: string) {
  return api<void>(`/api/remarks/${id}`, {
    method: "DELETE",
  })
}

export async function upsertLinkedRemark(options: {
  threadId: string
  interactionId?: string | null
  followUpId?: string | null
  existing?: Remark | null
  body?: string | null
  recordedAt?: string | null
}) {
  const body = options.body?.trim() ?? ""
  if (!body) {
    if (options.existing) {
      await deleteRemark(options.existing.id)
    }
    return null
  }

  if (options.existing) {
    return updateRemark(options.existing.id, {
      body,
      recordedAt: options.recordedAt ?? options.existing.recordedAt,
      interactionId: options.interactionId ?? options.existing.interactionId,
      followUpId: options.followUpId ?? options.existing.followUpId,
    })
  }

  return createRemark({
    threadId: options.threadId,
    interactionId: options.interactionId ?? null,
    followUpId: options.followUpId ?? null,
    body,
    recordedAt: options.recordedAt ?? null,
  })
}
