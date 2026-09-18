import { z } from "zod"
import { INTERACTION_CHANNELS } from "@/types/interaction"
import { FOLLOW_UP_SOURCES } from "@/types/follow-up"

export const followUpSchema = z.object({
  dueAt: z.string().trim().min(1, "Due date is required"),
  source: z.enum(FOLLOW_UP_SOURCES),
  intervalDays: z.string().trim(),
  suggestedNote: z.string().trim(),
  channelHint: z.enum(INTERACTION_CHANNELS).nullable(),
  contactId: z.string().uuid("Select a contact"),
  remark: z.string().trim(),
})

export type FollowUpFormValues = z.infer<typeof followUpSchema>
