import { z } from "zod"
import { optionalHttpUrl } from "@/lib/validation"

export const companySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  website: optionalHttpUrl,
  careersUrl: optionalHttpUrl,
  location: z.string().trim(),
  notes: z.string().trim(),
})

export type CompanyFormValues = z.infer<typeof companySchema>
