import { z } from "zod"
import { optionalEmail, optionalHttpUrl } from "@/lib/validation"

export const contactSchema = z.object({
  companyId: z.string().uuid("Select a company"),
  name: z.string().trim().min(1, "Name is required"),
  position: z.string().trim(),
  emails: z.array(optionalEmail),
  phones: z.array(z.string().trim()),
  linkedinUrl: optionalHttpUrl,
  notes: z.string().trim(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
