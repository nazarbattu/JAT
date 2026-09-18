import { api } from "@/lib/api"
import type { Company, CompanyInput } from "@/types/company"

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const,
}

export function listCompanies() {
  return api<Company[]>("/api/companies")
}

export function getCompany(id: string) {
  return api<Company>(`/api/companies/${id}`)
}

export function createCompany(input: CompanyInput) {
  return api<Company>("/api/companies", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateCompany(id: string, input: CompanyInput) {
  return api<Company>(`/api/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteCompany(id: string) {
  return api<void>(`/api/companies/${id}`, {
    method: "DELETE",
  })
}
