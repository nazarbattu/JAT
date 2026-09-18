import { api } from "@/lib/api"
import type { Job, JobInput, JobStatus } from "@/types/job"

export const jobKeys = {
  all: ["jobs"] as const,
  lists: () => [...jobKeys.all, "list"] as const,
  list: (filters?: { companyId?: string; status?: JobStatus }) =>
    [...jobKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...jobKeys.all, "detail", id] as const,
}

export function listJobs(filters?: { companyId?: string; status?: JobStatus }) {
  const params = new URLSearchParams()
  if (filters?.companyId) params.set("companyId", filters.companyId)
  if (filters?.status) params.set("status", filters.status)
  const query = params.toString()
  return api<Job[]>(`/api/jobs${query ? `?${query}` : ""}`)
}

export function getJob(id: string) {
  return api<Job>(`/api/jobs/${id}`)
}

export function createJob(input: JobInput) {
  return api<Job>("/api/jobs", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateJob(id: string, input: JobInput) {
  return api<Job>(`/api/jobs/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteJob(id: string) {
  return api<void>(`/api/jobs/${id}`, {
    method: "DELETE",
  })
}
