import { api } from "@/lib/api"
import { upsertLinkedRemark } from "@/features/remarks/api"
import type {
  Interaction,
  InteractionContact,
  InteractionInput,
} from "@/types/interaction"
import type { Remark } from "@/types/remark"

export const interactionKeys = {
  all: ["interactions"] as const,
  byThread: (threadId: string) =>
    [...interactionKeys.all, "thread", threadId] as const,
  contactsByThread: (threadId: string) =>
    [...interactionKeys.all, "contacts", "thread", threadId] as const,
}

export function listInteractions(threadId: string) {
  return api<Interaction[]>(
    `/api/interactions?threadId=${encodeURIComponent(threadId)}`,
  )
}

export function listInteractionContactsByThread(threadId: string) {
  return api<InteractionContact[]>(
    `/api/interaction-contacts?threadId=${encodeURIComponent(threadId)}`,
  )
}

export function listInteractionContacts(interactionId: string) {
  return api<InteractionContact[]>(
    `/api/interaction-contacts?interactionId=${encodeURIComponent(interactionId)}`,
  )
}

export function createInteraction(input: Omit<InteractionInput, "contactId" | "remark">) {
  return api<Interaction>("/api/interactions", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function updateInteraction(
  id: string,
  input: Omit<InteractionInput, "contactId" | "remark">,
) {
  return api<Interaction>(`/api/interactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export function createInteractionContact(input: {
  interactionId: string
  contactId: string
}) {
  return api<InteractionContact>("/api/interaction-contacts", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function deleteInteractionContact(id: string) {
  return api<void>(`/api/interaction-contacts/${id}`, {
    method: "DELETE",
  })
}

async function syncInteractionContact(
  interactionId: string,
  contactId: string,
) {
  const existing = await listInteractionContacts(interactionId)
  const current = existing[0]
  if (current?.contactId === contactId) return current

  await Promise.all(existing.map((link) => deleteInteractionContact(link.id)))
  return createInteractionContact({ interactionId, contactId })
}

export async function createInteractionWithContact(input: InteractionInput) {
  const { contactId, remark, ...interactionInput } = input
  const interaction = await createInteraction(interactionInput)
  await createInteractionContact({
    interactionId: interaction.id,
    contactId,
  })
  await upsertLinkedRemark({
    threadId: interaction.threadId,
    interactionId: interaction.id,
    body: remark,
    recordedAt: interaction.occurredAt,
  })
  return interaction
}

export async function updateInteractionWithContact(
  id: string,
  input: InteractionInput,
  existingRemark?: Remark | null,
) {
  const { contactId, remark, ...interactionInput } = input
  const interaction = await updateInteraction(id, interactionInput)
  await syncInteractionContact(id, contactId)
  await upsertLinkedRemark({
    threadId: interaction.threadId,
    interactionId: interaction.id,
    existing: existingRemark,
    body: remark,
    recordedAt: interaction.occurredAt,
  })
  return interaction
}

export function deleteInteraction(id: string) {
  return api<void>(`/api/interactions/${id}`, {
    method: "DELETE",
  })
}
