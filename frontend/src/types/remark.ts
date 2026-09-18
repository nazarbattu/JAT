export type Remark = {
  id: string
  threadId: string
  interactionId: string | null
  followUpId: string | null
  body: string
  recordedAt: string
  createdAt: string
  updatedAt: string
}

export type RemarkInput = {
  threadId: string
  interactionId?: string | null
  followUpId?: string | null
  body: string
  recordedAt?: string | null
}
