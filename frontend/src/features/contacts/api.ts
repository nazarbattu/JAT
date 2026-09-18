import { api } from "@/lib/api"
import type { Contact, ContactInput } from "@/types/contact"

export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  listByCompany: (companyId: string) =>
    [...contactKeys.lists(), { companyId }] as const,
  detail: (id: string) => [...contactKeys.all, "detail", id] as const,
}

export function listContacts(companyId?: string) {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : ""
  return api<Contact[]>(`/api/contacts${query}`)
}

export function getContact(id: string) {
  return api<Contact>(`/api/contacts/${id}`)
}

export function createContact(input: ContactInput) {
  return api<Contact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateContact(id: string, input: ContactInput) {
  return api<Contact>(`/api/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function deleteContact(id: string) {
  return api<void>(`/api/contacts/${id}`, {
    method: "DELETE",
  })
}
