import { api } from "@/lib/api"
import type {
  JobThread,
  ThreadContact,
  ThreadContactInput,
  ThreadUpdateInput,
} from "@/types/thread"

export const threadKeys = {
  all: ["threads"] as const,
  lists: () => [...threadKeys.all, "list"] as const,
  byJob: (jobId: string) => [...threadKeys.all, "by-job", jobId] as const,
  detail: (id: string) => [...threadKeys.all, "detail", id] as const,
  contacts: (threadId: string) =>
    [...threadKeys.all, "contacts", threadId] as const,
}

export function getThread(id: string) {
  return api<JobThread>(`/api/threads/${id}`)
}

export function getThreadByJobId(jobId: string) {
  return api<JobThread>(`/api/threads/by-job/${jobId}`)
}

export function updateThread(id: string, input: ThreadUpdateInput) {
  return api<JobThread>(`/api/threads/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function listThreadContacts(threadId: string) {
  return api<ThreadContact[]>(
    `/api/thread-contacts?threadId=${encodeURIComponent(threadId)}`,
  )
}

export function createThreadContact(input: ThreadContactInput) {
  return api<ThreadContact>("/api/thread-contacts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function deleteThreadContact(id: string) {
  return api<void>(`/api/thread-contacts/${id}`, {
    method: "DELETE",
  })
}
