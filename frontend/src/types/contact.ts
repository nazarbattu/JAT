export type Contact = {
  id: string
  companyId: string
  name: string
  position: string | null
  emails: string[]
  phones: string[]
  linkedinUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type ContactInput = {
  companyId: string
  name: string
  position?: string | null
  emails?: string[]
  phones?: string[]
  linkedinUrl?: string | null
  notes?: string | null
}
