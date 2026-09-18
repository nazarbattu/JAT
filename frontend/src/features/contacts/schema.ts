import { z } from "zod"
import { optionalEmail, optionalHttpUrl } from "@/lib/validation"

const contactFieldsSchema = z.object({
  employerCompanyId: z.string().uuid("Select who they work for"),
  hiringForEmployer: z.boolean(),
  otherHiringCompanyIds: z.array(z.string().uuid()),
  name: z.string().trim().min(1, "Name is required"),
  position: z.string().trim(),
  emails: z.array(optionalEmail),
  phones: z.array(z.string().trim()),
  linkedinUrl: optionalHttpUrl,
  notes: z.string().trim(),
})

export type ContactFormValues = z.infer<typeof contactFieldsSchema>

export function buildHiringCompanyIds(
  values: Pick<
    ContactFormValues,
    "employerCompanyId" | "hiringForEmployer" | "otherHiringCompanyIds"
  >,
  requiredHiringCompanyId?: string,
): string[] {
  const hiring = new Set(values.otherHiringCompanyIds)
  if (values.hiringForEmployer && values.employerCompanyId) {
    hiring.add(values.employerCompanyId)
  }
  if (requiredHiringCompanyId) {
    hiring.add(requiredHiringCompanyId)
  }
  return [...hiring]
}

export function createContactSchema(requiredHiringCompanyId?: string) {
  return contactFieldsSchema.superRefine((values, ctx) => {
    if (buildHiringCompanyIds(values, requiredHiringCompanyId).length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["hiringForEmployer"],
        message: "Select at least one company they hire for",
      })
    }
  })
}

/** Default schema when no thread company is forced into hiring-for. */
export const contactSchema = createContactSchema()
