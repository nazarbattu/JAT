export type Company = {
  id: string
  name: string
  website: string | null
  careersUrl: string | null
  location: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type CompanyInput = {
  name: string
  website?: string | null
  careersUrl?: string | null
  location?: string | null
  notes?: string | null
}
