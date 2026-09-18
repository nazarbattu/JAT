export type Contact = {
  id: string
  employerCompanyId: string
  hiringCompanyIds: string[]
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
  employerCompanyId: string
  hiringCompanyIds: string[]
  name: string
  position?: string | null
  emails?: string[]
  phones?: string[]
  linkedinUrl?: string | null
  notes?: string | null
}
