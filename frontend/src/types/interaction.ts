export const INTERACTION_DIRECTIONS = ["inbound", "outbound"] as const
export type InteractionDirection = (typeof INTERACTION_DIRECTIONS)[number]

export const INTERACTION_CHANNELS = [
  "call",
  "email",
  "whatsapp",
  "sms",
  "meeting",
  "other",
] as const
export type InteractionChannel = (typeof INTERACTION_CHANNELS)[number]

export const INTERACTION_CHANNEL_LABELS: Record<InteractionChannel, string> = {
  call: "Call",
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  meeting: "Meeting",
  other: "Other",
}

export const INTERACTION_DIRECTION_LABELS: Record<InteractionDirection, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
}

export type Interaction = {
  id: string
  threadId: string
  direction: InteractionDirection
  channel: InteractionChannel
  occurredAt: string
  subject: string | null
  summary: string | null
  externalRef: string | null
  createdAt: string
  updatedAt: string
}

export type InteractionInput = {
  threadId: string
  direction: InteractionDirection
  channel: InteractionChannel
  occurredAt: string
  subject?: string | null
  summary?: string | null
  externalRef?: string | null
  contactId: string
  remark?: string | null
}

export type InteractionContact = {
  id: string
  interactionId: string
  contactId: string
  createdAt: string
  updatedAt: string
}
