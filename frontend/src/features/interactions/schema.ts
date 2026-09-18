import { z } from "zod"
import { INTERACTION_CHANNELS, INTERACTION_DIRECTIONS } from "@/types/interaction"

export const interactionSchema = z.object({
  direction: z.enum(INTERACTION_DIRECTIONS),
  channel: z.enum(INTERACTION_CHANNELS),
  occurredAt: z.string().trim().min(1, "When is required"),
  subject: z.string().trim(),
  summary: z.string().trim(),
  externalRef: z.string().trim(),
  contactId: z.string().uuid("Select a contact"),
  remark: z.string().trim(),
})

export type InteractionFormValues = z.infer<typeof interactionSchema>
